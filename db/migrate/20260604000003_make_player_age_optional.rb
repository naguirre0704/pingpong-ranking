class MakePlayerAgeOptional < ActiveRecord::Migration[7.2]
  def change
    # Keep the column (history), but it's no longer required by the product.
    change_column_null :players, :age, true
  end
end
