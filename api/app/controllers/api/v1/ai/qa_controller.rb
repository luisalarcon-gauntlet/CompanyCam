module Api
  module V1
    module Ai
      class QaController < ApplicationController
        # POST /api/v1/ai/ask
        # Body: { question: "...", project_id: "..." }
        def create
          question = params[:question].to_s.strip
          return render_error("question is required") if question.blank?

          project = current_user.projects.find_by(id: params[:project_id])
          return render_error("Project not found", status: :not_found) unless project

          checklists = project.checklists.includes(:checklist_items).order(:position, :created_at)

          if checklists.empty?
            return render_success({ answer: "This project has no checklists yet." })
          end

          result = ::Ai::QaService.new(
            question: question,
            project: project,
            checklists: checklists
          ).call

          unless result.success?
            return render_error(result.error, status: :service_unavailable)
          end

          render_success(result.data)
        end
      end
    end
  end
end
