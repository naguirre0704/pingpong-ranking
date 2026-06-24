class Match < ApplicationRecord
  TARGETS = MatchScoring::VALID_TARGETS # [11, 21]

  belongs_to :winner, class_name: "Player"
  belongs_to :loser,  class_name: "Player"

  validates :target, inclusion: { in: TARGETS }
  validates :winner_score, :loser_score,
            numericality: { only_integer: true, greater_than_or_equal_to: 0 },
            allow_nil: true
  validate :distinct_players
  validate :result_is_complete_or_absent
  validate :result_is_coherent

  before_validation :set_played_at
  before_save :assign_points

  scope :recent, -> { order(played_at: :desc, id: :desc) }
  # Partidos entre dos jugadores, sin importar quién ganó.
  scope :between, ->(a, b) {
    where(winner_id: a, loser_id: b).or(where(winner_id: b, loser_id: a))
  }

  # True when a full result was recorded (both scores present).
  def result_recorded?
    winner_score.present? && loser_score.present?
  end

  private

  def set_played_at
    self.played_at ||= Time.current
  end

  def assign_points
    points = MatchScoring.call(target:, loser_score:)
    self.winner_points = points[:winner_points]
    self.loser_points  = points[:loser_points]
  end

  def distinct_players
    errors.add(:loser, "no puede ser el mismo jugador que el ganador") if winner_id.present? && winner_id == loser_id
  end

  # A result is optional, but if you record it you record both scores.
  def result_is_complete_or_absent
    return if winner_score.nil? == loser_score.nil?

    errors.add(:base, "Ingresa el resultado completo (ambos marcadores) o ninguno")
  end

  def result_is_coherent
    return unless result_recorded? && TARGETS.include?(target)

    if winner_score <= loser_score
      errors.add(:winner_score, "el ganador debe tener más puntos que el perdedor")
    elsif winner_score < target
      errors.add(:winner_score, "el ganador debe llegar al menos a #{target}")
    elsif winner_score > target && (winner_score - loser_score) != 2
      # Beyond the target you can only win by exactly 2 (deuce).
      errors.add(:base, "En deuce el ganador debe ganar por 2 (ej. #{target + 1}-#{target - 1})")
    end
  end
end
