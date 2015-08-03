class ClientController < ApplicationController
  
  def show
    @title = "Wack-A-Doo"
    
    @do_tracking  = params.has_key? "signup"
    
    @google_pixel = false
    @crobo_pixel  = false
    if params.has_key? "ref_id"
      @google_pixel = params["ref_id"] == "0004-000" || params["ref_id"] == "0005-000"
      @crobo_pixel  = params["ref_id"] == "0007-000"
    end
  end

  def create
    @title = "Wack-A-Doo"

    @do_tracking  = params.has_key? "signup"
    
    @google_pixel = false
    @crobo_pixel  = false
    if params.has_key? "ref_id"
      @google_pixel = params["ref_id"] == "0004-000" || params["ref_id"] == "0005-000"
      @crobo_pixel  = params["ref_id"] == "0007-000"
    end

    @fb_args = params['fb_args']

    logger.debug "---> params #{params}"
    logger.debug "---> fb_args #{@fb_args}"

    render template: "client/show"
  end

end