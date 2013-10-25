class ClientController < ApplicationController
  
  def show
    @title = "Wack-A-Doo"
    
    @do_tracking  = params.has_key? "signup"
  end

  def create
    @title = "Wack-A-Doo"

    @do_tracking  = params.has_key? "signup"

    @fb_args = params['fb_args']

    logger.debug "---> params #{params}"
    logger.debug "---> fb_args #{@fb_args}"

    render template: "client/show"
  end

end