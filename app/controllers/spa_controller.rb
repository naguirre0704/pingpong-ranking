# Serves the React single-page app shell. All client-side routes
# (ranking, registrar, jugadores, historial, reglas) render this same view;
# React Router takes over on the client.
class SpaController < ApplicationController
  def index
    render html: nil, layout: true
  end
end
