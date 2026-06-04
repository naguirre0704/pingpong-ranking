require "test_helper"

class MatchScoringTest < ActiveSupport::TestCase
  def points(target:, loser_score:)
    MatchScoring.call(target:, loser_score:)
  end

  # --- Partidos a 11 (base 2) ---
  test "a 11 sin marcador: ganador 2, perdedor 0" do
    assert_equal({ winner_points: 2, loser_points: 0 }, points(target: 11, loser_score: nil))
  end

  test "a 11 con perdedor en 7: sin bonus" do
    assert_equal 0, points(target: 11, loser_score: 7)[:loser_points]
  end

  test "a 11 con perdedor en 8: aun sin bonus (no es > 8)" do
    assert_equal 0, points(target: 11, loser_score: 8)[:loser_points]
  end

  test "a 11 con perdedor en 9: bonus 1" do
    assert_equal 1, points(target: 11, loser_score: 9)[:loser_points]
  end

  test "a 11 con perdedor en 10: bonus 1" do
    assert_equal 1, points(target: 11, loser_score: 10)[:loser_points]
  end

  test "a 11 en deuce 32-30: perdedor supera el umbral, bonus 1" do
    assert_equal 1, points(target: 11, loser_score: 30)[:loser_points]
  end

  # --- Partidos a 21 (base 3) ---
  test "a 21 sin marcador: ganador 3, perdedor 0" do
    assert_equal({ winner_points: 3, loser_points: 0 }, points(target: 21, loser_score: nil))
  end

  test "a 21 con perdedor en 15: sin bonus (no es > 15)" do
    assert_equal 0, points(target: 21, loser_score: 15)[:loser_points]
  end

  test "a 21 con perdedor en 16: bonus 1" do
    assert_equal 1, points(target: 21, loser_score: 16)[:loser_points]
  end

  test "a 21 con perdedor en 20: bonus 1" do
    assert_equal 1, points(target: 21, loser_score: 20)[:loser_points]
  end

  test "target invalido revienta (debe validarse antes)" do
    assert_raises(KeyError) { points(target: 15, loser_score: 0) }
  end
end
