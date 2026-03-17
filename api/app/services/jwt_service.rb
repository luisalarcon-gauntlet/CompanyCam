class JwtService
  ALGORITHM = "HS256"
  EXPIRY = 30.days

  def self.encode(payload)
    payload = payload.merge(exp: EXPIRY.from_now.to_i)
    JWT.encode(payload, secret, ALGORITHM)
  end

  def self.decode(token)
    decoded = JWT.decode(token, secret, true, { algorithm: ALGORITHM })
    decoded.first.with_indifferent_access
  rescue JWT::DecodeError, JWT::ExpiredSignature => e
    raise ::AuthenticationError, e.message
  end

  def self.token_for(user)
    encode(
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    )
  end

  def self.secret
    ENV.fetch("DEVISE_JWT_SECRET_KEY") { Rails.application.secret_key_base }
  end
end
