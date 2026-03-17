FactoryBot.define do
  factory :project do
    association :user
    name { Faker::Company.name }
    address { Faker::Address.full_address }
    trade_type { "roofing" }
    notes { Faker::Lorem.sentence }
  end
end
