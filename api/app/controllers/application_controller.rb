class ApplicationController < ActionController::API
  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
  rescue_from ActionController::ParameterMissing, with: :bad_request
  rescue_from ::AuthenticationError, with: :unauthorized

  private

  def authenticate_user!
    token = extract_token
    raise ::AuthenticationError, "No token provided" unless token

    payload = JwtService.decode(token)
    @current_user = User.find(payload[:sub])
  rescue ActiveRecord::RecordNotFound
    raise ::AuthenticationError, "User not found"
  end

  def current_user
    @current_user
  end

  def extract_token
    header = request.headers["Authorization"]
    return nil unless header

    header.split(" ").last
  end

  def not_found(exception)
    render json: { errors: [exception.message], data: nil, meta: {} }, status: :not_found
  end

  def unprocessable_entity(exception)
    render json: { errors: exception.record.errors.full_messages, data: nil, meta: {} },
           status: :unprocessable_entity
  end

  def bad_request(exception)
    render json: { errors: [exception.message], data: nil, meta: {} }, status: :bad_request
  end

  def unauthorized(exception)
    render json: { errors: [exception.message], data: nil, meta: {} }, status: :unauthorized
  end

  def render_success(data, status: :ok, meta: {})
    render json: { data: data, meta: meta, errors: [] }, status: status
  end

  def render_error(errors, status: :unprocessable_entity)
    errors = [errors] if errors.is_a?(String)
    render json: { data: nil, meta: {}, errors: errors }, status: status
  end
end
