/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  ////////////////////////////////////////////////////////////////////////////
  //
  //  CHANGE ALLIANCE PASSWORD
  //
  ////////////////////////////////////////////////////////////////////////////

  module.createChangeAlliancePasswordAction = function(alliance, password, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.alliancePasword = password || "";
    my.alliance = alliance || 0;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'fundamental_alliance[password]='+escape(password); 
    }
    
    that.getURL = function() { return AWE.Config.FUNDAMENTAL_SERVER_BASE+'/alliances/'+alliance.getId();; }
  
    that.getHTTPMethod = function() { return 'PUT'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.OK) {
        AWE.GS.AllianceManager.updateAlliance(alliance.getId());
      }
    }  
    return that;
  };
  

  return module;
  
}(AWE.Action.Fundamental || {}));