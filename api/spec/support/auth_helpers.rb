module AuthHelpers
  def auth_headers_for(user)
    token = JwtService.token_for(user)
    { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
