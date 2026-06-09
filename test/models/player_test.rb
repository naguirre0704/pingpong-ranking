require "test_helper"

class PlayerTest < ActiveSupport::TestCase
  test "valido sin edad (campo opcional)" do
    player = Player.new(name: "Sin Edad", dominant_hand: "right")
    assert player.valid?, player.errors.full_messages.to_sentence
  end

  test "edad invalida si se entrega fuera de rango" do
    player = Player.new(name: "Rara", dominant_hand: "right", age: 200)
    assert_not player.valid?
  end

  test "nombre es obligatorio" do
    assert_not Player.new(dominant_hand: "right").valid?
  end

  test "mano habil debe ser valida" do
    assert_not Player.new(name: "X", dominant_hand: "tres_manos").valid?
  end

  test "valido sin equipo (campo opcional)" do
    player = Player.new(name: "Sin Equipo", dominant_hand: "right")
    assert player.valid?, player.errors.full_messages.to_sentence
  end

  test "equipo debe pertenecer a la lista" do
    assert_not Player.new(name: "Y", dominant_hand: "right", team: "Marketing").valid?
    assert Player.new(name: "Z", dominant_hand: "right", team: "Tecnología").valid?
  end
end
