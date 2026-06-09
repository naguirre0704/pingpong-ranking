module Api
  class PlayersController < BaseController
    before_action :require_pin!, only: %i[create update destroy]
    before_action :set_player, only: %i[show update destroy]

    def index
      scope = params[:all] == "1" ? Player.all : Player.active
      render json: { players: scope.order(:name).map { |p| player_json(p) } }
    end

    def show
      render json: { player: player_json(@player) }
    end

    def create
      player = Player.create!(player_params)
      render json: { player: player_json(player) }, status: :created
    end

    def update
      @player.update!(player_params)
      render json: { player: player_json(@player) }
    end

    # Archive players that already have matches (keeps history intact);
    # hard-delete those who never played.
    def destroy
      if @player.won_matches.exists? || @player.lost_matches.exists?
        @player.update!(active: false)
        render json: { player: player_json(@player), archived: true }
      else
        @player.destroy!
        render json: { archived: false }
      end
    end

    private

    def set_player
      @player = Player.find(params[:id])
    end

    def player_params
      params.require(:player).permit(:name, :age, :dominant_hand, :active, :team)
    end
  end
end
