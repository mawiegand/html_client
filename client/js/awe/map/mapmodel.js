/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */



window.random = function(max) {
  return Math.floor(Math.random() * max);
}

var AWE = window.AWE || {};
AWE.Map = AWE.Map || {};

AWE.Mapmodel = (function(module) {
  
  var that = {};

  /*** constructor-definitions ***/

  that.region = function(path, position, size) {
        
    var _path = path;

    var _size = size;
    
    var _locations = [];
    var _fortress = null;
    
    return {
      x: position.x,
      y: position.y,
      
      getPath: function() {
        return _path;
      },
            
      getPosition: function() {
        return {x: _x, y: _y};
      },
      
      getSize: function() {
        return _size;
      },
      
      addLocation: function(location) {
        _locations.push(location);
      },
      
      getLocationAtIndex: function(index) {
        return _locations[index];
      },
      
      setFortress: function(fortress) {
        _fortress = fortress;
      },
      
      getFortress: function() {
        return _fortress;
      },
      
      toString: function() {
        return 'Region: {path: ' + _path + ', x: ' + this.x + ', y: ' + this.y + ', size: ' + _size + '}';  
      },
    }
  };
    
  that.location = function() {

    var _id;
    
    var _x, _y;
    
    var _armies = [];
    
    return {
      getPosition: function() {
        return {x: _x, y: _y};
      }      
    }
  };
    
  that.army = function(id, position) {
    
    var _id;
        
    return {
      x: position.x,
      y: position.y,
      
      getPosition: function() {
        return {x: x, y: y};
      },      

      getId: function() {
        return _id;
      },      
    }
  };
  
  that.getRegion = function(){
      return 0;
  };
  
  return that;

}(AWE.Map.Model || {}));



