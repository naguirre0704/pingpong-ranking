module Api
  class RankingController < BaseController
    def index
      rows = Ranking.rows.each_with_index.map do |row, i|
        {
          position: i + 1,
          player: { id: row.player.id, name: row.player.name, team: row.player.team },
          points: row.points,
          wins: row.wins,
          losses: row.losses,
          played: row.played,
          win_rate: row.win_rate.round(4),
        }
      end

      render json: { ranking: rows }
    end
  end
end
