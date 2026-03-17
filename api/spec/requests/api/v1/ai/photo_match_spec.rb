require "rails_helper"

RSpec.describe "POST /api/v1/ai/photo-match", type: :request do
  let(:user)      { create(:user) }
  let(:project)   { create(:project, user: user) }
  let(:checklist) { create(:checklist, project: project) }
  let!(:item1)    { create(:checklist_item, checklist: checklist, title: "Install shingles", status: "incomplete") }

  let(:headers)     { auth_headers_for(user) }
  let(:fake_image)  { Base64.strict_encode64("fake jpeg bytes") }

  def stub_photo_match(matched_id: item1.id, confidence: 0.88, description: "Rooftop with shingles.")
    result = OpenStruct.new(
      success?: true,
      data: {
        matched_item_id: matched_id,
        confidence: confidence,
        description: description,
        reasoning: "Photo shows shingle installation."
      },
      error: nil
    )
    allow(Ai::PhotoAnalysisService).to receive(:new).and_return(double(call: result))
  end

  describe "successful match" do
    before { stub_photo_match }

    it "returns match result with description" do
      post "/api/v1/ai/photo-match",
        params: { image_data: fake_image, image_media_type: "image/jpeg", checklist_id: checklist.id }.to_json,
        headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["matched_item_id"]).to eq(item1.id)
      expect(json["data"]["confidence"]).to eq(0.88)
      expect(json["data"]["description"]).to include("shingles")
    end
  end

  describe "error cases" do
    it "returns 422 when image_data missing" do
      post "/api/v1/ai/photo-match",
        params: { checklist_id: checklist.id }.to_json,
        headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 422 for bad base64" do
      post "/api/v1/ai/photo-match",
        params: { image_data: "!!!not-base64!!!", checklist_id: checklist.id }.to_json,
        headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 404 for unknown checklist" do
      post "/api/v1/ai/photo-match",
        params: { image_data: fake_image, checklist_id: "no-such-id" }.to_json,
        headers: headers

      expect(response).to have_http_status(:not_found)
    end

    it "returns 503 when AI service fails" do
      fail_result = OpenStruct.new(success?: false, data: nil, error: "AI service unavailable")
      allow(Ai::PhotoAnalysisService).to receive(:new).and_return(double(call: fail_result))

      post "/api/v1/ai/photo-match",
        params: { image_data: fake_image, checklist_id: checklist.id }.to_json,
        headers: headers

      expect(response).to have_http_status(:service_unavailable)
    end
  end
end
