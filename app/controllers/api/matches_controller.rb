module Api
  class MatchesController < BaseController
    before_action :require_pin!, only: %i[create update destroy]
    before_action :set_match, only: %i[update destroy]

    def index
      matches = Match.recent.includes(:winner, :loser)
      if params[:player_a].present? && params[:player_b].present?
        matches = matches.between(params[:player_a], params[:player_b])
      end
      matches = matches.limit(limit)
      render json: { matches: matches.map { |m| match_json(m) } }
    end

    def create
      match = Match.create!(match_params)
      render json: { match: match_json(match) }, status: :created
    end

    def update
      @match.update!(match_params)
      render json: { match: match_json(@match) }
    end

    def destroy
      @match.destroy!
      head :no_content
    end

    private

    def set_match
      @match = Match.find(params[:id])
    end

    def limit
      [params.fetch(:limit, 100).to_i, 500].min
    end

    def match_params
      params.require(:match).permit(
        :winner_id, :loser_id, :target, :winner_score, :loser_score, :played_at,
      )
    end
  end
end
