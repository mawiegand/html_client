/* Authors: Patrick Fox <patrick@5dlab.com>
 *          Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createArtifactInspectorView = function(spec, my) {

    var that;

    my = my || {};
    
    var _nameLabelView = null;
    var _ownerLabelView = null;
    var _locationLabelView = null;

    var _artifactView = null;

    that = module.createInspectorView(spec, my);

    my.typeName = 'ArtifactInspectorView';

    var _super = {
      initWithControllerAndAllianceId: AWE.Ext.superior(that, "initWithControllerAndAllianceId"),
      layoutSubviews:                  AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:                        AWE.Ext.superior(that, "setFrame"),
      updateView:                      AWE.Ext.superior(that, "updateView"),
      recalcView:                      AWE.Ext.superior(that, "recalcView"),
    };
    
    that.onFlagClicked = null;

    /** overwritten view methods */
    
    that.initWithControllerAndArtifact = function(controller, artifact, frame) {
      _super.initWithControllerAndAllianceId(controller, artifact ? artifact.get('alliance_id') : null, frame);
      
      my.inspectedObject = artifact;
      
      this.setSkimButtonsEnabled(false);

      that.recalcView();
    };
    
    that.recalcView = function () {

      var artifact = my.inspectedObject;

      var allianceId = artifact ? artifact.get('alliance_id') : null;
      var allianceColor = artifact ? artifact.get('alliance_color') : null;

      this.setAllianceId(allianceId);
      this.setAllianceColor(allianceColor);

      _super.recalcView();


      if (artifact.get('name') != that.getText()) {
        that.setText(artifact.get('name'));
      }

    };

    that.artifact = function() {
      return my.inspectedObject;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




