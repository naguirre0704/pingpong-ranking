class CreatePlayers < ActiveRecord::Migration[7.2]
  def change
    create_table :players do |t|
      t.string  :name, null: false
      t.integer :age, null: false
      t.string  :dominant_hand, null: false # right | left | ambidextrous
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :players, :name, unique: true
    add_index :players, :active
  end
end
