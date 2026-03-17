require 'ostruct'

module Ai
  class PhotoAnalysisService
    include AnthropicResponseParser

    MODEL = "claude-sonnet-4-20250514"
    SUPPORTED_MEDIA_TYPES = %w[image/jpeg image/png image/gif image/webp].freeze

    PROMPT_TEMPLATE = <<~PROMPT
      You are a job site assistant. A contractor just uploaded a photo from their job site.

      Look at this photo and determine which of these checklist items it most likely documents:
      %<items_list>s

      Return a JSON object:
      {
        "matched_item_id": "<id or null>",
        "confidence": <0.0-1.0>,
        "description": "<one sentence describing what you see in the photo>",
        "reasoning": "<why this matches the item>"
      }

      Be practical. A photo of a clean room = "Clean bedroom". A photo of shingles on a roof = roofing-related items.
      If no item matches reasonably, return matched_item_id as null.
      Return ONLY valid JSON, no other text.
    PROMPT

    def initialize(image_data:, image_media_type: "image/jpeg", items:)
      @image_data = image_data           # base64-encoded string
      @image_media_type = normalize_media_type(image_media_type)
      @items = items
    end

    def call
      return api_key_missing_result unless ENV["ANTHROPIC_API_KEY"].present?

      client = Anthropic::Client.new(access_token: ENV["ANTHROPIC_API_KEY"])

      items_list = @items.map { |item| "- [#{item[:id]}] #{item[:title]}" }.join("\n")
      prompt = format(PROMPT_TEMPLATE, items_list: items_list)

      started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)

      response = client.messages(
        parameters: {
          model: MODEL,
          max_tokens: 512,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: @image_media_type,
                    data: @image_data
                  }
                },
                {
                  type: "text",
                  text: prompt
                }
              ]
            }
          ]
        }
      )

      latency_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at) * 1000).round
      usage = extract_usage_from_response(response)

      text = extract_text_from_response(response)
      return OpenStruct.new(success?: false, data: nil, error: "AI returned no text") if text.blank?

      text = text.strip
      result = JSON.parse(text)

      Rails.logger.info(
        "[AI][PhotoAnalysis] latency=#{latency_ms}ms " \
        "tokens_in=#{usage[:input_tokens]} tokens_out=#{usage[:output_tokens]}"
      )

      confidence = result["confidence"].to_f.clamp(0.0, 1.0)

      OpenStruct.new(
        success?: true,
        data: {
          matched_item_id: result["matched_item_id"],
          confidence: confidence,
          description: result["description"],
          reasoning: result["reasoning"]
        },
        error: nil
      )
    rescue JSON::ParserError => e
      Rails.logger.error("[AI][PhotoAnalysis] JSON parse error: #{e.message}")
      err_msg = Rails.env.development? ? "AI returned an unparseable response: #{e.message}" : "AI returned an unparseable response"
      OpenStruct.new(success?: false, data: nil, error: err_msg)
    rescue => e
      Rails.logger.error("[AI][PhotoAnalysis] Error: #{e.class} — #{e.message}")
      err_msg = Rails.env.development? ? "AI service unavailable: #{e.message}" : "AI service unavailable"
      OpenStruct.new(success?: false, data: nil, error: err_msg)
    end

    private

    def api_key_missing_result
      Rails.logger.warn("[AI][PhotoAnalysis] ANTHROPIC_API_KEY not set")
      OpenStruct.new(success?: false, data: nil, error: "AI service not configured")
    end

    def normalize_media_type(media_type)
      return "image/jpeg" unless SUPPORTED_MEDIA_TYPES.include?(media_type)
      media_type
    end

  end
end
