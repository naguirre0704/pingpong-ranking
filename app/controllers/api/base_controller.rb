module Api
  class BaseController < ActionController::Base
    # Same-origin JSON API gated by a shared PIN (no cookies / ambient auth),
    # so CSRF tokens add nothing here.
    skip_forgery_protection

    rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
    rescue_from ActiveRecord::RecordInvalid,  with: :render_invalid

    private

    # Require the shared team PIN (sent as X-App-Pin header) for write actions.
    def require_pin!
      expected = ENV["APP_PIN"].to_s
      provided = request.headers["X-App-Pin"].to_s

      return if expected.present? &&
                ActiveSupport::SecurityUtils.secure_compare(provided, expected)

      render json: { error: "PIN incorrecto" }, status: :unauthorized
    end

    def render_not_found
      render json: { error: "No encontrado" }, status: :not_found
    end

    def render_invalid(exception)
      render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_entity
    end

    def player_json(player)
      {
        id: player.id,
        name: player.name,
        age: player.age,
        dominant_hand: player.dominant_hand,
        active: player.active,
      }
    end

    def match_json(match)
      {
        id: match.id,
        target: match.target,
        winner: { id: match.winner_id, name: match.winner.name },
        loser: { id: match.loser_id, name: match.loser.name },
        winner_score: match.winner_score,
        loser_score: match.loser_score,
        winner_points: match.winner_points,
        loser_points: match.loser_points,
        result_recorded: match.result_recorded?,
        played_at: match.played_at.iso8601,
      }
    end
  end
end
