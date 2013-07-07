/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = function (module) {

  module.StandardAssignmentAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   Artifact
  //
  // ///////////////////////////////////////////////////////////////////////

  module.StandardAssignment = module.Entity.extend({     // extends Entity to Army
    typeName: 'StandardAssignment',

    ended_at: null,
    execution_count: null,
    halved_at: null,
    halved_count: null,
    started_at: null,
    type_id: null,

    character_id: null, old_character_id: null,
    characterIdObserver: AWE.Partials.attributeHashObserver(module.module.StandardAssignmentAccess, 'character_id', 'old_character_id').observes('character_id'),

    // TODO correct client time
    timeToFinish: function() {
      return new Date().getTime() - Date.parseISODate(this.get('endet_at')).getTime();
    }.property('endet_at'),


    progression: function() {
      return new Date().getTime() - Date.parseISODate(firstFulfilledAt).getTime();
    }.property('endet_at'),



    -(double)progression
  {
    AWETimeCorrection* timeManager = [AWETimeCorrection sharedTimeCorrection];

    NSDate* serverCurrentTime = [timeManager estimatedServerTime];

    NSTimeInterval currentInterval = [serverCurrentTime timeIntervalSinceDate:self.startedAt];
    NSTimeInterval jobInterval = [self.endedAt timeIntervalSinceDate:self.startedAt];

    if (jobInterval != 0) {
      return (double)currentInterval/(double)jobInterval;
    }

    return -1.0f;
  }

  -(BOOL)isActive
  {
    return self.endedAt != nil;
  }

  -(BOOL)isHalved
  {
    return self.halvedAt != nil;
  }
  @end

  });

  // ///////////////////////////////////////////////////////////////////////
  //
  //   ARMY MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////

  module.StandardAssignmentManager = function (my) {    // Army.Manager    -> manager singleton

    // private attributes and methods //////////////////////////////////////

    var that;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};

    my.runningUpdatesPerCharacter = {};///< hash that contains all running requests for locations, using the location.id as key.

    my.createEntity = function () {
      return module.StandardAssignment.create();
    };


    // public attributes and methods ///////////////////////////////////////

    that = module.createEntityManager(my);

    that.getStandardAssignment = function (id) {
      return that.getEntity(id);
    };

    that.updateStandardAssignment = function (id, updateType, callback) {
      var url = AWE.Config.ASSIGNMENT_SERVER_BASE + 'standard_assignments/' + id;
      return my.updateEntity(url, id, updateType, callback);
    };

    that.updateStandardAssignmentsOfCharacter = function (characterId, updateType, callback) {
      var url = AWE.Config.ASSIGNMENT_SERVER_BASE + 'characters/' + characterId + '/standard_assignments';
      return my.fetchEntitiesFromURL(
        url,
        my.runningUpdatesPerCharacter,
        characterId,
        updateType,
        module.StandardAssignmentAccess.lastUpdateForCharacter_id(characterId),
        function (result, status, xhr, timestamp) {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK) {
            module.StandardAssignmentAccess.accessHashForCharacter_id().setLastUpdateAtForValue(characterId, timestamp.add(-1).second());
          }
          if (callback) {
            callback(result, status, xhr, timestamp);
          }
        }
      );
    };

    return that;

  }();

  return module;

}(AWE.GS || {});




