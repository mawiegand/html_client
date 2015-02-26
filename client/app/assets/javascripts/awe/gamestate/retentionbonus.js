/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2015 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.GS = (function(module) {
          
  module.RetentionBonus = Ember.Object.extend({

    startTime: null,
    endTime: null,

    bonus: null,

    duration: 0,

    view: null,

    initAtTargetView: function(targetView) {
      var view = AWE.UI.Ember.EggView.create({
        controller: this,
        bonus: this.bonus,
        startDate: this.startTime,
        endDate: this.endTime
      });
      view.appendTo(targetView);

      this.view = view;
      this.calculateDuration();
    },

    isActive: function() {
      if(this.startTime !== null && this.endTime !== null)
      {
        var now = new Date();
        var difference = (this.endTime.getTime() - now.getTime()) / 1000;
        if(difference < -1)
        {
          return true;
        }
      }
      return false;
    },

    updateRemainingTime: function() {
      if(this.startTime !== null && this.endTime !== null)
      {
        var now = new Date();
        var difference = this.endTime.getTime() - now.getTime();

        this.view.setRemainingTime(difference/1000);
      }
    },

    calculateDuration: function() {
      if(this.startTime !== null && this.endTime !== null)
      {
        var difference = this.endTime.getTime() - this.startTime.getTime();
        var seconds = difference / 1000;

        this.duration = seconds;
        return seconds;
      }
    },

    createRedeemRetentionAction: function(eggView) {
      var redeemAction = AWE.Action.Extras.createRedeemRetentionAction();
      redeemAction.send(function (status) {
        if(status === AWE.Net.OK)
        {
          eggView.updateStartTime();
        }
      });
    },

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 
    

    runloop: function() {
      if(!this.isActive())
      {
        this.updateRemainingTime();
      }
    },

  });
    
    
  return module;
    
}(AWE.GS || {}));