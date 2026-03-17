require "rails_helper"

RSpec.describe "POST /api/v1/ai/voice-match", type: :request do
  let(:user)      { create(:user) }
  let(:project)   { create(:project, user: user) }
  let(:checklist) { create(:checklist, project: project) }
  let!(:item1)    { create(:checklist_item, checklist: checklist, title: "Install drip edge", status: "incomplete") }
  let!(:item2)    { create(:checklist_item, checklist: checklist, title: "Lay felt paper", status: "incomplete") }

  let(:headers) { auth_headers_for(user) }

  def stub_voice_match(matched_id: item1.id, confidence: 0.95, reasoning: "Matched.")
    result = OpenStruct.new(
      success?: true,
      data: { matched_item_id: matched_id, confidence: confidence, reasoning: reasoning },
      error: nil
    )
    allow(Ai::VoiceMatchService).to receive(:new).and_return(double(call: result))
  end

  describe "with transcription text" do
    before { stub_voice_match }

    it "returns a match result" do
      post "/api/v1/ai/voice-match",
        params: { transcription: "I just finished the drip edge", checklist_id: checklist.id }.to_json,
        headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["matched_item_id"]).to eq(item1.id)
      expect(json["data"]["confidence"]).to eq(0.95)
      expect(json["data"]["transcription"]).to eq("I just finished the drip edge")
    end
  end

  describe "with audio_data" do
    let(:fake_audio_b64) { Base64.strict_encode64("audio bytes") }

    before do
      whisper_result = OpenStruct.new(
        success?: true,
        data: { transcription: "I finished the drip edge" },
        error: nil
      )
      allow(Ai::WhisperTranscriptionService).to receive(:new).and_return(double(call: whisper_result))
      stub_voice_match
    end

    it "transcribes and then matches" do
      post "/api/v1/ai/voice-match",
        params: { audio_data: fake_audio_b64, audio_format: "webm", checklist_id: checklist.id }.to_json,
        headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["transcription"]).to eq("I finished the drip edge")
      expect(json["data"]["matched_item_id"]).to eq(item1.id)
    end
  end

  describe "error cases" do
    it "returns 422 when neither transcription nor audio_data provided" do
      post "/api/v1/ai/voice-match",
        params: { checklist_id: checklist.id }.to_json,
        headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 404 for unknown checklist" do
      post "/api/v1/ai/voice-match",
        params: { transcription: "done", checklist_id: "does-not-exist" }.to_json,
        headers: headers

      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without auth" do
      post "/api/v1/ai/voice-match",
        params: { transcription: "done", checklist_id: checklist.id }.to_json,
        headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 503 when AI service fails" do
      fail_result = OpenStruct.new(success?: false, data: nil, error: "AI service unavailable")
      allow(Ai::VoiceMatchService).to receive(:new).and_return(double(call: fail_result))

      post "/api/v1/ai/voice-match",
        params: { transcription: "something", checklist_id: checklist.id }.to_json,
        headers: headers

      expect(response).to have_http_status(:service_unavailable)
    end

    it "handles all items already complete" do
      item1.update!(status: "complete", completed_at: Time.current, completed_via: "manual")
      item2.update!(status: "complete", completed_at: Time.current, completed_via: "manual")

      post "/api/v1/ai/voice-match",
        params: { transcription: "something", checklist_id: checklist.id }.to_json,
        headers: headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]["matched_item_id"]).to be_nil
    end
  end
end
