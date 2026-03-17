module Api
  module V1
    class ProjectsController < ApplicationController
      before_action :set_project, only: [:show, :update, :destroy]

      # GET /api/v1/projects
      def index
        projects = current_user.projects.recent.includes(checklists: :checklist_items)

        if params[:search].present?
          term = "%#{params[:search].downcase}%"
          projects = projects.where(
            "LOWER(name) LIKE ? OR LOWER(address) LIKE ?", term, term
          )
        end

        render_success(projects.map { |p| project_json(p) })
      end

      # GET /api/v1/projects/:id
      def show
        render_success(project_json(@project, include_checklists: true))
      end

      # POST /api/v1/projects
      def create
        project = current_user.projects.build(project_params)
        if project.save
          render_success(project_json(project, include_checklists: true), status: :created)
        else
          render_error(project.errors.full_messages)
        end
      end

      # PATCH /api/v1/projects/:id
      def update
        if @project.update(project_params)
          render_success(project_json(@project, include_checklists: true))
        else
          render_error(@project.errors.full_messages)
        end
      end

      # DELETE /api/v1/projects/:id
      def destroy
        @project.destroy
        render_success({ message: "Project deleted" })
      end

      private

      def set_project
        @project = current_user.projects.find(params[:id])
      end

      def project_params
        params.require(:project).permit(:name, :address, :trade_type, :notes)
      end

      def project_json(project, include_checklists: false)
        data = {
          id: project.id,
          name: project.name,
          address: project.address,
          trade_type: project.trade_type,
          notes: project.notes,
          total_items_count: project.total_items_count,
          completed_items_count: project.completed_items_count,
          completion_percentage: project.completion_percentage,
          created_at: project.created_at,
          updated_at: project.updated_at
        }

        if include_checklists
          data[:checklists] = project.checklists.map do |cl|
            checklist_json(cl)
          end
        end

        data
      end

      def checklist_json(checklist)
        {
          id: checklist.id,
          name: checklist.name,
          position: checklist.position,
          total_count: checklist.total_count,
          completed_count: checklist.completed_count,
          completion_percentage: checklist.completion_percentage,
          is_complete: checklist.complete?,
          items: checklist.checklist_items.ordered.map { |item| item_json(item) }
        }
      end

      def item_json(item)
        {
          id: item.id,
          title: item.title,
          status: item.status,
          position: item.position,
          completed_at: item.completed_at,
          completed_via: item.completed_via,
          completed_by_name: item.completed_by&.name,
          notes: item.notes,
          photo_url: item.photo_url,
          photo_thumbnail_url: item.photo_thumbnail_url,
          ai_confidence: item.ai_confidence,
          voice_transcription: item.voice_transcription
        }
      end
    end
  end
end
