require "rails_helper"

RSpec.describe "POST /api/v1/ai/ask", type: :request do
  let(:user)      { create(:user) }
  let(:project)   { create(:project, user: user, name: "Main St Job") }
  let(:checklist) { create(:checklist, project: project) }
  let!(:item1)    { create(:checklist_item, checklist: checklist, title: "Install drip edge", status: "complete", completed_at: Time.current) }
  let!(:item2)    { create(:checklist_item, checklist: checklist, title: "Lay felt paper", status: "incomplete") }

  let(:headers) { auth_headers_for(user) }

  def stub_qa(answer:)
    result = OpenStruct.new(success?: true, data: { answer: answer }, error: nil)
    allow(Ai::QaService).to receive(:new).and_return(double(call: result))
  end

  it "returns an answer from AI" do
    stub_qa(answer: "Lay felt paper")

    post "/api/v1/ai/ask",
      params: { question: "what's next?", project_id: project.id }.to_json,
      headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["data"]["answer"]).to eq("Lay felt paper")
  end

  it "returns 422 when question is blank" do
    post "/api/v1/ai/ask",
      params: { question: "", project_id: project.id }.to_json,
      headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "returns 404 for unknown project" do
    post "/api/v1/ai/ask",
      params: { question: "am I done?", project_id: "ghost-id" }.to_json,
      headers: headers

    expect(response).to have_http_status(:not_found)
  end

  it "returns 503 when AI fails" do
    fail_result = OpenStruct.new(success?: false, data: nil, error: "AI service unavailable")
    allow(Ai::QaService).to receive(:new).and_return(double(call: fail_result))

    post "/api/v1/ai/ask",
      params: { question: "what's left?", project_id: project.id }.to_json,
      headers: headers

    expect(response).to have_http_status(:service_unavailable)
  end

  it "returns 401 without auth" do
    post "/api/v1/ai/ask",
      params: { question: "done?", project_id: project.id }.to_json,
      headers: { "Content-Type" => "application/json" }

    expect(response).to have_http_status(:unauthorized)
  end

  it "handles empty checklists gracefully" do
    empty_project = create(:project, user: user)

    post "/api/v1/ai/ask",
      params: { question: "what's next?", project_id: empty_project.id }.to_json,
      headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["data"]["answer"]).to include("no checklists")
  end
end
