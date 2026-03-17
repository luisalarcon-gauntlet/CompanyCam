module Api
  module V1
    class ChecklistItemsController < ApplicationController
      before_action :set_checklist, only: [:index, :create]
      before_action :set_item, only: [:show, :update, :destroy, :complete, :uncomplete]

      # GET /api/v1/checklists/:checklist_id/items
      def index
        items = @checklist.checklist_items.ordered
        render_success(items.map { |item| item_json(item) })
      end

      # GET /api/v1/items/:id
      def show
        render_success(item_json(@item))
      end

      # POST /api/v1/checklists/:checklist_id/items
      def create
        item = @checklist.checklist_items.build(item_params)
        if item.save
          render_success(item_json(item), status: :created)
        else
          render_error(item.errors.full_messages)
        end
      end

      # PATCH /api/v1/items/:id
      def update
        if @item.update(item_params)
          render_success(item_json(@item))
        else
          render_error(@item.errors.full_messages)
        end
      end

      # DELETE /api/v1/items/:id
      def destroy
        @item.destroy
        render_success({ message: "Item deleted" })
      end

      # POST /api/v1/items/:id/complete
      def complete
        via = params[:via] || "manual"
        @item.complete!(
          via: via,
          user: current_user,
          transcription: params[:transcription],
          photo_url: params[:photo_url],
          thumbnail_url: params[:photo_thumbnail_url],
          confidence: params[:ai_confidence]&.to_f
        )
        render_success(item_json(@item))
      end

      # POST /api/v1/items/:id/uncomplete
      def uncomplete
        @item.uncomplete!
        render_success(item_json(@item))
      end

      private

      def set_checklist
        @checklist = Checklist.joins(:project)
                              .where(projects: { user_id: current_user.id })
                              .find(params[:checklist_id])
      end

      def set_item
        @item = ChecklistItem.joins(checklist: :project)
                             .where(projects: { user_id: current_user.id })
                             .find(params[:id])
      end

      def item_params
        params.require(:item).permit(:title, :status, :position, :notes)
      end

      def item_json(item)
        {
          id: item.id,
          checklist_id: item.checklist_id,
          title: item.title,
          status: item.status,
          position: item.position,
          completed_at: item.completed_at,
          completed_via: item.completed_via,
          completed_by_id: item.completed_by_id,
          completed_by_name: item.completed_by&.name,
          notes: item.notes,
          photo_url: item.photo_url,
          photo_thumbnail_url: item.photo_thumbnail_url,
          ai_confidence: item.ai_confidence,
          voice_transcription: item.voice_transcription,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      end
    end
  end
end
