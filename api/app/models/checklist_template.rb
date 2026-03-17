class ChecklistTemplate < ApplicationRecord
  TRADE_TYPES = Project::TRADE_TYPES

  has_many :checklists, foreign_key: :checklist_template_id, dependent: :nullify

  enum :trade_type, TRADE_TYPES.zip(TRADE_TYPES).to_h, prefix: true

  validates :name, presence: true
  validates :trade_type, inclusion: { in: TRADE_TYPES }, allow_nil: true

  scope :defaults, -> { where(is_default: true) }
  scope :for_trade, ->(trade) { where(trade_type: trade) }

  def item_titles
    items.map { |i| i["title"] }
  end
end
