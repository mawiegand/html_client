/* Author: Jona Boeddinghaus <jona@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createProfileHUDControlsView = function(spec, my) {

    var that;
    
    var _avatarView;
    var _presentAvatarString = null;
    var _nameLabelButton;
    var _levelButton;
    var _allianceButton;
    
    var _currentCharacterRank = 0;
    var _currentCharacterProgress = 0;
    
    my = my || {};
    
    my.typeName = "ProfileHUDControlsView";
    
    my.controller = null;
    my.container = null;
    
    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
      updateIfNeeded: AWE.Ext.superior(that, "updateIfNeeded"),
    };
    
    /** overwritten view methods */
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      
      this.recalcView();

      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
      my.container.width  = my.frame.size.width;
      my.container.height = my.frame.size.height;      
    }
    
    that.recalcView = function() {
    
      var character = AWE.GS.game.get('currentCharacter');
      var allianceId = character.get('alliance_id');

      if (!_avatarView || AWE.GS.game.getPath('currentCharacter.avatar_string') != _presentAvatarString) {

        if (_avatarView) {
          this.removeChild(_avatarView);
        }
        _avatarView = AWE.UI.createAvatarView();
        _avatarView.initWithControllerAndAvatar(my.controller, AWE.GS.game.getPath('currentCharacter.avatar')); // TODO: get and pass avatar
        _avatarView.setFrame(AWE.Geometry.createRect(90, 10, 96, 96));
        _avatarView.onClick = function() { 
          my.controller.avatarImageClicked();
        };
        this.addChild(_avatarView);

        _presentAvatarString = AWE.GS.game.getPath('currentCharacter.avatar_string');
        _avatarView.setNeedsUpdate();
        _avatarView.setNeedsDisplay();
        _avatarView.setNeedsLayout();
      }
  
      if (!_nameLabelButton) {
        _nameLabelButton = AWE.UI.createButtonView();
        _nameLabelButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/profile/namelabel/background"));
        _nameLabelButton.setFrame(AWE.Geometry.createRect(65, 105, 176, 48));
        _nameLabelButton.setFont("bold 20px HVDComicSerifPro");
        _nameLabelButton.onClick = function() {
          my.controller.avatarLabelClicked();
        };              
        this.addChild(_nameLabelButton);
      }  
      
      var name = character.get('name');
      if (_nameLabelButton.text() != name) {
        _nameLabelButton.setText(name);
      }

      if (!_levelButton) {
        _levelButton = AWE.UI.createProfileLevelView();
        _levelButton.initWithControllerAndFrame(my.controller, AWE.Geometry.createRect(3, 88, 76, 76));
        _levelButton.onClick = function() {
          my.controller.avatarLevelClicked();
        };
        this.addChild(_levelButton);
        
        var rankAndProgress = this.calculateCharacterProgress();
        _currentCharacterRank = rankAndProgress.rank;
        _currentCharacterProgress = rankAndProgress.progress;
        _levelButton.setRankAndProgress(_currentCharacterRank, _currentCharacterProgress);            
      } 
      
      if (!_allianceButton && character && allianceId) {
        _allianceButton = AWE.UI.createButtonIconView();
        _allianceButton.initWithControllerImageAndIcon(my.controller, 
          AWE.UI.ImageCache.getImage("hud/profile/alliance/button"),
          AWE.UI.ImageCache.getImage("hud/profile/alliance/icon")
        );
        _allianceButton.setFrame(AWE.Geometry.createRect(162, 170, 96, 96));        
        _allianceButton.onClick = function() {
          my.controller.allianceFlagClicked(allianceId);
        };
        this.addChild(_allianceButton);
      }
      
      if (_allianceButton && character && (allianceId === undefined || allianceId === null || allianceId === 0)) {
        this.removeChild(_allianceButton);
        _allianceButton = null;
      }
      
    };      
    
    that.calculateCharacterProgress = function() {
      var ranks   = AWE.GS.RulesManager.getRules().character_ranks.mundane;
      var character = AWE.GS.game.get('currentCharacter');
      var presentRank = character.get('mundane_rank');
      
      if (presentRank !== undefined && presentRank !== null) {
              
        var infos = [];
        for (var i=Math.max(presentRank,1); i < ranks.length; i++) { // don't display first rank (Zero Experience)
          infos.push({
            rule:        ranks[i],
            position:    ranks[i].exp,
            presentRank: i === presentRank,
          });
          if (i !== presentRank && ranks[i].settlement_points > 0) {
            break ;
          }
        }
      
        var maxExp = infos[infos.length-1].position;
        var minExp = infos[0].position;

        if(minExp > character.get('exp'))//prevent wrong progress on lvl 1
          minExp = 0;        
      
        var ownPosition = (((character.get('exp') - minExp)*100)/(maxExp - minExp));

        if(ownPosition < 0)//prevent negative progress
          ownPosition = 0;
          
        return { rank: presentRank, progress: ownPosition };
      }
      
      return { rank: 0, progress: 0 };
    };
    
    that.updateView = function() {
      this.recalcView();            
      
      _super.updateView();      
    }
    
    /** checks for itself whether the view needs an update */
    that.updateIfNeeded = function() {
      var changed = false;
      
      if (AWE.GS.game.getPath('currentCharacter.avatar_string') != _presentAvatarString) {
        changed = true;
      }
      
      if (!changed) {
        var rankAndProgress = this.calculateCharacterProgress();
        if (rankAndProgress.rank !== _currentCharacterRank || rankAndProgress.progress !== _currentCharacterProgress) {
          _currentCharacterRank = rankAndProgress.rank;
          _currentCharacterProgress = rankAndProgress.progress;
          changed = true;
        }            
      }
      
      if (changed) { 
        this.setNeedsUpdate();
      }
      _super.updateIfNeeded();
    } 
    
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));


