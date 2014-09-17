/**
 * @fileOverview 
 * Ember JS views for the alliance screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:marc@5dlab.com">Marc Wißler</a>
 */ 

 var AWE = AWE || {};
 AWE.UI = AWE.UI || {};

 AWE.UI.Ember = (function(module) {

    module.AllianceView = module.PopUpDialog.extend({
        templateName: 'alliance-view',
        classNames: ['alliance-view'],

        alliance: null,

        isAllianceLeader: function() {
          var leaderId = this.getPath('alliance.leader_id');
          var characterId = AWE.GS.game.getPath('currentCharacter.id');
          return leaderId && leaderId === characterId;
        }.property('alliance.leader_id', 'AWE.GS.game.currentCharacter.id').cacheable(),

        ownAlliance: function() {
          var allianceId = this.getPath('alliance.id');
          var ownAllyId = AWE.GS.game.getPath('currentCharacter.alliance_id');
          return allianceId && allianceId === ownAllyId;
        }.property('alliance.id', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),

        isNotAllianceMember: function() {
          var currentCharacter = AWE.GS.game.get('currentCharacter');
          return currentCharacter.get('alliance_id') !== this.get('alliance').getId();
        }.property('alliance', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),

        open: function() {
          WACKADOO.presentModalDialog(this);
        }

    });

    module.AllianceMemberView = module.PopUpDialog.extend({
        templateName: 'alliance-member',
        
        character:  null,
        alliance:   null,
        controller: null,
        
        isLeader: function() {
          var cid      = this.getPath('character.id');
          var leaderId = this.getPath('alliance.leader_id');
          return cid !== undefined && cid !== null && cid === leaderId;
        }.property('character.id', 'alliance.leader_id'),
        
        kickMember: function() {
          var parentView = this.get('parentView');
          if (parentView) {
            parentView.kickMember(this.get('character'));
          }
          return false; //prevent default action!
        },
        
        open: function() {
          WACKADOO.presentModalDialog(this);
        }
    });
 return module;
    
}(AWE.UI.Ember || {}));