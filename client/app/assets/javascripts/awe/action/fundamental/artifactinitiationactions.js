
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {

  module.createStartArtifactInitiationAction = function(artifact, my) {

    // private attributes and methods //////////////////////////////////////

    var that;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    my.artifact  = artifact

    // public attributes and methods ///////////////////////////////////////

    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        fundamental_artifact_initiation: {
          artifact_id: my.artifact.getId(),
        }
      };
    }

    that.getURL = function() {
      return AWE.Config.FUNDAMENTAL_SERVER_BASE + 'artifact_initiations';
    }

    that.getHTTPMethod = function() {
      return 'POST';
    }

    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.CREATED) {
        // artefakt aktualisieren
      }
    }
    return that;
  };

  module.createSpeedupArtifactInitiationAction = function(artifact, my) {

    // private attributes and methods //////////////////////////////////////

    var that;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    my.artifact  = artifact

    // public attributes and methods ///////////////////////////////////////

    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        action_fundamental_speedup_artifact_initiation: {
          artifact_id: my.artifact.getId(),
        }
      };
    }

    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'fundamental/speedup_artifact_initiation_actions';
    }

    that.getHTTPMethod = function() {
      return 'POST';
    }

    that.postProcess = function(statusCode, xhr) {
    }

    return that;
  };

  return module;
  
}(AWE.Action.Fundamental || {}));