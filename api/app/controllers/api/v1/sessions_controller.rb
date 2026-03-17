module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authenticate_user!, only: [:create]

      # GET /api/v1/auth/me
      def show
        render_success(user_json(current_user))
      end

      # POST /api/v1/auth/login
      def create
        user = User.find_by(email: params.dig(:user, :email)&.downcase&.strip)

        if user&.authenticate(params.dig(:user, :password))
          token = JwtService.token_for(user)
          render_success({ user: user_json(user), token: token })
        else
          render_error(["Invalid email or password"], status: :unauthorized)
        end
      end

      # DELETE /api/v1/auth/logout
      def destroy
        render_success({ message: "Logged out successfully" })
      end

      private

      def user_json(user)
        { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }
      end
    end
  end
end
