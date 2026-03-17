FactoryBot.define do
  factory :user do
    name { Faker::Name.full_name }
    email { Faker::Internet.unique.email }
    password { "password123" }
    password_confirmation { "password123" }
    role { "tech" }
  end
end
