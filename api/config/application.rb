require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_cable/engine"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Api
  class Application < Rails::Application
    config.load_defaults 7.1

    # API-only mode
    config.api_only = true

    # Use UUID primary keys by default
    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
    end

    # Time zone
    config.time_zone = "UTC"

    # Eager load paths
    config.eager_load_paths << Rails.root.join("app/services")
    config.eager_load_paths << Rails.root.join("app/serializers")
    config.eager_load_paths << Rails.root.join("app/errors")

    # Active Job queue adapter
    config.active_job.queue_adapter = :sidekiq

    # Autoload lib
    config.autoload_lib(ignore: %w[assets tasks])
  end
end
