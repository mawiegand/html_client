window.requestAnimFrame = (function(callback){
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback){
      window.setTimeout(callback, 1000 / 60);
  };
})();

window.random = function(max) {
  return Math.floor(Math.random() * max);
}


var AWE = window.AWE || {};
AWE.Map = AWE.Map || {};

AWE.Map.Model = (function() {
  
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

}());

AWE.Map.Engine = (function(model) {
  
  var _model = model;
  
  /*** map ***/
  
  var _map = (function() {
    
    var that = {};
        
    var _canvas = $('#mapCanvas');
    _canvas.attr({width:1280,height:640});
    var _stage = new Stage(_canvas[0]);
    
    var _regions = new Container();
    _stage.addChild(_regions);    

    var _locations = new Container();    
    _stage.addChild(_locations);    

    var _armies = new Container();    
    _stage.addChild(_armies);    
    
    var _regionImage = new Image();
    _regionImage.src = "images/region.png";
    _regionImage.onload = function() {
      _map.update();
    };
    
    var _armyImage = new Image();
    _armyImage.src = "images/army.png";
    _armyImage.onload = function() {
      _map.update();
    };
    
    var date = 0;
    var slow = false;

    that.addRegion = function(region) {

      var bitmap = new Bitmap(_regionImage);
      bitmap.name = 'region' + region.getPath();
      bitmap.x = region.x;
      bitmap.y = region.y;
      bitmap.scaleX = 1;
      bitmap.scaleY = 1;
      _regions.addChild(bitmap);
    };

      
    that.getRegion = function(path) {
        return null;
    };
      

    that.addArmy = function(army) {

      var bitmap = new Bitmap(_armyImage);
      bitmap.name = 'army' + army.getId();
      bitmap.x = army.x;
      bitmap.y = army.y;
      bitmap.scaleX = 1;
      bitmap.scaleY = 1;
      _armies.addChild(bitmap);
    };

      
    that.getArmy = function(id) {
        return null;
    };
      
    that.toString = function() {
        // return 'Regions:[' + _regions.join(',') + ']\nLocations:[' + _locations.join(',') + ']\nArmies:[' + _armies.join(',') + ']\n';
    };
      
    that.update = function() {
        _stage.update();
    };
      

    that.render = function() {
      var now = +new Date();
      $('#footer').text(Math.round(1000 / (now - date)));
      date = now;
      _map.update();
      window.requestAnimFrame(_map.render);
    };

    
    _stage.onPress = function(evt) {
  
      var startPos = {x:evt.stageX, y:evt.stageY};
      var regionsPos = {x: _regions.x, y: _regions.y};
      var armiesPos = {x: _armies.x, y: _armies.y};

      evt.onMouseMove = function(ev) {

        if (slow) {
          _armies.visible = false;
        }      
        
        _regions.x = regionsPos.x + ev.stageX - startPos.x;
        _regions.y = regionsPos.y + ev.stageY - startPos.y;
        
        _armies.x = armiesPos.x + ev.stageX - startPos.x;
        _armies.y = armiesPos.y + ev.stageY - startPos.y;
      };
      
      evt.onMouseUp = function(ev) {
        _armies.visible = true;
      };
    }
    
    return that;
  }());  
    
  /*** initializer ***/
 
  return {
    
    init: function() {

      for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 5; j++) {
          _map.addRegion(_model.region(j*10+i, {x:i*128, y:j*128}, 128));      
        }
      }
      
      for (var i = 0; i < 10000; i++) {
        _map.addArmy(_model.army(i, {x:random(1280), y:random(640)}));      
      }
      
      log('map', _map.toString());
      
      _map.render();
    },

    // update: function() {
      // _map.update();
    // },      
  };    
}(AWE.Map.Model));


$(function(){
  window.log('AWE.Map', AWE.Map.Model);  

  AWE.Map.Engine.init();
  $('#update').click(AWE.Map.Engine.update);
  
});



