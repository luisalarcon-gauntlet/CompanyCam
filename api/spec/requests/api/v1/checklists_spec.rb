require "rails_helper"

RSpec.describe "Checklists API", type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) { auth_headers_for(user) }
  let!(:project) { create(:project, user: user) }
  let!(:checklist) { create(:checklist, project: project) }

  describe "GET /api/v1/projects/:project_id/checklists" do
    it "returns all checklists for a project" do
      get "/api/v1/projects/#{project.id}/checklists", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"].length).to eq(1)
    end
  end

  describe "POST /api/v1/projects/:project_id/checklists" do
    it "creates a checklist" do
      post "/api/v1/projects/#{project.id}/checklists",
           params: { checklist: { name: "Pre-Install" } },
           headers: auth_headers, as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["name"]).to eq("Pre-Install")
    end

    context "with template_id" do
      let!(:template) do
        ChecklistTemplate.create!(
          name: "Test Template",
          trade_type: "roofing",
          is_default: true,
          items: [
            { "title" => "Item 1", "position" => 1 },
            { "title" => "Item 2", "position" => 2 }
          ]
        )
      end

      it "loads items from template" do
        post "/api/v1/projects/#{project.id}/checklists",
             params: { checklist: { name: "From Template" }, template_id: template.id },
             headers: auth_headers, as: :json

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["data"]["items"].length).to eq(2)
      end
    end
  end

  describe "PATCH /api/v1/checklists/:id" do
    it "updates checklist name" do
      patch "/api/v1/checklists/#{checklist.id}",
            params: { checklist: { name: "Updated Name" } },
            headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["name"]).to eq("Updated Name")
    end
  end

  describe "DELETE /api/v1/checklists/:id" do
    it "deletes the checklist" do
      delete "/api/v1/checklists/#{checklist.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(Checklist.find_by(id: checklist.id)).to be_nil
    end
  end
end
