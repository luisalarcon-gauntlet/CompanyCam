module Api
  module V1
    module Ai
      class PhotoMatchController < ApplicationController
        MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024   # 5 MB

        # POST /api/v1/ai/photo-match
        # Body: { image_data: <base64>, image_media_type: "image/jpeg", checklist_id: "..." }
        def create
          checklist = find_checklist
          return unless checklist

          image_data, media_type, decode_error = decode_image
          return render_error(decode_error, status: :unprocessable_entity) if decode_error

          incomplete_items = checklist.checklist_items.incomplete.ordered.map do |item|
            { id: item.id, title: item.title }
          end

          if incomplete_items.empty?
            return render_success({ message: "All items are already complete! 🎉", matched_item_id: nil })
          end

          result = ::Ai::PhotoAnalysisService.new(
            image_data: image_data,
            image_media_type: media_type,
            items: incomplete_items
          ).call

          unless result.success?
            return render_error(result.error, status: :service_unavailable)
          end

          render_success(result.data)
        end

        private

        def find_checklist
          checklist = Checklist.joins(:project)
                               .where(projects: { user_id: current_user.id })
                               .find_by(id: params[:checklist_id])

          render_error("Checklist not found", status: :not_found) unless checklist
          checklist
        end

        def decode_image
          raw = params[:image_data]
          return [nil, nil, "image_data is required"] if raw.blank?

          decoded = Base64.strict_decode64(raw)

          if decoded.bytesize > MAX_IMAGE_SIZE_BYTES
            return [nil, nil, "Image too large (max 5 MB)"]
          end

          media_type = params.fetch(:image_media_type, "image/jpeg")
          [raw, media_type, nil]
        rescue ArgumentError
          [nil, nil, "Invalid image_data encoding — expected base64"]
        end
      end
    end
  end
end
