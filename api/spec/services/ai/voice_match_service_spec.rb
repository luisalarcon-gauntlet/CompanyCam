require "rails_helper"

RSpec.describe Ai::VoiceMatchService do
  let(:items) do
    [
      { id: "item-1", title: "Install drip edge" },
      { id: "item-2", title: "Lay felt paper" },
      { id: "item-3", title: "Install ice & water shield" }
    ]
  end

  describe "#call" do
    before { allow(ENV).to receive(:[]).and_call_original; allow(ENV).to receive(:[]).with("ANTHROPIC_API_KEY").and_return("test-key") }

    context "when Claude returns a high-confidence match" do
      before do
        claude_response = instance_double(
          "Anthropic::Messages::Message",
          content: [instance_double("Anthropic::Messages::ContentBlock", text: JSON.generate({
            matched_item_id: "item-1",
            confidence: 0.95,
            reasoning: "The contractor said 'drip edge' which directly matches 'Install drip edge'."
          }))],
          usage: instance_double("Anthropic::Messages::Usage", input_tokens: 100, output_tokens: 30)
        )
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_return(claude_response)
      end

      it "returns success with matched item and confidence" do
        result = described_class.new(transcription: "I just did the drip edge", items: items).call

        expect(result.success?).to be true
        expect(result.data[:matched_item_id]).to eq("item-1")
        expect(result.data[:confidence]).to eq(0.95)
        expect(result.data[:reasoning]).to include("drip edge")
      end
    end

    context "when Claude returns no match" do
      before do
        claude_response = instance_double(
          "Anthropic::Messages::Message",
          content: [instance_double("Anthropic::Messages::ContentBlock", text: JSON.generate({
            matched_item_id: nil,
            confidence: 0.0,
            reasoning: "Could not identify a matching checklist item."
          }))],
          usage: instance_double("Anthropic::Messages::Usage", input_tokens: 80, output_tokens: 20)
        )
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_return(claude_response)
      end

      it "returns success with nil matched_item_id" do
        result = described_class.new(transcription: "banana", items: items).call

        expect(result.success?).to be true
        expect(result.data[:matched_item_id]).to be_nil
        expect(result.data[:confidence]).to eq(0.0)
      end
    end

    context "when Claude API raises an error" do
      before do
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_raise(StandardError, "API timeout")
      end

      it "returns failure with error message" do
        result = described_class.new(transcription: "done with the felt paper", items: items).call

        expect(result.success?).to be false
        expect(result.error).to eq("AI service unavailable")
        expect(result.data).to be_nil
      end
    end

    context "when Claude returns invalid JSON" do
      before do
        claude_response = instance_double(
          "Anthropic::Messages::Message",
          content: [instance_double("Anthropic::Messages::ContentBlock", text: "not json at all")],
          usage: instance_double("Anthropic::Messages::Usage", input_tokens: 50, output_tokens: 10)
        )
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_return(claude_response)
      end

      it "returns failure with parse error message" do
        result = described_class.new(transcription: "done", items: items).call

        expect(result.success?).to be false
        expect(result.error).to include("unparseable")
      end
    end

    context "when confidence is out of range" do
      before do
        claude_response = instance_double(
          "Anthropic::Messages::Message",
          content: [instance_double("Anthropic::Messages::ContentBlock", text: JSON.generate({
            matched_item_id: "item-2",
            confidence: 1.5,    # out of range — should be clamped
            reasoning: "Matched."
          }))],
          usage: instance_double("Anthropic::Messages::Usage", input_tokens: 80, output_tokens: 20)
        )
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_return(claude_response)
      end

      it "clamps confidence to 1.0" do
        result = described_class.new(transcription: "felt paper done", items: items).call

        expect(result.success?).to be true
        expect(result.data[:confidence]).to eq(1.0)
      end
    end

    context "when ANTHROPIC_API_KEY is missing" do
      before { allow(ENV).to receive(:[]).with("ANTHROPIC_API_KEY").and_return(nil) }

      it "returns failure with clear message" do
        result = described_class.new(transcription: "drip edge done", items: items).call

        expect(result.success?).to be false
        expect(result.error).to eq("AI service not configured")
        expect(result.data).to be_nil
      end
    end
  end
end
