class ClientController < ApplicationController
  
  def show
    @title = "Wack-A-Doo"
    
    @do_tracking  = params.has_key? "signup"
    
    #@use_facebook = params.has_key? "facebook_cheat"
  end

end