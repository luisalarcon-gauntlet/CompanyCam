require "rails_helper"

RSpec.describe "POST /api/v1/uploads/photo", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }

  # A tiny valid 1x1 JPEG (base64)
  let(:tiny_jpeg_b64) do
    # Real 1x1 white JPEG bytes
    bytes = "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" \
            "\xFF\xDB\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t" \
            "\x08\n\x0C\x14\r\x0C\x0B\x0B\x0C\x19\x12\x13\x0F\x14\x1D\x1A" \
            "\x1F\x1E\x1D\x1A\x1C\x1C $.' \",#\x1C\x1C(7),01444\x1F'9=82<.342\x1E" \
            "\xC0\x00\x0B\x08\x00\x01\x00\x01\x01\x01\x11\x00\xFF\xC4\x00\x1F" \
            "\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00" \
            "\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0B\xFF\xDA\x00\x08" \
            "\x01\x01\x00\x00?\x00\xFB\xD8\x00\xFF\xD9"
    Base64.strict_encode64(bytes)
  end

  before do
    # Use a temp dir so we don't pollute the real public/uploads
    stub_const("Api::V1::Uploads::PhotosController::UPLOADS_DIR",
               Pathname.new(Dir.mktmpdir("fieldcheck_test_uploads")))
    # Skip thumbnail generation to avoid ImageMagick dependency in tests
    allow_any_instance_of(Api::V1::Uploads::PhotosController)
      .to receive(:generate_thumbnail)
  end

  after do
    path = Api::V1::Uploads::PhotosController::UPLOADS_DIR
    FileUtils.rm_rf(path) if path.to_s.start_with?(Dir.tmpdir)
  end

  it "saves the file and returns URL + thumbnail_url" do
    post "/api/v1/uploads/photo",
      params: { image_data: tiny_jpeg_b64, image_media_type: "image/jpeg" }.to_json,
      headers: headers

    expect(response).to have_http_status(:created)
    json = JSON.parse(response.body)
    expect(json["data"]["url"]).to match(%r{/uploads/photo-.*\.jpg})
    expect(json["data"]["thumbnail_url"]).to match(%r{/uploads/thumb-photo-.*\.jpg})
  end

  it "returns 422 when image_data is missing" do
    post "/api/v1/uploads/photo",
      params: { image_media_type: "image/jpeg" }.to_json,
      headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "returns 422 for invalid base64" do
    post "/api/v1/uploads/photo",
      params: { image_data: "###notbase64###", image_media_type: "image/jpeg" }.to_json,
      headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "returns 422 for unsupported media type" do
    post "/api/v1/uploads/photo",
      params: { image_data: tiny_jpeg_b64, image_media_type: "image/bmp" }.to_json,
      headers: headers

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "returns 401 without auth" do
    post "/api/v1/uploads/photo",
      params: { image_data: tiny_jpeg_b64 }.to_json,
      headers: { "Content-Type" => "application/json" }

    expect(response).to have_http_status(:unauthorized)
  end
end
