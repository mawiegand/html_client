/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.presentToolTipOnView = null;
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/fortressscreen.html');
  

  module.SelectBuildingDialog = Ember.View.extend({
    templateName: "settlement-dialog-select-building",
    heading: 'Select Building',
  
    cancelPressed: function() {
      this.destroy();
    },
                      
    optionClicked: function(event) {
      var slot = this.get('slot');
      var buildingTypeId = event.content.get('buildingTypeId');
      var type = event.content.get('type');
      this.get('controller').constructionOptionClicked(slot, buildingTypeId, type);
      
      // TODO nächste 2 zeilen entfernen, wenn slot automatisch aktualisiert wird      
      slot.set('building_id', buildingTypeId);
      slot.set('level', 1);
      this.destroy();
    },         
    
  });  

	module.FortressView = Ember.View.extend({
		fortress: null,  ///< pointer to the settlement model
		haveSlots: false,
		leftTower: null,
		rightTower: null,
		wall: null,
		setSlots: function(slots) {
		  var self = this;
			if (slots && AWE.Util.hashCount(slots) > 0) {
			  AWE.Ext.applyFunctionToHash(slots, function(slot_id, slot) {
			    
			    switch (slot.get('slot_num')) {
			    case 0: self.set('wall', slot); break;
			    case 1: self.set('leftTower', slot); break;
			    case 2: self.set('rightTower', slot); break;
			    default: console.log('ERROR: unkown slot in fortress with number: ' + slot.get('slot_num') );
			    }
			    console.log(slot, slot.get('slot_num'), slot.get('building_id'));
			  });
				this.set('haveSlots', true);
			}
			else {
				this.set('haveSlots', false);
			}
		},
    queues: null,
		setQueuesAndJobs: function() {
		  // log('-----> setQueuesAndJobs');
		  if (this.get('fortress')) {
		    var queues = Ember.A(AWE.GS.QueueManager.getQueuesOfSettlement(this.get('fortress').get('id'))).filter(function(item){return item !== undefined});
  		  // log('-----> setQueuesAndJobs', 'queues', queues);
        this.set('queues', queues);
        
        AWE.Ext.applyFunction(queues, function(queue){
    		  // log('-----> setQueuesAndJobs', 'queue', queue, queue.get('id'), AWE.GS.JobManager.getJobsInQueue(1));
          var jobs = Ember.A(AWE.GS.JobManager.getJobsInQueue(queue.get('id'))).filter(function(item){return item !== undefined});
    		  // log('-----> setQueuesAndJobs', 'jobs', jobs);
          queue.set('jobs', jobs);
        });
      }
		},
	});

  module.ToolTipView = Ember.View.extend({
  
    mouseX: 0,
    mouseY: 0,
  
    updatePosition: function() {
      var parent = this.get('parentView');
      var posX = this.get('mouseX') + 10; // - parent.$().offset().left + 10;
      var posY = this.get('mouseY') + 18; // - parent.$().offset().top + 18;
    
      if (posY > 460) {
        posY = this.get('mouseY')- 200;
        posX += 48;
      }
        
      this.$().css({'left': posX, 'top': posY});    
    }.observes('mouseX', 'mouseY'),
  
    didInsertElement: function() {
      console.log('did insert tooltip', this);
      this.$().remove();
      this.$().appendTo('.fortress-picture');
      this.updatePosition();
    },
    
    willDestroyElement: function() {
      console.log('destroy tooltip', this);
      this.$().remove();
    }
  
  });


  module.BuildingView = Ember.View.extend({
    model: null, 

		levelBinding: 'model.building.level',
		typeBinding: 'model.building.type',

    classNameBindings: ['small:size1', 'middle:size2', 'large:size3', 'type'],

    small: function() {
      return this.get('level') > 0 && this.get('level') < 4;
    }.property('level'),
  
    middle: function() {
      return this.get('level') >= 4 && this.get('level') < 8;
    }.property('level'),
  
    large: function() {
      return this.get('level') >= 8;
    }.property('level'),
  });

  module.InteractiveBuildingView = module.BuildingView.extend({
    templateName: 'interactive-building',
    tooltip: false,
    mouseX: 0,
    mouseY: 0,
    timeout: 0,    // tooltip timeout in ms
		settlement: null,
		
		mouseInView: false,
  
    showTooltip: function() {
      if (this.get('mouseInView') === true) {  // only show tooltip, if the mouse is still in view
        this.set('tooltip', true);
      }
    },
  
    mouseEnter: function(event) {
      var self = this;
      this.set('mouseInView', true);  // need to set this because showTooltip is called delayed and there we need to check, whether the mouse left the view during the meantime
      setTimeout(function() {
        self.showTooltip();
      }, this.get('timeout'));
      console.log('mouse entered', this);
    },
    mouseMove: function(event) {
      this.set('mouseX', event.pageX);
      this.set('mouseY', event.pageY);
    },
    mouseLeave: function(event) {
      this.set('mouseInView', false);
      this.set('tooltip', false);
      //$().unbind('mousemove');
      console.log('mouse left', this);
    },
    
  
    click: function(event) {
      console.log('click on interactive building');
		  var model = this.get('model');
		  var controller = this.get('parentView') ? this.get('parentView').get('controller') : null;
		  
		  if (controller) {
		    controller.slotClicked(model);
		  }
		  else {
		    console.log('no controller found!');
		  }
		},  
  });
  
  module.QueueListView = Ember.View.extend({
    templateName: 'queue-list',
    queues: null,
  });

  module.JobView = Ember.View.extend({
    classNameBindings: ['active'],
    
    job: null,
    
    active: function() {
      log('----> job', this.get('job'));
      return this.get('job').active_job !== null;;
    }.property('job'),
  });

  return module;
    
}(AWE.UI.Ember || {}));




