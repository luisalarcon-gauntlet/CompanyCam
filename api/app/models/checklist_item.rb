class ChecklistItem < ApplicationRecord
  STATUSES = %w[incomplete complete skipped].freeze
  COMPLETED_VIA_OPTIONS = %w[manual voice photo].freeze

  belongs_to :checklist
  belongs_to :completed_by, class_name: "User", optional: true

  enum :status, STATUSES.zip(STATUSES).to_h, prefix: true
  enum :completed_via, COMPLETED_VIA_OPTIONS.zip(COMPLETED_VIA_OPTIONS).to_h,
       prefix: true, allow_nil: true

  validates :title, presence: true, length: { maximum: 200 }
  validates :status, inclusion: { in: STATUSES }
  validates :ai_confidence, numericality: { greater_than_or_equal_to: 0.0,
                                            less_than_or_equal_to: 1.0 },
                             allow_nil: true

  scope :incomplete, -> { where(status: "incomplete") }
  scope :complete, -> { where(status: "complete") }
  scope :ordered, -> { order(position: :asc, created_at: :asc) }

  before_create :set_position

  def complete!(via:, user: nil, transcription: nil, photo_url: nil, thumbnail_url: nil, confidence: nil)
    update!(
      status: "complete",
      completed_at: Time.current,
      completed_via: via,
      completed_by: user,
      voice_transcription: transcription,
      photo_url: photo_url,
      photo_thumbnail_url: thumbnail_url,
      ai_confidence: confidence
    )
  end

  def uncomplete!
    update!(
      status: "incomplete",
      completed_at: nil,
      completed_via: nil,
      completed_by: nil,
      voice_transcription: nil,
      photo_url: nil,
      photo_thumbnail_url: nil,
      ai_confidence: nil
    )
  end

  private

  def set_position
    max_position = checklist.checklist_items.maximum(:position) || 0
    self.position = max_position + 1
  end
end
