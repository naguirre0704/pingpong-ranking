require "test_helper"

class ApiFlowTest < ActionDispatch::IntegrationTest
  PIN = "9999".freeze

  setup do
    ENV["APP_PIN"] = PIN
    @ana  = Player.create!(name: "Ana", age: 30, dominant_hand: "right")
    @beto = Player.create!(name: "Beto", age: 28, dominant_hand: "left")
  end

  def auth = { "X-App-Pin" => PIN }

  test "ranking lists active players ordered by points" do
    # Ana beats Beto to 21 (3 pts). Beto beats Ana to 11 with Ana scoring 9 (2 + 1 bonus).
    Match.create!(winner: @ana, loser: @beto, target: 21)
    Match.create!(winner: @beto, loser: @ana, target: 11, winner_score: 11, loser_score: 9)

    get "/api/ranking"
    assert_response :success
    body = JSON.parse(response.body)["ranking"]

    assert_equal 2, body.size
    assert_equal 1, body.first["position"]
    # Ana: 3 (win) + 1 (bonus loss) = 4 ; Beto: 2 -> Ana leads.
    assert_equal "Ana", body.first["player"]["name"]
    assert_equal 4, body.first["points"]
    assert_equal 2, body.first["played"]
  end

  test "creating a player requires the PIN" do
    post "/api/players", params: { player: { name: "Caro", age: 25, dominant_hand: "right" } }, as: :json
    assert_response :unauthorized

    post "/api/players",
         params: { player: { name: "Caro", age: 25, dominant_hand: "right" } },
         headers: auth, as: :json
    assert_response :created
    assert_equal "Caro", JSON.parse(response.body)["player"]["name"]
  end

  test "creating a match stores computed points" do
    post "/api/matches",
         params: { match: { winner_id: @ana.id, loser_id: @beto.id, target: 11, winner_score: 11, loser_score: 10 } },
         headers: auth, as: :json
    assert_response :created
    match = JSON.parse(response.body)["match"]
    assert_equal 2, match["winner_points"]
    assert_equal 1, match["loser_points"]
    assert_equal true, match["result_recorded"]
  end

  test "invalid match returns errors" do
    post "/api/matches",
         params: { match: { winner_id: @ana.id, loser_id: @ana.id, target: 11 } },
         headers: auth, as: :json
    assert_response :unprocessable_entity
    assert JSON.parse(response.body)["errors"].any?
  end

  test "archiving a player with matches keeps them but inactive" do
    Match.create!(winner: @ana, loser: @beto, target: 21)
    delete "/api/players/#{@ana.id}", headers: auth
    assert_response :success
    assert_equal false, @ana.reload.active
  end
end
