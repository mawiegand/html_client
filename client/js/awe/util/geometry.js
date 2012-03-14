/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Geometry = (function(module) {
  
  module.createPoint = function(_x, _y) {
    return {
      x: _x,
      y: _y
    };
  };
  
  module.createSize = function(_width, _height) {
    return {
      width: _width,
      height: _height
    };
  };

  module.createRect = function (_x,_y, _width, _height) {
    
    return {
      origin: module.createPoint(_x,_y),
      size: module.createSize(_width,_height),
      
      contains: function(geom) {
        
        if (geom.size && geom.origin) {  // should be a rectangle
        
          return 
            this.origin.x <= geom.origin.x && this.origin.y <= geom.origin.y &&
            this.origin.x + this.size.width >= geom.origin.x+geom.size.width &&
            this.origin.y + this.size.height >= geom.origin.y+geom.size.height;  
        }
        else if (geom.origin){           // should be point
        
          return 
            this.origin.x <= geom.origin.x && this.origin.y <= geom.origin.y &&
            this.origin.x + this.size.width >= geom.origin.x &&
            this.origin.y + this.size.height >= geom.origin.y;  
        }
        else { // unkown
          return false;
        }
      },
      
      toString: function() {
        return "("+this.origin.x+", "+this.origin.y+" -- "+this.size.width+", "+this.size.height+")";
      },

      
    };
  };
  
  return module;
  
}(AWE.Geometry || {}));

