class User < ApplicationRecord
  has_secure_password

  enum :role, { owner: "owner", crew_lead: "crew_lead", tech: "tech" }, prefix: true

  has_many :projects, dependent: :destroy
  has_many :completed_items, class_name: "ChecklistItem",
                              foreign_key: "completed_by_id",
                              dependent: :nullify

  validates :name, presence: true, length: { maximum: 100 }
  validates :email,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: /\A[^@\s]+@[^@\s]+\z/, message: "is not a valid email" }
  validates :password, length: { minimum: 8 }, allow_nil: true

  before_save :downcase_email

  private

  def downcase_email
    self.email = email.downcase
  end
end
