module Api
  # Validates the shared PIN so the front-end can store it and unlock writes.
  class SessionsController < BaseController
    def create
      expected = ENV["APP_PIN"].to_s
      provided = params[:pin].to_s

      if expected.present? && ActiveSupport::SecurityUtils.secure_compare(provided, expected)
        render json: { ok: true }
      else
        render json: { ok: false, error: "PIN incorrecto" }, status: :unauthorized
      end
    end
  end
end
