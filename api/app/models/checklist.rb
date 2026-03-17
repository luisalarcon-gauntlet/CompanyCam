class Checklist < ApplicationRecord
  belongs_to :project
  belongs_to :checklist_template, optional: true
  has_many :checklist_items, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }

  default_scope { order(position: :asc, created_at: :asc) }

  before_create :set_position

  def total_count
    checklist_items.count
  end

  def completed_count
    checklist_items.complete.count
  end

  def completion_percentage
    total = total_count
    return 0 if total.zero?
    ((completed_count.to_f / total) * 100).round
  end

  def complete?
    total_count > 0 && completed_count == total_count
  end

  private

  def set_position
    max_position = project.checklists.maximum(:position) || 0
    self.position = max_position + 1
  end
end
