FROM ruby:3.2.2-slim

# Install system dependencies
RUN apt-get update -qq && \
    apt-get install -y build-essential libpq-dev libvips git curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /rails

# Copy Gemfile first for layer caching
COPY Gemfile Gemfile.lock* ./

RUN bundle install

# Copy the rest of the app
COPY . .

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
