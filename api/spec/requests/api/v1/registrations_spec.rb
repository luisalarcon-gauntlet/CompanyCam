require "rails_helper"

RSpec.describe "POST /api/v1/auth/signup", type: :request do
  let(:valid_params) do
    {
      user: {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        password_confirmation: "password123"
      }
    }
  end

  describe "POST /api/v1/auth/signup" do
    context "with valid params" do
      it "creates a new user and returns token" do
        post "/api/v1/auth/signup", params: valid_params, as: :json

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["data"]["user"]["email"]).to eq("jane@example.com")
        expect(json["data"]["token"]).to be_present
        expect(json["errors"]).to be_empty
      end
    end

    context "with missing name" do
      it "returns 422" do
        params = valid_params.deep_dup
        params[:user][:name] = ""
        post "/api/v1/auth/signup", params: params, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include(a_string_matching(/Name/))
      end
    end

    context "with duplicate email" do
      before { create(:user, email: "jane@example.com") }

      it "returns 422" do
        post "/api/v1/auth/signup", params: valid_params, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include(a_string_matching(/Email/))
      end
    end

    context "with short password" do
      it "returns 422" do
        params = valid_params.deep_dup
        params[:user][:password] = "short"
        params[:user][:password_confirmation] = "short"
        post "/api/v1/auth/signup", params: params, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
