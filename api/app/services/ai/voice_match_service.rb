require 'ostruct'

module Ai
  class VoiceMatchService
    include AnthropicResponseParser

    MODEL = "claude-sonnet-4-20250514"

    PROMPT_TEMPLATE = <<~PROMPT
      You are a job site assistant helping a contractor check off tasks.

      The contractor just said: "%<transcription>s"

      Here are the incomplete checklist items:
      %<items_list>s

      Return a JSON object:
      {
        "matched_item_id": "<id or null>",
        "confidence": <0.0-1.0>,
        "reasoning": "<one sentence>"
      }

      Match loosely — the contractor speaks casually. "Wrapped up the ice shield" should match "Install ice & water shield".
      If no reasonable match exists, return matched_item_id as null.
      Return ONLY valid JSON, no other text.
    PROMPT

    def initialize(transcription:, items:)
      @transcription = transcription
      @items = items
    end

    def call
      return api_key_missing_result unless ENV["ANTHROPIC_API_KEY"].present?

      client = Anthropic::Client.new(access_token: ENV["ANTHROPIC_API_KEY"])

      items_list = @items.map { |item| "- [#{item[:id]}] #{item[:title]}" }.join("\n")
      prompt = format(PROMPT_TEMPLATE, transcription: @transcription, items_list: items_list)

      started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)

      response = client.messages(
        parameters: {
          model: MODEL,
          max_tokens: 256,
          messages: [{ role: "user", content: prompt }]
        }
      )

      latency_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at) * 1000).round
      usage = extract_usage_from_response(response)

      text = extract_text_from_response(response)
      return OpenStruct.new(success?: false, data: nil, error: "AI returned no text") if text.blank?

      text = text.strip
      result = JSON.parse(text)

      Rails.logger.info(
        "[AI][VoiceMatch] latency=#{latency_ms}ms " \
        "tokens_in=#{usage[:input_tokens]} tokens_out=#{usage[:output_tokens]}"
      )

      confidence = result["confidence"].to_f.clamp(0.0, 1.0)

      OpenStruct.new(
        success?: true,
        data: {
          matched_item_id: result["matched_item_id"],
          confidence: confidence,
          reasoning: result["reasoning"]
        },
        error: nil
      )
    rescue JSON::ParserError => e
      Rails.logger.error("[AI][VoiceMatch] JSON parse error: #{e.message}")
      err_msg = Rails.env.development? ? "AI returned an unparseable response: #{e.message}" : "AI returned an unparseable response"
      OpenStruct.new(success?: false, data: nil, error: err_msg)
    rescue => e
      Rails.logger.error("[AI][VoiceMatch] Error: #{e.class} — #{e.message}")
      err_msg = Rails.env.development? ? "AI service unavailable: #{e.message}" : "AI service unavailable"
      OpenStruct.new(success?: false, data: nil, error: err_msg)
    end

    private

    def api_key_missing_result
      Rails.logger.warn("[AI][VoiceMatch] ANTHROPIC_API_KEY not set")
      OpenStruct.new(success?: false, data: nil, error: "AI service not configured")
    end

  end
end
