require "net/http"
require "uri"
require "json"
require "tempfile"
require "base64"

module Ai
  class WhisperTranscriptionService
    WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions"
    WHISPER_MODEL = "whisper-1"

    def initialize(audio_data:, audio_format: "webm")
      @audio_data = audio_data   # binary string
      @audio_format = audio_format.downcase
    end

    def call
      return fallback_unavailable unless ENV["OPENAI_API_KEY"].present?

      temp = write_temp_file
      response_body = post_to_whisper(temp)
      result = JSON.parse(response_body)

      if result["text"].present?
        OpenStruct.new(success?: true, data: { transcription: result["text"].strip }, error: nil)
      else
        error_msg = result.dig("error", "message") || "No transcription returned"
        Rails.logger.error("[AI][Whisper] API error: #{error_msg}")
        OpenStruct.new(success?: false, data: nil, error: error_msg)
      end
    rescue => e
      Rails.logger.error("[AI][Whisper] Error: #{e.class} — #{e.message}")
      err_msg = Rails.env.development? ? "Transcription service unavailable: #{e.message}" : "Transcription service unavailable"
      OpenStruct.new(success?: false, data: nil, error: err_msg)
    ensure
      temp&.close!
    end

    private

    def write_temp_file
      file = Tempfile.new(["audio", ".#{@audio_format}"])
      file.binmode
      file.write(@audio_data)
      file.rewind
      file
    end

    def post_to_whisper(temp_file)
      boundary = "----FieldCheckBoundary#{SecureRandom.hex(8)}"
      body = build_multipart_body(temp_file, boundary)

      uri = URI(WHISPER_URL)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.read_timeout = 30

      request = Net::HTTP::Post.new(uri.request_uri)
      request["Authorization"] = "Bearer #{ENV['OPENAI_API_KEY']}"
      request["Content-Type"] = "multipart/form-data; boundary=#{boundary}"
      request.body = body

      started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      response = http.request(request)
      latency_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at) * 1000).round

      Rails.logger.info("[AI][Whisper] status=#{response.code} latency=#{latency_ms}ms")
      response.body
    end

    def build_multipart_body(temp_file, boundary)
      crlf = "\r\n"
      mime_type = mime_for(@audio_format)
      audio_bytes = temp_file.read

      body = +""
      body.force_encoding(Encoding::BINARY)

      # file part
      body << "--#{boundary}#{crlf}".b
      body << "Content-Disposition: form-data; name=\"file\"; filename=\"audio.#{@audio_format}\"#{crlf}".b
      body << "Content-Type: #{mime_type}#{crlf}#{crlf}".b
      body << audio_bytes.b
      body << crlf.b

      # model part
      body << "--#{boundary}#{crlf}".b
      body << "Content-Disposition: form-data; name=\"model\"#{crlf}#{crlf}".b
      body << WHISPER_MODEL.b
      body << crlf.b

      body << "--#{boundary}--#{crlf}".b
      body
    end

    def mime_for(format)
      {
        "webm" => "audio/webm",
        "mp4"  => "audio/mp4",
        "wav"  => "audio/wav",
        "m4a"  => "audio/m4a",
        "ogg"  => "audio/ogg",
        "mp3"  => "audio/mpeg"
      }.fetch(format, "audio/webm")
    end

    def fallback_unavailable
      Rails.logger.warn("[AI][Whisper] OPENAI_API_KEY not set")
      OpenStruct.new(success?: false, data: nil, error: "Transcription service not configured")
    end
  end
end
