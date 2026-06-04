# Idempotent seed data: office players + a few sample matches.
# Safe to run multiple times.

players = [
  { name: "Nicolás", age: 31, dominant_hand: "right" },
  { name: "Camila",  age: 28, dominant_hand: "left" },
  { name: "Diego",   age: 35, dominant_hand: "right" },
  { name: "Valentina", age: 26, dominant_hand: "right" },
  { name: "Matías",  age: 40, dominant_hand: "left" },
  { name: "Fernanda", age: 33, dominant_hand: "right" },
  { name: "Joaquín", age: 24, dominant_hand: "ambidextrous" },
  { name: "Antonia", age: 29, dominant_hand: "right" },
]

records = players.map { |attrs| Player.find_or_create_by!(name: attrs[:name]) { |p| p.assign_attributes(attrs) } }

if Match.count.zero?
  nico, cami, diego, vale, matias, fer = records
  Match.create!(winner: nico,  loser: cami,   target: 21, winner_score: 21, loser_score: 18)
  Match.create!(winner: diego, loser: vale,   target: 11, winner_score: 11, loser_score: 9)
  Match.create!(winner: cami,  loser: matias, target: 11)
  Match.create!(winner: vale,  loser: fer,    target: 21, winner_score: 21, loser_score: 12)
  Match.create!(winner: nico,  loser: diego,  target: 11, winner_score: 13, loser_score: 11)
end

puts "Seed listo: #{Player.count} jugadores, #{Match.count} partidos."
