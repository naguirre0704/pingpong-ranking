class CreateMatches < ActiveRecord::Migration[7.2]
  def change
    create_table :matches do |t|
      t.references :winner, null: false, foreign_key: { to_table: :players }
      t.references :loser,  null: false, foreign_key: { to_table: :players }

      t.integer :target, null: false # 11 or 21
      t.integer :winner_score       # optional full result
      t.integer :loser_score        # optional; enables the loser bonus point

      # Points are computed at write time and stored, so the ranking stays
      # stable even if the scoring rules change later.
      t.integer :winner_points, null: false, default: 0
      t.integer :loser_points,  null: false, default: 0

      t.datetime :played_at, null: false

      t.timestamps
    end

    add_index :matches, :played_at
  end
end
