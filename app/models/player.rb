class Player < ApplicationRecord
  DOMINANT_HANDS = %w[right left ambidextrous].freeze
  # Fixed roster of office teams. Optional on the record (existing players
  # predate it), but the product asks for it on every new/edited player.
  TEAMS = [
    "Tecnología", "Customer Success", "Ventas", "Onboarding",
    "Soporte", "Finanzas", "RRHH", "Revops"
  ].freeze

  has_many :won_matches,  class_name: "Match", foreign_key: :winner_id, dependent: :restrict_with_error
  has_many :lost_matches, class_name: "Match", foreign_key: :loser_id,  dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: { case_sensitive: false }
  # Age is kept in the DB but optional (no longer collected in the product).
  validates :age, numericality: { only_integer: true, greater_than: 0, less_than: 120 }, allow_nil: true
  validates :dominant_hand, presence: true, inclusion: { in: DOMINANT_HANDS }
  validates :team, inclusion: { in: TEAMS }, allow_nil: true

  scope :active, -> { where(active: true) }

  def matches_played
    won_count + lost_count
  end

  # These read from preloaded counters when available (see Ranking query),
  # falling back to a query otherwise.
  def won_count
    self[:won_count] || won_matches.count
  end

  def lost_count
    self[:lost_count] || lost_matches.count
  end
end
