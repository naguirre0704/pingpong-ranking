# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_06_09_000001) do
  create_table "matches", force: :cascade do |t|
    t.integer "winner_id", null: false
    t.integer "loser_id", null: false
    t.integer "target", null: false
    t.integer "winner_score"
    t.integer "loser_score"
    t.integer "winner_points", default: 0, null: false
    t.integer "loser_points", default: 0, null: false
    t.datetime "played_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["loser_id"], name: "index_matches_on_loser_id"
    t.index ["played_at"], name: "index_matches_on_played_at"
    t.index ["winner_id"], name: "index_matches_on_winner_id"
  end

  create_table "players", force: :cascade do |t|
    t.string "name", null: false
    t.integer "age"
    t.string "dominant_hand", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "team"
    t.index ["active"], name: "index_players_on_active"
    t.index ["name"], name: "index_players_on_name", unique: true
    t.index ["team"], name: "index_players_on_team"
  end

  add_foreign_key "matches", "players", column: "loser_id"
  add_foreign_key "matches", "players", column: "winner_id"
end
