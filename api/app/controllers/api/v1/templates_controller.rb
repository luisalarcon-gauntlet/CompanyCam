module Api
  module V1
    class TemplatesController < ApplicationController
      # GET /api/v1/templates
      def index
        templates = ChecklistTemplate.defaults

        if params[:trade_type].present?
          templates = templates.for_trade(params[:trade_type])
        end

        render_success(templates.map { |t| template_json(t) })
      end

      # GET /api/v1/templates/:id
      def show
        template = ChecklistTemplate.find(params[:id])
        render_success(template_json(template, include_items: true))
      end

      private

      def template_json(template, include_items: false)
        data = {
          id: template.id,
          name: template.name,
          trade_type: template.trade_type,
          item_count: template.items.length,
          is_default: template.is_default
        }

        data[:items] = template.items if include_items

        data
      end
    end
  end
end
