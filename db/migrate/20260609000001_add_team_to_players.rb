class AddTeamToPlayers < ActiveRecord::Migration[7.2]
  def change
    add_column :players, :team, :string
    add_index :players, :team
  end
end
