class ClientController < ApplicationController
  
  def show
    @title = "Wack-A-Doo"
    
    @do_tracking = params.has_key? "signup"
  end

end