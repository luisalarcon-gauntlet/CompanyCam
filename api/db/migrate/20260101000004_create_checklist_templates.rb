class CreateChecklistTemplates < ActiveRecord::Migration[7.1]
  def change
    create_table :checklist_templates, id: :uuid, default: "gen_random_uuid()" do |t|
      t.string  :name, null: false
      t.string  :trade_type
      t.jsonb   :items, null: false, default: []
      t.boolean :is_default, null: false, default: false

      t.timestamps
    end

    add_index :checklist_templates, :trade_type
    add_index :checklist_templates, :is_default
  end
end
