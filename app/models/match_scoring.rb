# Single source of truth for how a match awards ranking points.
#
# Rules:
#   - Win to 11 -> 2 points. Win to 21 -> 3 points.
#   - Loser bonus (+1) when their score is recorded and beats the threshold:
#       * to 11: loser scored > 8  (9 or more, incl. deuce like 12-10 / 32-30)
#       * to 21: loser scored > 15 (16 or more)
#   - Without a recorded score the bonus can't be known, so it's 0.
class MatchScoring
  BASE_POINTS      = { 11 => 2, 21 => 3 }.freeze
  BONUS_THRESHOLD  = { 11 => 8, 21 => 15 }.freeze
  VALID_TARGETS    = BASE_POINTS.keys.freeze

  def self.call(target:, loser_score:)
    new(target:, loser_score:).call
  end

  def initialize(target:, loser_score:)
    @target = target
    @loser_score = loser_score
  end

  def call
    { winner_points:, loser_points: }
  end

  def winner_points
    BASE_POINTS.fetch(@target)
  end

  def loser_points
    return 0 if @loser_score.nil?

    @loser_score > BONUS_THRESHOLD.fetch(@target) ? 1 : 0
  end
end
