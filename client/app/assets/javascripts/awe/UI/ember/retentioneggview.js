/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2015 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.EggView = Ember.View.extend({
    templateName: 'egg-view',
    classNames: ['egg-container'],
    
    controller: null,

    startDate: null,
    endDate: null,

    bonus: {},

    remainingTime: 0,

    showEgg: function() {
      if(this.get('startDate') !== null)
      {
        return true;
      }
      return false;
    }.property('startDate'),

    isActive: function() {
      if(this.get('remainingTime') <= 0)
      {
        return true;
      }
      return false;
    }.property("remainingTime"),

    duration: function() {
      if(this.get('startDate') && this.get('endDate'))
      {
        var difference = this.get('endDate').getTime() - this.get('startDate').getTime();
        var seconds = difference / 1000;
        return seconds;
      }
      return false;
    }.property('startDate', 'endDate'),

    setRemainingTime: function(time) {
      this.set('remainingTime', time);
    },

    progressBarWidth: function() {
      if(this.get('remainingTime') && this.get('duration'))
      {
        var percent = 100 - (this.get('remainingTime') / this.get('duration') * 100);
        return "width: " + percent + "%";
      }
      return null;
    }.property("remainingTime", "duration"),


    eggClicked: function() {
      if(this.get('isActive'))
      {
        var bonus = this.get('bonus');
        var dialog = AWE.UI.Ember.EggRedeemDialog.create({
          controller: this.get('controller'),
          bonusStone: bonus.stone,
          bonusWood: bonus.wood,
          bonusFur: bonus.fur,
          eggView: this
        })

        WACKADOO.presentModalDialog(dialog);
        //this.set('startDate', null);
      }
      else
      {
        var info = AWE.UI.Ember.InfoDialog.create({
          heading:             AWE.I18n.lookupTranslation('extras.retentionEgg.alertHeading'),
          message:             AWE.I18n.lookupTranslation('extras.retentionEgg.alertContent'),
        });
        WACKADOO.presentModalDialog(info);
      }
    },

    updateStartTime: function() {
      var self = this;
      AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
        self.set('startDate', AWE.GS.CharacterManager.getCurrentCharacter().can_redeem_retention_bonus_start_time);
      });
    },
  });

  module.EggRedeemDialog = module.Dialog.extend({
    templateName: 'egg-redeem-dialog',

    controller: null,

    bonusStone: 0,
    bonusWood: 0,
    bonusFur: 0,

    okClicked: function() {
      this.get('controller').createRedeemRetentionAction(this.get('eggView'));
      this.destroy();
    },

    closeClicked: function() {
      this.destroy();
    }
  });
      
  return module;
    
}(AWE.UI.Ember || {}));