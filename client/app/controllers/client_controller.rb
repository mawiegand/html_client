class ClientController < ApplicationController
  
  def show
    @title = "Wack-A-Doo"
    
    @do_tracking  = params.has_key? "signup"
  end

  def update
    @title = "Wack-A-Doo"

    @do_tracking  = params.has_key? "signup"

    @fb_args = params['fb_args']

    render template: "client/show"
  end

end