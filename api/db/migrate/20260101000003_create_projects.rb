class CreateProjects < ActiveRecord::Migration[7.1]
  def change
    create_table :projects, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string     :name, null: false
      t.string     :address
      t.string     :trade_type
      t.text       :notes

      t.timestamps
    end

    add_index :projects, [:user_id, :updated_at]
    add_index :projects, :name
  end
end
