/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Geometry = (function(module) {
  
  /** creates a 2d point with x,y-coordinates */
  module.createPoint = function(_x, _y) {
    return {
      x: _x,
      y: _y
    };
  };
  
  /** creates a "size" in two dimensions given a width and a height. */
  module.createSize = function(_width, _height) {
    return {
      width: _width,
      height: _height
    };
  };

  /** creates a 2d, axis-aligned rectangle given its upper left corner (origin) and
   * its width and height. */
  module.createRect = function (_x,_y, _width, _height) {
    
    return {
      origin: module.createPoint(_x,_y),
      size: module.createSize(_width,_height),
      
      /** checks whether this rectangle contains the given geometrical object. 
       * Presently supports points and other rectangles. */
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

