require "rails_helper"

RSpec.describe Ai::PhotoAnalysisService do
  let(:items) do
    [
      { id: "item-a", title: "Install shingles" },
      { id: "item-b", title: "Clean gutters" },
      { id: "item-c", title: "Final inspection photo" }
    ]
  end

  let(:valid_image_data) { Base64.strict_encode64("fake image bytes") }

  describe "#call" do
    before { allow(ENV).to receive(:[]).and_call_original; allow(ENV).to receive(:[]).with("ANTHROPIC_API_KEY").and_return("test-key") }

    context "when Claude returns a confident photo match" do
      before do
        claude_response = instance_double(
          "Anthropic::Messages::Message",
          content: [instance_double("Anthropic::Messages::ContentBlock", text: JSON.generate({
            matched_item_id: "item-a",
            confidence: 0.87,
            description: "Asphalt shingles being laid on a sloped roof.",
            reasoning: "The photo shows shingle installation in progress."
          }))],
          usage: instance_double("Anthropic::Messages::Usage", input_tokens: 300, output_tokens: 60)
        )
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_return(claude_response)
      end

      it "returns success with match and description" do
        result = described_class.new(
          image_data: valid_image_data,
          image_media_type: "image/jpeg",
          items: items
        ).call

        expect(result.success?).to be true
        expect(result.data[:matched_item_id]).to eq("item-a")
        expect(result.data[:confidence]).to eq(0.87)
        expect(result.data[:description]).to include("shingles")
        expect(result.data[:reasoning]).to be_present
      end
    end

    context "when Claude cannot identify a match" do
      before do
        claude_response = instance_double(
          "Anthropic::Messages::Message",
          content: [instance_double("Anthropic::Messages::ContentBlock", text: JSON.generate({
            matched_item_id: nil,
            confidence: 0.1,
            description: "A blurry image, contents unclear.",
            reasoning: "Cannot determine what checklist item this documents."
          }))],
          usage: instance_double("Anthropic::Messages::Usage", input_tokens: 200, output_tokens: 40)
        )
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_return(claude_response)
      end

      it "returns success with nil matched_item_id" do
        result = described_class.new(
          image_data: valid_image_data,
          image_media_type: "image/jpeg",
          items: items
        ).call

        expect(result.success?).to be true
        expect(result.data[:matched_item_id]).to be_nil
        expect(result.data[:confidence]).to be <= 0.49
      end
    end

    context "when API raises an error" do
      before do
        allow_any_instance_of(Anthropic::Client).to receive_message_chain(:messages, :create)
          .and_raise(StandardError, "Network error")
      end

      it "returns failure" do
        result = described_class.new(
          image_data: valid_image_data,
          image_media_type: "image/jpeg",
          items: items
        ).call

        expect(result.success?).to be false
        expect(result.error).to eq("AI service unavailable")
      end
    end

    context "with unsupported media type" do
      it "normalizes to image/jpeg" do
        service = described_class.new(
          image_data: valid_image_data,
          image_media_type: "image/bmp",   # unsupported
          items: items
        )
        expect(service.instance_variable_get(:@image_media_type)).to eq("image/jpeg")
      end
    end
  end
end
