class Project < ApplicationRecord
  TRADE_TYPES = %w[
    roofing hvac plumbing electrical general
    painting landscaping flooring fencing solar
    windows_doors restoration pool other
  ].freeze

  belongs_to :user
  has_many :checklists, dependent: :destroy

  enum :trade_type, TRADE_TYPES.zip(TRADE_TYPES).to_h, prefix: true

  validates :name, presence: true, length: { maximum: 100 }
  validates :trade_type, inclusion: { in: TRADE_TYPES }, allow_nil: true

  scope :recent, -> { order(updated_at: :desc) }
  scope :by_name, -> { order(name: :asc) }

  def total_items_count
    checklists.joins(:checklist_items).count
  end

  def completed_items_count
    checklists.joins(:checklist_items)
              .where(checklist_items: { status: "complete" })
              .count
  end

  def completion_percentage
    total = total_items_count
    return 0 if total.zero?
    ((completed_items_count.to_f / total) * 100).round
  end
end
