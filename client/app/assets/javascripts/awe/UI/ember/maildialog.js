/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>,
 *          David Unger <david@edv-unger.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  module.MailDialog = module.PopUpDialog.extend({
    templateName: 'mail-dialog'
  });

  module.MailNewTabView = module.TabViewNew.extend({
    init: function() {
      this.set('tabViews', [
        { key:   "tab1",
          title: "Inbox",
          view:  module.MailInboxView.extend({
          }),
          buttonClass: "left-menu-button"
        }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
        { key:   "tab2",
          title: "Outbox",
          view:  module.MailOutboxView.extend({
          }),
          buttonClass: "middle-menu-button"
        },
        { key:   "tab3",
          title: "New Mail",
          view: module.mailNewMessageView.extend({
          }),
          buttonClass: "right-menu-button"
        }
      ]);

      this._super();
    }
  });

  module.MailInboxView  = Ember.View.extend  ({
    templateName: 'mail-dialog-inbox-view'
  });

  module.MailOutboxView  = Ember.View.extend  ({
    templateName: 'mail-dialog-outbox-view'
  });

  module.mailNewMessageView  = Ember.View.extend  ({
    templateName: 'mail-dialog-newmessage-view'
  });

  return module;

}(AWE.UI.Ember || {}));




