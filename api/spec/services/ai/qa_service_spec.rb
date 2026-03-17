require "rails_helper"

RSpec.describe Ai::QaService do
  let(:user) { create(:user) }
  let(:project) { create(:project, user: user, name: "Oak Street Roof", trade_type: "roofing") }
  let(:checklist) { create(:checklist, project: project, name: "Day 1") }

  let!(:done_item)   { create(:checklist_item, checklist: checklist, title: "Install drip edge", status: "complete", completed_via: "voice", completed_at: Time.current) }
  let!(:open_item1)  { create(:checklist_item, checklist: checklist, title: "Lay felt paper", status: "incomplete") }
  let!(:open_item2)  { create(:checklist_item, checklist: checklist, title: "Install shingles", status: "incomplete") }

  let(:checklists) { project.checklists.includes(:checklist_items) }

  describe "#call" do
    before { allow(ENV).to receive(:[]).and_call_original; allow(ENV).to receive(:[]).with("ANTHROPIC_API_KEY").and_return("test-key") }

    context "when Claude answers successfully" do
      before do
        claude_response = instance_double(
          "Anthropic::Messages::Message",
          content: [instance_double("Anthropic::Messages::ContentBlock", text: "Lay felt paper")],
          usage: instance_double("Anthropic::Messages::Usage", input_tokens: 200, output_tokens: 10)
        )
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_return(claude_response)
      end

      it "returns the answer from Claude" do
        result = described_class.new(
          question: "what's next?",
          project: project,
          checklists: checklists
        ).call

        expect(result.success?).to be true
        expect(result.data[:answer]).to eq("Lay felt paper")
      end
    end

    context "when Claude API fails" do
      before do
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_raise(StandardError, "timeout")
      end

      it "returns failure" do
        result = described_class.new(
          question: "am I done?",
          project: project,
          checklists: checklists
        ).call

        expect(result.success?).to be false
        expect(result.error).to eq("AI service unavailable")
      end
    end
  end
end
