module Api
  module V1
    class RegistrationsController < ApplicationController
      skip_before_action :authenticate_user!

      def create
        user = User.new(registration_params)
        if user.save
          token = JwtService.token_for(user)
          render_success({ user: user_json(user), token: token }, status: :created)
        else
          render_error(user.errors.full_messages)
        end
      end

      private

      def registration_params
        params.require(:user).permit(:name, :email, :password, :password_confirmation)
      end

      def user_json(user)
        { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }
      end
    end
  end
end
