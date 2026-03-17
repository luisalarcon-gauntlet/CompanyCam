require "rails_helper"

RSpec.describe "Projects API", type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) { auth_headers_for(user) }
  let!(:project) { create(:project, user: user) }

  describe "GET /api/v1/projects" do
    it "returns all user projects" do
      get "/api/v1/projects", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"].length).to eq(1)
      expect(json["data"][0]["id"]).to eq(project.id)
    end

    it "returns 401 without auth" do
      get "/api/v1/projects"
      expect(response).to have_http_status(:unauthorized)
    end

    context "with search param" do
      let!(:another_project) { create(:project, user: user, name: "Unique Search Term XYZ") }

      it "filters by name" do
        get "/api/v1/projects", params: { search: "unique search" }, headers: auth_headers

        json = JSON.parse(response.body)
        expect(json["data"].length).to eq(1)
        expect(json["data"][0]["name"]).to eq("Unique Search Term XYZ")
      end
    end
  end

  describe "GET /api/v1/projects/:id" do
    it "returns project with checklists" do
      get "/api/v1/projects/#{project.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["id"]).to eq(project.id)
      expect(json["data"]).to have_key("checklists")
    end

    it "returns 404 for other user's project" do
      other_project = create(:project)
      get "/api/v1/projects/#{other_project.id}", headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/projects" do
    let(:valid_params) do
      { project: { name: "New Roof Job", trade_type: "roofing", address: "123 Main St" } }
    end

    it "creates a project" do
      post "/api/v1/projects", params: valid_params, headers: auth_headers, as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["name"]).to eq("New Roof Job")
      expect(json["data"]["trade_type"]).to eq("roofing")
    end

    it "returns 422 without name" do
      post "/api/v1/projects", params: { project: { name: "" } },
           headers: auth_headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /api/v1/projects/:id" do
    it "updates the project" do
      patch "/api/v1/projects/#{project.id}",
            params: { project: { name: "Updated Name" } },
            headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["name"]).to eq("Updated Name")
    end
  end

  describe "DELETE /api/v1/projects/:id" do
    it "deletes the project" do
      delete "/api/v1/projects/#{project.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(Project.find_by(id: project.id)).to be_nil
    end
  end
end
