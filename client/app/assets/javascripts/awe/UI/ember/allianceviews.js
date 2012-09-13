/**
 * @fileOverview 
 * Ember JS views for the settlement screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {

  module.AllianceScreenView = Ember.View.extend({
    templateName: 'alliance-screen',
    
    controller: null,
    alliance:   null,
    
    isAllianceLeader: function() {
      var leaderId = this.getPath('alliance.leader_id');
      var characterId = AWE.GS.player.getPath('currentCharacter.id');
      return leaderId && leaderId === characterId;
    }.property('alliance.leader_id', 'AWE.GS.player.currentCharacter.id').cacheable(),

    
    ownAlliance: function() {
      var allianceId = this.getPath('alliance.id');
      var ownAllyId = AWE.GS.player.getPath('currentCharacter.alliance_id');
      return allianceId && allianceId === ownAllyId;
    }.property('alliance.id', 'AWE.GS.player.currentCharacter.alliance_id').cacheable(),
    
  });
  
  module.AllianceInfoBoxView = Ember.View.extend({
    templateName: 'alliance-infobox',
    
    controller: null,
    alliance:   null,
    
    creation: function() {
      return AWE.Util.createTimeString(this.getPath('alliance.created_at'));
    }.property('alliance.created_at').cacheable(),
    
  });

  module.AllianceMemberListView = Ember.View.extend({
    templateName: 'alliance-member-list',
    
    controller: null,
    alliance:   null,
  });
  
  module.AllianceManagementView = Ember.View.extend({
    templateName: 'alliance-management',
    controller:    null,
    alliance:      null,
    
    password:      null,
    
    errorMessage:  null,
    ongoingAction: null,
    
    resetError: function() {
      this.set('errorMessage', null);
    },
    
    startAction: function() {
      this.set('ongoingAction', true);
    },
    endAction: function() {
      this.set('ongoingAction', false);
    },
    
    displayPresentPassword: function() {
      this.set('password', this.getPath('alliance.password'));
    }.observes('alliance.password'),
    
    changePassword: function() {
      var self     = this;
      var password = this.get('password');
      var alliance = this.get('alliance');
      
      this.resetError();
      
      if (!password) {
        this.set('errorMessage', 'Setting a blank password is not possible.');
        this.displayPresentPassword();
        return ;
      }
      
      if (password === this.getPath('alliance.password')) { // do nothing, password hasn't changed
        return ;
      }
      
      var action = AWE.Action.Fundamental.createChangeAlliancePasswordAction(alliance, password);
      this.startAction();
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode !== 200) {
          self.set('errorMessage', 'For some reason, setting the alliance password did fail.')
        }
        self.endAction();
      });       
    }, 
    
    modifiedPassword: function() {
      return this.get('password') !== this.getPath('alliance.password');
    }.property('alliance.password', 'password').cacheable(),
       
  });
  
  
  module.AllianceBannerView = AWE.UI.Ember.Pane.extend({
    width: 200,
    height: 200,
    
    alliance: null,
    shape: null,
    controller: null,
    
    init: function() {
      this._super();
      this.bannerUpdate();
    },
    
    bannerUpdate: function() {
      var allianceId = this.getPath('alliance.id');
      var shape  = this.get('shape');
      var width  = this.get('width')  || 200;
      var height = this.get('height') || 200;
      
      if (width * 5 / 4 < height) {
        height = width * 5 / 4; 
      }
      else {
        width = height * 4 / 5;
      }
      if (shape) {
        this.removeChild(shape);
      }
      if (!allianceId) {
        this.set('shape', null);
        return ;
      }
      console.log('SHAPE', width, height, allianceId);
      shape = AWE.UI.createAllianceFlagView();
      shape.initWithController(this.get('controller'));
      shape.setFrame(AWE.Geometry.createRect(0, 0, width, height));
      shape.setAllianceId(allianceId);
      shape.setTagVisible(true);
      shape.setDirection('down');
      this.addChild(shape);
      this.set('shape', shape);
      shape.updateView();      
    }.observes('alliance.id'),
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

