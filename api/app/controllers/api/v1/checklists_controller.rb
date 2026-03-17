module Api
  module V1
    class ChecklistsController < ApplicationController
      before_action :set_project, only: [:index, :create]
      before_action :set_checklist, only: [:show, :update, :destroy]

      # GET /api/v1/projects/:project_id/checklists
      def index
        checklists = @project.checklists.includes(:checklist_items)
        render_success(checklists.map { |cl| checklist_json(cl) })
      end

      # GET /api/v1/checklists/:id
      def show
        render_success(checklist_json(@checklist, include_items: true))
      end

      # POST /api/v1/projects/:project_id/checklists
      def create
        checklist = @project.checklists.build(checklist_params)

        if checklist.save
          # Load from template if template_id provided
          if params[:template_id].present?
            template = ChecklistTemplate.find_by(id: params[:template_id])
            if template
              template.items.each_with_index do |item, index|
                checklist.checklist_items.create!(
                  title: item["title"],
                  position: index + 1,
                  status: "incomplete"
                )
              end
            end
          end

          render_success(checklist_json(checklist, include_items: true), status: :created)
        else
          render_error(checklist.errors.full_messages)
        end
      end

      # PATCH /api/v1/checklists/:id
      def update
        if @checklist.update(checklist_params)
          render_success(checklist_json(@checklist, include_items: true))
        else
          render_error(@checklist.errors.full_messages)
        end
      end

      # DELETE /api/v1/checklists/:id
      def destroy
        @checklist.destroy
        render_success({ message: "Checklist deleted" })
      end

      private

      def set_project
        @project = current_user.projects.find(params[:project_id])
      end

      def set_checklist
        @checklist = Checklist.joins(:project)
                              .where(projects: { user_id: current_user.id })
                              .find(params[:id])
      end

      def checklist_params
        params.require(:checklist).permit(:name, :position)
      end

      def checklist_json(checklist, include_items: false)
        data = {
          id: checklist.id,
          project_id: checklist.project_id,
          name: checklist.name,
          position: checklist.position,
          total_count: checklist.total_count,
          completed_count: checklist.completed_count,
          completion_percentage: checklist.completion_percentage,
          is_complete: checklist.complete?,
          created_at: checklist.created_at
        }

        data[:items] = checklist.checklist_items.ordered.map { |item| item_json(item) } if include_items

        data
      end

      def item_json(item)
        {
          id: item.id,
          title: item.title,
          status: item.status,
          position: item.position,
          completed_at: item.completed_at,
          completed_via: item.completed_via,
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
