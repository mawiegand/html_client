require 'identity_provider/access'

class CanvasController < ApplicationController

  def show
    @title = "Wack-A-Doo"
    
    @app_id = "127037377498922";
    @canvas_page = "http://apps.facebook.com/wack-a-doo";
    @auth_url = "https://www.facebook.com/dialog/oauth?client_id=#{ @app_id }&redirect_uri=#{ URI::escape(@canvas_page) }";

    @signed_request = params[:signed_request] || "";
    
    logger.debug "Signed Request: #{ @signed_request }"
    
    data = decode_facebook_hash(@signed_request)

#   if !params[:code].blank?
#     data = ActiveSupport::JSON.decode(Base64.decode64(params[:code]))
#     logger.debug "Code: #{ code.inspect }"
#   end
    
    logger.debug "Facebook Data: #{data.inspect}."    
    
    @facebook_user = data.nil? || data["user_id"].blank? ? nil :  data["user_id"]    
    
    if !@facebook_user.nil?
      access = IdentityProvider::Access.new(identity_provider_base_url: CLIENT_CONFIG['identity_provider_base_url'])
      @access_data = access.obtain_access_token(@facebook_user)
    end
  end
  
  
  def create
        @title = "Wack-A-Doo"

        @app_id = "127037377498922";
        @canvas_page = "http://apps.facebook.com/wack-a-doo";
        @auth_url = "https://www.facebook.com/dialog/oauth?client_id=#{ @app_id }&redirect_uri=#{ URI::escape(@canvas_page) }";

        @signed_request = params[:signed_request] || "";

        logger.debug "Signed Request: #{ @signed_request }"

        data = decode_facebook_hash(@signed_request)

    #    if !params[:code].blank?
    #      data = ActiveSupport::JSON.decode(Base64.decode64(params[:code]))
    #      logger.debug "Code: #{ code.inspect }"
    #    end

        logger.debug "Facebook Data: #{data.inspect}."    

        @facebook_user = data.nil? || data["user_id"].blank? ? nil :  data["user_id"]    
    
        if !@facebook_user.nil?
          access = IdentityProvider::Access.new(identity_provider_base_url: CLIENT_CONFIG['identity_provider_base_url'])
          @access_data = access.obtain_access_token(@facebook_user)
        end
    
    
    render action: "show"
  end
  
  protected
  
    def decode_facebook_hash(signed_request)
      return nil   if signed_request.blank?
      
      signature, encoded_hash = signed_request.split('.')
      
      encoded_hash = encoded_hash + "=" * (6 - encoded_hash.size % 6) unless encoded_hash.size % 6 == 0
      ActiveSupport::JSON.decode(Base64.decode64(encoded_hash))
    end

end