class CreateChecklistItems < ActiveRecord::Migration[7.1]
  def change
    create_table :checklist_items, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :checklist, type: :uuid, null: false, foreign_key: true
      t.references :completed_by, type: :uuid, null: true,
                   foreign_key: { to_table: :users }
      t.string     :title, null: false
      t.string     :status, null: false, default: "incomplete"
      t.integer    :position, null: false, default: 1
      t.datetime   :completed_at
      t.string     :completed_via
      t.string     :photo_url
      t.string     :photo_thumbnail_url
      t.text       :notes
      t.float      :ai_confidence
      t.text       :voice_transcription

      t.timestamps
    end

    add_index :checklist_items, [:checklist_id, :position]
    add_index :checklist_items, :status
  end
end
