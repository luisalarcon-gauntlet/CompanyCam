require "rails_helper"

RSpec.describe "ChecklistItems API", type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) { auth_headers_for(user) }
  let!(:project) { create(:project, user: user) }
  let!(:checklist) { create(:checklist, project: project) }
  let!(:item) { create(:checklist_item, checklist: checklist) }

  describe "GET /api/v1/checklists/:checklist_id/items" do
    it "returns all items" do
      get "/api/v1/checklists/#{checklist.id}/items", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"].length).to eq(1)
    end
  end

  describe "POST /api/v1/checklists/:checklist_id/items" do
    it "creates a new item" do
      post "/api/v1/checklists/#{checklist.id}/items",
           params: { item: { title: "New Task" } },
           headers: auth_headers, as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["title"]).to eq("New Task")
      expect(json["data"]["status"]).to eq("incomplete")
    end
  end

  describe "PATCH /api/v1/items/:id" do
    it "updates item title" do
      patch "/api/v1/items/#{item.id}",
            params: { item: { title: "Updated Title" } },
            headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["title"]).to eq("Updated Title")
    end
  end

  describe "POST /api/v1/items/:id/complete" do
    it "marks item as complete with manual method" do
      post "/api/v1/items/#{item.id}/complete",
           params: { via: "manual" },
           headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["status"]).to eq("complete")
      expect(json["data"]["completed_via"]).to eq("manual")
      expect(json["data"]["completed_at"]).to be_present
    end

    it "saves voice transcription on voice completion" do
      post "/api/v1/items/#{item.id}/complete",
           params: { via: "voice", transcription: "Just finished it", ai_confidence: 0.91 },
           headers: auth_headers, as: :json

      json = JSON.parse(response.body)
      expect(json["data"]["completed_via"]).to eq("voice")
      expect(json["data"]["voice_transcription"]).to eq("Just finished it")
      expect(json["data"]["ai_confidence"]).to eq(0.91)
    end
  end

  describe "POST /api/v1/items/:id/uncomplete" do
    let!(:done_item) { create(:checklist_item, :complete, checklist: checklist) }

    it "uncompletes the item" do
      post "/api/v1/items/#{done_item.id}/uncomplete", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["status"]).to eq("incomplete")
      expect(json["data"]["completed_at"]).to be_nil
    end
  end

  describe "DELETE /api/v1/items/:id" do
    it "deletes the item" do
      delete "/api/v1/items/#{item.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(ChecklistItem.find_by(id: item.id)).to be_nil
    end
  end
end
