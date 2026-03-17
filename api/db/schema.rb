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

ActiveRecord::Schema[7.1].define(version: 2026_01_01_000006) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "checklist_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "checklist_id", null: false
    t.uuid "completed_by_id"
    t.string "title", null: false
    t.string "status", default: "incomplete", null: false
    t.integer "position", default: 1, null: false
    t.datetime "completed_at"
    t.string "completed_via"
    t.string "photo_url"
    t.string "photo_thumbnail_url"
    t.text "notes"
    t.float "ai_confidence"
    t.text "voice_transcription"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id", "position"], name: "index_checklist_items_on_checklist_id_and_position"
    t.index ["checklist_id"], name: "index_checklist_items_on_checklist_id"
    t.index ["completed_by_id"], name: "index_checklist_items_on_completed_by_id"
    t.index ["status"], name: "index_checklist_items_on_status"
  end

  create_table "checklist_templates", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "trade_type"
    t.jsonb "items", default: [], null: false
    t.boolean "is_default", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["is_default"], name: "index_checklist_templates_on_is_default"
    t.index ["trade_type"], name: "index_checklist_templates_on_trade_type"
  end

  create_table "checklists", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id", null: false
    t.uuid "checklist_template_id"
    t.string "name", null: false
    t.integer "position", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_template_id"], name: "index_checklists_on_checklist_template_id"
    t.index ["project_id", "position"], name: "index_checklists_on_project_id_and_position"
    t.index ["project_id"], name: "index_checklists_on_project_id"
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.string "address"
    t.string "trade_type"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_projects_on_name"
    t.index ["user_id", "updated_at"], name: "index_projects_on_user_id_and_updated_at"
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "role", default: "tech", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "checklist_items", "checklists"
  add_foreign_key "checklist_items", "users", column: "completed_by_id"
  add_foreign_key "checklists", "checklist_templates"
  add_foreign_key "checklists", "projects"
  add_foreign_key "projects", "users"
end
