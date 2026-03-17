require "base64"
require "fileutils"
require "mini_magick"

module Api
  module V1
    module Uploads
      class PhotosController < ApplicationController
        UPLOADS_DIR = Rails.root.join("public", "uploads")
        MAX_SIZE_BYTES = 10 * 1024 * 1024   # 10 MB
        THUMBNAIL_SIZE = "300x300"
        ALLOWED_TYPES = {
          "image/jpeg" => ".jpg",
          "image/png"  => ".png",
          "image/webp" => ".webp",
          "image/gif"  => ".gif"
        }.freeze

        # POST /api/v1/uploads/photo
        # Body: { image_data: <base64>, image_media_type: "image/jpeg" }
        def create
          image_data, media_type, error = decode_params
          return render_error(error, status: :unprocessable_entity) if error

          ext = ALLOWED_TYPES[media_type]
          return render_error("Unsupported image type: #{media_type}", status: :unprocessable_entity) unless ext

          FileUtils.mkdir_p(UPLOADS_DIR)

          filename = "photo-#{SecureRandom.uuid}#{ext}"
          thumb_filename = "thumb-#{filename}"

          full_path  = UPLOADS_DIR.join(filename)
          thumb_path = UPLOADS_DIR.join(thumb_filename)

          File.binwrite(full_path, image_data)
          generate_thumbnail(full_path, thumb_path)

          base_url = request_base_url
          render_success(
            {
              url: "#{base_url}/uploads/#{filename}",
              thumbnail_url: "#{base_url}/uploads/#{thumb_filename}"
            },
            status: :created
          )
        rescue => e
          Rails.logger.error("[Uploads][Photo] #{e.class}: #{e.message}")
          render_error("Photo upload failed", status: :internal_server_error)
        end

        private

        def decode_params
          raw = params[:image_data]
          return [nil, nil, "image_data is required"] if raw.blank?

          decoded = Base64.strict_decode64(raw)
          return [nil, nil, "Image too large (max 10 MB)"] if decoded.bytesize > MAX_SIZE_BYTES

          media_type = params.fetch(:image_media_type, "image/jpeg")
          [decoded, media_type, nil]
        rescue ArgumentError
          [nil, nil, "Invalid image_data — expected base64"]
        end

        def generate_thumbnail(source_path, thumb_path)
          image = MiniMagick::Image.open(source_path)
          image.resize(THUMBNAIL_SIZE + "^")
          image.gravity("center")
          image.extent(THUMBNAIL_SIZE)
          image.write(thumb_path)
        rescue => e
          Rails.logger.warn("[Uploads][Photo] Thumbnail failed: #{e.message} — copying original")
          FileUtils.cp(source_path, thumb_path)
        end

        def request_base_url
          "#{request.scheme}://#{request.host_with_port}"
        end
      end
    end
  end
end
