require 'ostruct'

module Ai
  class QaService
    include AnthropicResponseParser

    MODEL = "claude-sonnet-4-20250514"

    PROMPT_TEMPLATE = <<~PROMPT
      You are a helpful job site assistant for a contractor.

      Project: %<project_name>s
      Trade: %<trade_type>s
      Checklist: %<checklist_name>s

      Items:
      %<items_with_status>s

      The contractor asked: "%<question>s"

      Answer conversationally in 1-2 sentences. Be direct, practical, no fluff.
      If they ask "what's next?", give just the next incomplete item name, nothing else.
      If they ask "am I done?" and yes, say "Yes, all done! 🎉". If no, name how many items remain.
      If they ask "what's left?", list the incomplete items by name.
      If they ask "what did I finish today?", list items completed today with their times.
    PROMPT

    def initialize(question:, project:, checklists:)
      @question = question
      @project = project
      @checklists = checklists
    end

    def call
      return api_key_missing_result unless ENV["ANTHROPIC_API_KEY"].present?

      client = Anthropic::Client.new(access_token: ENV["ANTHROPIC_API_KEY"])

      prompt = build_prompt
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

      answer = text.strip

      Rails.logger.info(
        "[AI][QA] latency=#{latency_ms}ms " \
        "tokens_in=#{usage[:input_tokens]} tokens_out=#{usage[:output_tokens]}"
      )

      OpenStruct.new(success?: true, data: { answer: answer }, error: nil)
    rescue => e
      Rails.logger.error("[AI][QA] Error: #{e.class} — #{e.message}")
      err_msg = Rails.env.development? ? "AI service unavailable: #{e.message}" : "AI service unavailable"
      OpenStruct.new(success?: false, data: nil, error: err_msg)
    end

    private

    def api_key_missing_result
      Rails.logger.warn("[AI][QA] ANTHROPIC_API_KEY not set")
      OpenStruct.new(success?: false, data: nil, error: "AI service not configured")
    end

    def build_prompt
      all_items = @checklists.flat_map(&:checklist_items)
      checklist_names = @checklists.map(&:name).join(", ")

      items_with_status = all_items.map do |item|
        status_label = if item.status_complete?
          completed_time = item.completed_at&.strftime("%I:%M %p") || "unknown time"
          "✓ DONE (#{item.completed_via || 'manual'} at #{completed_time})"
        else
          "☐ INCOMPLETE"
        end
        "- [#{status_label}] #{item.title}"
      end.join("\n")

      format(
        PROMPT_TEMPLATE,
        project_name: @project.name,
        trade_type: @project.trade_type.humanize,
        checklist_name: checklist_names,
        items_with_status: items_with_status,
        question: @question
      )
    end

  end
end
