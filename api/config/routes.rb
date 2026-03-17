Rails.application.routes.draw do
  # Health check
  get "up", to: proc { [200, {}, ["OK"]] }

  namespace :api do
    namespace :v1 do
      # Auth
      post "auth/signup",  to: "registrations#create"
      post "auth/login",   to: "sessions#create"
      delete "auth/logout", to: "sessions#destroy"
      get "auth/me",       to: "sessions#show"

      # Projects
      resources :projects do
        # Checklists nested under projects
        resources :checklists, only: [:index, :create]
      end

      # Checklists (standalone for update/delete)
      resources :checklists, only: [:show, :update, :destroy] do
        resources :items, controller: "checklist_items", only: [:index, :create]
      end

      # Checklist Items (standalone for update/delete/complete)
      resources :items, controller: "checklist_items", only: [:show, :update, :destroy] do
        member do
          post :complete
          post :uncomplete
        end
      end

      # Templates
      resources :templates, only: [:index, :show]

      # AI endpoints
      namespace :ai do
        post "voice-match", to: "voice_match#create"
        post "photo-match", to: "photo_match#create"
        post "ask",         to: "qa#create"
      end

      # Photo upload
      namespace :uploads do
        post "photo", to: "photos#create"
      end
    end
  end
end
