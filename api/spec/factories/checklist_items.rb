FactoryBot.define do
  factory :checklist_item do
    association :checklist
    title { Faker::Lorem.sentence(word_count: 4).chomp(".") }
    status { "incomplete" }
    position { 1 }

    trait :complete do
      status { "complete" }
      completed_at { Time.current }
      completed_via { "manual" }
      association :completed_by, factory: :user
    end

    trait :voice_complete do
      status { "complete" }
      completed_at { Time.current }
      completed_via { "voice" }
      voice_transcription { Faker::Lorem.sentence }
      ai_confidence { 0.92 }
    end
  end
end
