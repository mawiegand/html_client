class CanvasController < ApplicationController

  def show
    @title = "Wack-A-Doo"
    
    @app_id = "127037377498922";
    @canvas_page = "https://test1.wack-a-doo.com/client/canvas/";
    @auth_url = "https://www.facebook.com/dialog/oauth?client_id=#{ @app_id }&redirect_uri=#{ URI::escape(@canvas_page) }";

    @signed_request = params[:signed_request] || "";
    
    logger.debug "Signed Request: #{ @signed_request }"
    
    data = decode_facebook_hash(@signed_request)
    
    logger.debug "Facebook Data: #{data}."
    
    @facebook_user = data["user_id"]    unless data.nil? || data["user_id"].blank?

  end
  
  protected
  
    def decode_facebook_hash(signed_request)
      return nil   if signed_request.blank?
      
      signature, encoded_hash = signed_request.split('.')
      ActiveSupport::JSON.decode(Base64.decode64(encoded_hash))
    end

end