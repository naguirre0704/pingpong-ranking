Rails.application.routes.draw do
  # Health check for load balancers / uptime monitors.
  get "up" => "rails/health#show", as: :rails_health_check

  # JSON API consumed by the React front-end.
  namespace :api do
    get "ranking", to: "ranking#index"
    resources :players, only: %i[index show create update destroy]
    resources :matches, only: %i[index create update destroy]
    post "session", to: "sessions#create"
  end

  # SPA shell: root + every non-API/non-asset path renders React.
  root "spa#index"
  get "*path", to: "spa#index", constraints: ->(req) {
    !req.path.start_with?("/api", "/vite", "/up", "/rails", "/assets")
  }
end
