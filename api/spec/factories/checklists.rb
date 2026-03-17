FactoryBot.define do
  factory :checklist do
    association :project
    name { Faker::Lorem.words(number: 3).join(" ").titleize }
    position { 1 }
  end
end
