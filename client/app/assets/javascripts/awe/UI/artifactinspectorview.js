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
    var _locationLabelView = null;

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

      that.recalcView();
    };
    
    that.recalcView = function () {

      var artifact = my.inspectedObject;

      var allianceId = artifact ? artifact.get('alliance_id') : null;

      this.setAllianceId(allianceId);

      _super.recalcView();

      if (!_nameLabelView) {
        _nameLabelView = AWE.UI.createLabelView();
        _nameLabelView.initWithControllerAndLabel(my.controller);
        _nameLabelView.setFrame(AWE.Geometry.createRect(31, 25, 160, 36));
        _nameLabelView.setFont('24px "Helvetica Neue", Helvetica, Arial');
        _nameLabelView.setTextAlign("left");
        this.addChild(_nameLabelView);
      }

      if (artifact.get('name') !== _nameLabelView.text()) {
        _nameLabelView.setText(artifact.get('name'));
      }

      if (!_locationLabelView) {
        _locationLabelView = AWE.UI.createLabelView();
        _locationLabelView.initWithControllerAndLabel(my.controller);
        _locationLabelView.setFrame(AWE.Geometry.createRect(31, 89, 100, 28));
        _locationLabelView.setTextAlign("left");
        _locationLabelView.setIconImage("map/icon/home");
        this.addChild(_locationLabelView);
      }

      _locationLabelView.setText(artifact.getPath('settlement.name'));
    };

    that.artifact = function() {
      return my.inspectedObject;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




