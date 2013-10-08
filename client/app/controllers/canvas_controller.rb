require 'identity_provider/access'

class CanvasController < ApplicationController

  def show
    @title = "Wack-A-Doo"
    
    @app_id = "127037377498922"
    @canvas_page = "http://apps.facebook.com/wack-a-doo"
    @auth_url = "https://www.facebook.com/dialog/oauth?client_id=#{ @app_id }&redirect_uri=#{ URI::escape(@canvas_page) }"

    @signed_request = params[:signed_request] || ""
    
    logger.debug "Signed Request: #{ @signed_request }"
    
    data = decode_facebook_hash(@signed_request)

#   if !params[:code].blank?
#     data = ActiveSupport::JSON.decode(Base64.decode64(params[:code]))
#     logger.debug "Code: #{ code.inspect }"
#   end
    
    logger.debug "Facebook Data: #{data.inspect}."    
    
    @facebook_user = data.nil? || data["user_id"].blank? ? nil :  data["user_id"]    
    @facebook_user_data = data.nil? ? nil : (data["user"] || {})    
    @referer = request.referer  || "facebook.canvas"
    
    
    lang_mapping = {
      "de"=> "de_DE",
      "en"=> "en_US",
    }
    
    default_locale = "en_US"
    
    fb_locale = @facebook_user_data['locale']
    
    logger.debug "fb_locale #{ fb_locale } lang_mapping #{ lang_mapping.inspect }."
    
    if !fb_locale.blank?
      lang = fb_locale[0..1]
      @locale = lang_mapping[lang]
      logger.debug "locale #{ @locale } lang #{ lang }."
    end
    
    @locale = default_locale    if @locale.nil?
    logger.debug "after locale #{ @locale }."
    
    if !@facebook_user.nil?
      access = IdentityProvider::Access.new(identity_provider_base_url: CLIENT_CONFIG['identity_provider_base_url'])
      @access_data = access.obtain_access_token(@facebook_user)
    end
  end
  
  
  def create
    @title = "Wack-A-Doo"

    @app_id = "127037377498922"
    @canvas_page = "http://apps.facebook.com/wack-a-doo"
    @auth_url = "https://www.facebook.com/dialog/oauth?client_id=#{ @app_id }&redirect_uri=#{ URI::escape(@canvas_page) }"

    @signed_request = params[:signed_request] || ""

    logger.debug "Signed Request: #{ @signed_request }"

    data = decode_facebook_hash(@signed_request)

#    if !params[:code].blank?
#      data = ActiveSupport::JSON.decode(Base64.decode64(params[:code]))
#      logger.debug "Code: #{ code.inspect }"
#    end

    logger.debug "Facebook Data: #{data.inspect}."

    @facebook_user = data.nil? || data["user_id"].blank? ? nil :  data["user_id"]
    @facebook_user_data = data.nil? ? nil : (data["user"] || {})
    @referer = request.referer  || "facebook.canvas"

    lang_mapping = {
      "de" => "de_DE",
      "en" => "en_US",
    }

    default_locale = "en_US"

    fb_locale = @facebook_user_data['locale']

    logger.debug "fb_locale #{ fb_locale } lang_mapping #{ lang_mapping.inspect }."

    if !fb_locale.blank?
      lang = fb_locale[0..1]
      @locale = lang_mapping[lang]
      logger.debug "locale #{ @locale } lang #{ lang }."
    end

    @locale = default_locale    if @locale.nil?
    logger.debug "after locale #{ @locale }."

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
      
      encoded_hash += "=" * (4 - encoded_hash.length.modulo(4))
      ActiveSupport::JSON.decode(Base64.decode64(encoded_hash.tr('-_','+/')))
    end

end