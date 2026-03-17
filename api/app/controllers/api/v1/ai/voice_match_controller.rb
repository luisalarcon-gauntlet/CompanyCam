module Api
  module V1
    module Ai
      class VoiceMatchController < ApplicationController
        # POST /api/v1/ai/voice-match
        # Accepts audio data (base64) OR pre-computed transcription.
        # If audio_data is present → transcribes with Whisper first.
        # Always runs Claude intent matching against incomplete items.
        def create
          transcription, transcription_error = resolve_transcription
          return render_error(transcription_error, status: :unprocessable_entity) if transcription_error
          return render_error("No speech detected — please try again") if transcription.blank?

          # Transcription-only mode (no checklist_id) — used by Q&A voice input
          if params[:checklist_id].blank?
            return render_success({ transcription: transcription, matched_item_id: nil })
          end

          checklist = find_checklist
          return unless checklist

          incomplete_items = checklist.checklist_items.incomplete.ordered.map do |item|
            { id: item.id, title: item.title }
          end

          if incomplete_items.empty?
            return render_success({ message: "All items are already complete! 🎉", matched_item_id: nil, transcription: transcription })
          end

          result = ::Ai::VoiceMatchService.new(
            transcription: transcription,
            items: incomplete_items
          ).call

          unless result.success?
            return render_error(result.error, status: :service_unavailable)
          end

          render_success(result.data.merge(transcription: transcription))
        end

        private

        def find_checklist
          checklist = Checklist.joins(:project)
                               .where(projects: { user_id: current_user.id })
                               .find_by(id: params[:checklist_id])

          render_error("Checklist not found", status: :not_found) unless checklist
          checklist
        end

        def resolve_transcription
          if params[:transcription].present?
            [params[:transcription].strip, nil]
          elsif params[:audio_data].present?
            transcribe_audio
          else
            [nil, "Provide either transcription text or audio_data"]
          end
        end

        def transcribe_audio
          audio_bytes = begin
            Base64.strict_decode64(params[:audio_data])
          rescue ArgumentError
            return [nil, "Invalid audio data encoding"]
          end

          format = params.fetch(:audio_format, "webm").downcase

          svc = ::Ai::WhisperTranscriptionService.new(audio_data: audio_bytes, audio_format: format).call

          if svc.success?
            [svc.data[:transcription], nil]
          else
            [nil, svc.error]
          end
        end
      end
    end
  end
end
