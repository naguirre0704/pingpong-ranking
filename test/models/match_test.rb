require "test_helper"

class MatchTest < ActiveSupport::TestCase
  setup do
    @ana = Player.create!(name: "Ana", age: 30, dominant_hand: "right")
    @beto = Player.create!(name: "Beto", age: 28, dominant_hand: "left")
  end

  test "asigna puntos al guardar (a 11, perdedor 9 -> 2 y 1)" do
    m = Match.create!(winner: @ana, loser: @beto, target: 11, winner_score: 11, loser_score: 9)
    assert_equal 2, m.winner_points
    assert_equal 1, m.loser_points
  end

  test "a 21 sin marcador -> 3 y 0" do
    m = Match.create!(winner: @ana, loser: @beto, target: 21)
    assert_equal 3, m.winner_points
    assert_equal 0, m.loser_points
  end

  test "ganador y perdedor no pueden ser el mismo" do
    m = Match.new(winner: @ana, loser: @ana, target: 11)
    assert_not m.valid?
    assert_includes m.errors[:loser].join, "mismo jugador"
  end

  test "resultado parcial (solo un marcador) es invalido" do
    m = Match.new(winner: @ana, loser: @beto, target: 11, winner_score: 11)
    assert_not m.valid?
  end

  test "deuce valido: 13-11" do
    m = Match.new(winner: @ana, loser: @beto, target: 11, winner_score: 13, loser_score: 11)
    assert m.valid?, m.errors.full_messages.to_sentence
  end

  test "deuce invalido: 12-11 (no gana por 2)" do
    m = Match.new(winner: @ana, loser: @beto, target: 11, winner_score: 12, loser_score: 11)
    assert_not m.valid?
  end

  test "target fuera de 11/21 es invalido" do
    m = Match.new(winner: @ana, loser: @beto, target: 15)
    assert_not m.valid?
  end

  test "sin resultado es valido (resultado opcional)" do
    m = Match.new(winner: @ana, loser: @beto, target: 11)
    assert m.valid?, m.errors.full_messages.to_sentence
  end
end
