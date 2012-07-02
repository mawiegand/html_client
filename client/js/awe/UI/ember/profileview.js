/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/profileview.html');  

  /**
   * @class
   *
   * View that allows the user to edit his profile.
   *   
   * @name AWE.UI.Ember.ProfileView 
   */
  module.ProfileView = AWE.UI.Ember.Dialog.extend( /** @lends AWE.UI.Ember.ProfileView# */ {
    templateName: 'character-profile-view',
    
    changingName: false,
      
    firstNameChange: function() {
      var count = this.getPath('character.name_change_count');
      return count === undefined || count === null || count === 0;
    }.property('character.name_change_count'), 
    
    changeNamePressed: function() {
      this.set('message', null);
      var changeDialog = AWE.UI.Ember.TextInputDialog.create({
        classNames: ['change-army-name-dialog'],
        heading: 'Enter the new name of your character.',
        input: this.getPath('character.name'),
        controller: this,
        
        okPressed: function() {
          var controller = this.get('controller');
          if (controller) {
            controller.processNewName(this.getPath('input'));
          }
          this.destroy();            
        },
        
        cancelPressed: function() { this.destroy(); },
      });
      WACKADOO.presentModalDialog(changeDialog);
    },
    
    processNewName: function(newName) {
      
      if (!newName || newName.length < 3) {
        this.set('message', 'Way to short. The name must have at least 3 characters.');
      }
      else if (!newName || newName.length > 12) {
        this.set('message', 'Way to long. The name must be shorter than 12 characters.');
      }
      else if (newName === this.getPath('character.name')) {
        this.set('message', 'Same name as before. Did nothing.');
      }      
      else {  // now, really send the name
        var self = this;
        var changeCounter = this.getPath('character.name_change_count');
        this.set('changingName', true);
        var action = AWE.Action.Fundamental.createChangeCharacterNameAction(newName);
        AWE.Action.Manager.queueAction(action, function(status) {
          self.set('changingName', false);
          if (status === AWE.Net.OK) {
            if (changeCounter > 0) {
              AWE.GS.ResourcePoolManager.updateResourcePool();
            }
          }
          else if (status === AWE.Net.CONFLICT) {
            self.set('message', 'This name is already taken or on the black list. Please choose another name.')
          }
          else if (status === AWE.Net.FORBIDDEN) {
            self.set('message', "You don't have enough toads to pay for this name change.")
          }
          else {
            self.set('message', 'The name could not be changed for unknown reasons. Please try a different one.');
          }
        });        
      }
    },
    
    closePressed: function() {
      this.destroy();
    },
    
  });
      
  return module;  
    
}(AWE.UI.Ember || {}));