# frozen_string_literal: true

module Ai
  # Parses Anthropic API response so it works whether the gem returns
  # Hash (string keys) or object-style (e.g. OpenStruct) responses.
  module AnthropicResponseParser
    def extract_text_from_response(response)
      content = response.respond_to?(:content) ? response.content : response["content"] || response[:content]
      block = content.is_a?(Array) ? content.first : nil
      return nil unless block

      if block.respond_to?(:text)
        block.text
      else
        # Handle both string and symbol keys (e.g. from JSON or different gem serialization)
        block["text"] || block[:text]
      end
    end

    def extract_usage_from_response(response)
      usage = response.respond_to?(:usage) ? response.usage : response["usage"] || response[:usage]
      return { input_tokens: 0, output_tokens: 0 } unless usage

      if usage.respond_to?(:input_tokens)
        { input_tokens: usage.input_tokens.to_i, output_tokens: usage.output_tokens.to_i }
      else
        {
          input_tokens: (usage["input_tokens"] || usage[:input_tokens]).to_i,
          output_tokens: (usage["output_tokens"] || usage[:output_tokens]).to_i
        }
      end
    end
  end
end
