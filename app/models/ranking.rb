# Computes the standings for all active players from stored match points.
# Returns plain rows; the front-end renders both the "points" and the
# "win %" views from the same data.
class Ranking
  Row = Struct.new(
    :player, :points, :wins, :losses, :played, :win_rate,
    keyword_init: true,
  )

  def self.rows
    new.rows
  end

  def rows
    won  = aggregate(:winner_id, :winner_points)
    lost = aggregate(:loser_id, :loser_points)

    Player.active.order(:name).map do |player|
      wins,   win_points  = won.fetch(player.id, [0, 0])
      losses, lose_points = lost.fetch(player.id, [0, 0])
      played = wins + losses

      Row.new(
        player: player,
        points: win_points + lose_points,
        wins: wins,
        losses: losses,
        played: played,
        win_rate: played.zero? ? 0.0 : (wins.to_f / played),
      )
    end.sort_by { |r| [-r.points, -r.wins, -r.win_rate, r.player.name] }
  end

  private

  # => { player_id => [match_count, points_sum] }
  def aggregate(group_column, points_column)
    Match
      .group(group_column)
      .pluck(group_column, Arel.sql("COUNT(*)"), Arel.sql("COALESCE(SUM(#{points_column}), 0)"))
      .each_with_object({}) { |(id, count, points), acc| acc[id] = [count, points] }
  end
end
