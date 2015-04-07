/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.LinkedCharacterView = Ember.View.extend( /** @lends AWE.UI.Ember.LinkedCharacterView# */ {
    templateName: "linked-character-spinning-view",
    classNames:   ["inline"],
    tagName:      'span',

    character: null,
    army: null,

    linkCharacter: true,
    linkAlliance: true,

    displayAlliance: true,
    displayCharacter: true,

    nameClicked: function() {
      var character = this.get('character');
      var army = this.get('army');
      var characterId = character ? character.get('id') : (army ? army.get('owner_id') : null);
      if (!characterId) {
        return false;
      }
      var dialog = AWE.UI.Ember.CharacterInfoDialog.create({
        characterId: characterId,
      });
      WACKADOO.presentModalDialog(dialog);
      return false; // prevent default behavior
    },

    tagClicked: function() {
      var character = this.get('character')
      var army = this.get('army');
      WACKADOO.showAllianceDialog(character ? character.get('alliance_id') : army.get('alliance_id'));
      WACKADOO.closeAllModalDialogs();
      return false; // prevent default behavior
    },
  });

  module.LinkedCharacterWithRankView = module.LinkedCharacterView.extend( /** @lends AWE.UI.Ember.LinkedCharacterWithRankView# */ {
    rankBinding: 'character.mundaneTitle',
  });

  /**
   * @class
   *
   * View that follows the mouse-position and can be used to display a
   * tooltip. Instantiate this view with your specific template in order
   * to display tool-specific content.
   *
   * @example
   *    {{#if "myView.hovered" }}
   *      {{view AWE.UI.Ember.ToolTipView templateName="myView-tooltip" mouseXBinding="myView.mouseX" mouseYBinding="myView.mouseY" contentBinding="myView"}}
   *    {{/if}}
   *    <script type="text/x-handlebars" data-template-name="myView-tooltip">
   *      Tooltip for {{content.name}}
   *    </script>
   *
   * @name AWE.UI.Ember.ToolTipView
   */
  module.ToolTipView = Ember.View.extend( /** @lends AWE.UI.Ember.ToolTipView# */ {

    mouseX: 0,
    mouseY: 0,

    updatePosition: function() {
      var posX = this.get('mouseX') + 10; // - parent.$().offset().left + 10;
      var posY = this.get('mouseY') + 20; // parent.$().offset().top + 18;

      if (posY > 560) {
        posY = this.get('mouseY') - 180;
        //posX += 28;
      }

      if (this && this.$()) {
        this.$().css({'left': posX, 'top': posY});
      }
    }.observes('mouseX', 'mouseY'),

    didInsertElement: function() {
      this.updatePosition();
    },

  });

  /**
   * @class
   * @name AWE.UI.Ember.Dialog
   */
  module.Dialog = Ember.View.extend({
    onClose: null,
    destroy: function() {
      if (this.onClose) {
        this.onClose(this);
      }
      this._super();
    },
  });

  /**
   * @class
   * @name AWE.UI.Ember.PopUpDialog
   */
  module.PopUpDialog = Ember.View.extend({
    layoutName: "popup-dialog",

    showCloseMarker: false,
    
    closeDialog: function() {
      this.destroy();
    },

    onClose: null,

    hasSettings: false,
    
    destroy: function() {
      if (this.onClose) {
        this.onClose(this);
        $('#layers').css('overflow', 'visible');
      }
      this._super();
    },

    setCloseMarker: function(show) {
      this.set("showCloseMarker", show);
    },
  });

  /**
   * @class
   * @name AWE.UI.Ember.TextInputDialog
   */
  module.TextInputDialog = module.Dialog.extend({
    templateName: 'text-input-dialog',
    heading: 'set a heading',
    input: '',
    inputMaxLength: null,
    okPressed: function() { alert ('Action not connected: okPressed.'); },
    cancelPressed: function() { alert ('Action not connected: okPressed.'); },
  });

  module.TextInputDialogNew = module.TextInputDialog.extend({
    templateName: 'text-input-dialog-new',
  });

  module.TextAreaInputDialog = module.Dialog.extend({
    templateName: 'textarea-input-dialog',
    heading: 'set a heading',
		placeholderText: '',
    input: '',
    rowsSize: null,
		colsSize: null,
    inputMaxLength: null,
    okPressed: function() { alert ('Action not connected: okPressed.'); },
    cancelPressed: function() { alert ('Action not connected: okPressed.'); },
  });

  /**
   * @class
   * @extends AWE.UI.Ember.Dialog
   *
   * Displays a simple modal dialog.
   * Either provide or bind a content object and corresponding content
   * or, alternatively, a message and heading. As default, the dialog bears
   * an ok button that closes the dialog when clicked. Attach your own
   * handlers to the [ok,cancel,close]Pressed methods to provide customized
   * behaviour, call a controller's method and / or show more buttons.
   *
   * The dialog should be displayed using the corresponding method of the
   * multistagecontroller.
   * @example
        var dialog = AWE.UI.Ember.InfoDialog.create({
          templateName: 'requirements-missing-info-dialog',
          building: building,
        });
        WACKADOO.presentModalDialog(dialog);
   *
   * @name AWE.UI.Ember.InfoDialog
   */
  module.InfoDialog = module.Dialog.extend({
    templateName: 'info-dialog',

    arguments:    null,
    contentTemplateName: null,

    heading:      'Info',
    message:      '',

    okText:       'OK',
    cancelText:   'Cancel',
    closeText:    'close',

    okPressed:     function() { this.destroy(); },
    cancelPressed: null,

    showModal: function() {
      WACKADOO.presentModalDialog(this);
    },
  });


  /**
   * @class
   * @name AWE.UI.Ember.ShoutBox
   */
  module.ShoutBox = Ember.View.extend({
    templateName: 'shout-box',

    shouts: null,
    shoutBoxInput: null,
    shoutBoxSendPressed: function() {
      var input = this.get('shoutBoxInput');
      var controller = this.get('controller');

      if (input.length > 0) {
        if (this.shout) {
          this.shout(input);
        }
        else if (controller) {
          controller.shout(input);
        }
        else {
          log('ERROR in ShoutBox: shout not connected and no controller set.');
        }
        this.set('shoutBoxInput', '');
      }
    },
    shout: null,
  });



  /**
   * General modal dialog pane that is inserted in the special stage for modal
   * dialgos in the multi-stage controller.
   * @class
   * @name AWE.UI.Ember.Pane
   */
  module.Pane = Ember.View.extend( /** @lends AWE.UI.Ember.Pane#  */{
    templateName: 'pane',

    init: function() {
      this._super();
      this.set('subviews', []);
    },

    didInsertElement: function() {
      this._super();
      var canvas = this.$('canvas');
      this.set('canvas', canvas);
      var width = this.get('width') || 200;
      var height = this.get('height') || 200;
      canvas
      .css('width', width+'px')
      .css('height', height+'px')
      .attr('width', width)
      .attr('height', height);

      var stage = new Stage(canvas[0]);

      this.set('stage', stage);
      this.set('inDOM', true);

      AWE.Ext.applyFunction(this.get('subviews'), function(view) {
        AWE.Ext.applyFunction(view.displayObject(), function(obj) {
          stage.addChild(obj);
        });
      });

      this.update();
    },

    addChild: function(view) {
      if (this.get('inDOM')) {
        var stage = this.get('stage');
        AWE.Ext.applyFunction(view.displayObject(), function(obj) {
          stage.addChild(obj);
        });
      }
      this.get('subviews').pushObject(view);
    },

    removeChild: function(view) {
      if (this.get('inDOM')) {
        var stage = this.get('stage');
        AWE.Ext.applyFunction(view.displayObject(), function(obj) {
          stage.removeChild(obj);
        });
      };
      delete this.get('subviews')[this.get('subviews').indexOf(view)];
    },

    update: function() {
      if (this.get('inDOM') && this.get('stage')) {
        this.get('stage').update();
      }
    },

    inDOM: false,
    stage: null,
    canvas: null,
    subviews: null,
    setWidth: function() {
    },
  });

  module.TabView = Ember.View.extend({
    templateName: 'tab-view',
    classNames:   'tab-view',

    tabViews:      null,
    currentView:   null,
    presentTab:    null,

    tabContentClass: function() {
      if (AWE.Facebook.isRunningInCanvas) {
        return 'tab-content tab-content-scrollable';
      }
      else {
        return 'tab-content';
      }
    }.property(),
    
    
    init: function() {
      var tabViews = this.get('tabViews');
      this.selectTabByNumber(0);
      this._super();
    },
    
    selectTabByKey: function(key) {
      var tabViews = this.get('tabViews');
      var tab = tabViews ? tabViews.findProperty('key', key) : null;
      if (tab) {
        this.setTab(tab);
      }
    },

    selectTabByNumber: function(n) {
      var tabViews = this.get('tabViews');
      if (tabViews && tabViews.length > n) {
        this.setTab(tabViews[n]);
      };
    },
    
    setTab: function(tab) {
      var presentTab = this.get('presentTab');
      var oldView    = this.get('currentView');
      if (presentTab !== tab) {
        this.set('presentTab',  tab);
        this.set('currentView', tab.view.create());
        if (oldView) {
          oldView.destroy();
        }
      }
    },
    
  });

  module.TabViewNew = module.TabView.extend({
    templateName: 'tab-view-new',
    classNames:   'tab-view-new',

    cellClass: function(){
      return "cell-" + Math.round(100 / this.get("tabViews").length);
    }.property("tabViews"),
  });

  module.TabButtonView = Ember.View.extend({
    tagName:    'li',
    classNames: ['tab-button-view'],
    classNameBindings: ['current', "buttonClass"],
    key:        null,
    buttonClass:  null,
    
    click: function() {
      this.get('parentView').selectTabByKey(this.get('key'));
    },
 
    current: function() {
      return this.get('key') === this.getPath('parentView.presentTab.key');
    }.property('key', 'parentView.presentTab.key'),
    
  });

  module.TabButtonViewNew = module.TabButtonView.extend({
    tagName: "div",
    classNames: ["tab-button-view-new"]
  });

  module.SliderView = Ember.View.extend({
    templateName: "slider-view",
    classNames: ["slider-view"],
    max: 1,
    min: 0,
    value: null,

    onPlusClicked: function(){
      if(this.get("value") < this.get("max"))
      {
        this.set("value", (parseInt(this.get("value")) + 1));
      }
    },

    onMinusClicked: function(){
      if(this.get("value") > 0)
      {
        this.set("value", (this.get("value") - 1));
      }
    },

  });

  module.SliderInputView = Ember.TextField.extend({
    result: null,
    defaultValue: 0,
    maxValue: 100,
    minValue: 0,
    numberValueRegex: /[^0-9]+/,

    init: function() {
      this._super();
      this.set("value", this.get("result"));
    },

    onResultChanged: function() {
      this.set("value", this.get("result"));
    }.observes('result'),

    focusOut: function() {
      if(this.get('value') === "")
      {
        this.set('value', this.get('defaultValue'));
      }
      else if(parseInt(this.get('value')) > this.get('maxValue'))
      {
        this.set('value', this.get('maxValue'));
      }
      else if(parseInt(this.get('value')) < this.get('minValue'))
      {
        this.set('value', this.get('minValue'));
      }
      else if(this.get('value').match(this.get('numberValueRegex')))
      {
        var dialog = AWE.UI.Ember.InfoDialog.create({
          message: AWE.I18n.lookupTranslation('settlement.training.error.notOnlyNumbers')
        });
        WACKADOO.presentModalDialog(dialog);
        this.set('value', this.get('defaultValue'));
      }

      this.set("result", this.get("value"));
    },
  });

  module.RangeView = Ember.TextField.extend({
    classNames: ["slider-range"],
    min: 0,
    max: 1,
    value: null,

    input: function(event) {
      this.set('value', event.target.value);
    },

    attributeBindings: ["min", "max"],
    type: "range",
  });

  return module;

}(AWE.UI.Ember || {}));
