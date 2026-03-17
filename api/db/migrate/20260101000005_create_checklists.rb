class CreateChecklists < ActiveRecord::Migration[7.1]
  def change
    create_table :checklists, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :project, type: :uuid, null: false, foreign_key: true
      t.references :checklist_template, type: :uuid, null: true, foreign_key: true
      t.string     :name, null: false
      t.integer    :position, null: false, default: 1

      t.timestamps
    end

    add_index :checklists, [:project_id, :position]
  end
end
