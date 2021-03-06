/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.Geometry = (function(module) {
  
  Number.prototype.extendInteger = function() {
    return Math[(this > 0 ? 'ceil' : 'floor')](this);
  };
  
  /** creates a 2d point with x,y-coordinates */
  module.createPoint = function createPoint(_x, _y, my) {
    
    return {
      x: _x,
      y: _y,
      
      moveBy: function(point) {
        this.x += point.x;
        this.y += point.y;
        return this;
      },

      moveTo: function(point) {
        this.x = point.x;
        this.y = point.y;
        return this;
      },

      scale: function(f) {
        this.x *= f;
        this.y *= f;
        return this;
      },
      
      copy: function() {
        return createPoint(this.x, this.y);
      },
      
      length2: function() {
        return this.x*this.x+this.y*this.y;
      },
      
      length: function() {
        var length2 = this.length2();
        return length2 > 0.0 ? Math.sqrt(this.length2()) : length2;
      },
      
      equals: function(other, precision) {
        if (precision === undefined) {
          return this.x === other.x && this.y === other.y;
        } else {
          return (Math.abs(this.x - other.x) <= precision && 
            Math.abs(this.y - other.y) <= precision);
        }
      },
      
      toString: function() {
        return '(' + this.x + ', ' + this.y + ')';
      },
    };
  };
  
  /** creates a "size" in two dimensions given a width and a height. */
  module.createSize = function createSize(_width, _height) {
    return {
      width: _width,
      height: _height,

      scale: function(f) {
        this.width *= f;
        this.height *= f;
      }, 
      
      copy: function() {
        return createSize(this.width, this.height);
      },
      
      equals: function(other, precision) {
        if (precision === undefined) {
          return this.width === other.width && this.height === other.height;
        } else {
          return (Math.abs(this.width - other.width) <= precision && 
            Math.abs(this.height - other.height) <= precision);
        }
      },

      area: function() {
        return Math.sqrt(this.width*this.width + this.height*this.height);
      }
    };
  };

  /** creates a 2d, axis-aligned rectangle given its upper left corner (origin) and
   * its width and height. */
  module.createRect = function createRect (_x,_y, _width, _height) {
    
    return {
      origin: module.createPoint(_x,_y),
      size: module.createSize(_width,_height),
      
      copy: function() {
        return createRect(this.origin.x, this.origin.y, this.size.width, this.size.height);
      },
      
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
        else if (geom.x !== undefined && geom.y !== undefined) { //point
          return this.origin.x <= geom.x && this.origin.y <= geom.y &&
            this.origin.x + this.size.width >= geom.x &&
            this.origin.y + this.size.height >= geom.y;
        }
        else { // unkown
          return false;
        }
      },
      
      /** returns whether two rectangles intersect (overlap). The method returns
       * true in case the intersection of the two rectangles is not the null rectangle. */
      intersects: function(rect) {
        var inter = this.intersection(rect);

        return inter.size.width > 0  && inter.size.height > 0; // must be '&&', when using the present implementation of intersection
      },
      
      /** creates the intersection of two rectangles, that is a rectangle with the area 
       * that is contained within both rectangles. */
      intersection: function(rect) {        
        var min_x = Math.max(this.origin.x, rect.origin.x);
        var min_y = Math.max(this.origin.y, rect.origin.y);
        var max_x = Math.min(this.origin.x+this.size.width, rect.origin.x+rect.size.width);
        var max_y = Math.min(this.origin.y+this.size.height, rect.origin.y+rect.size.height);
                
        return module.createRect(min_x, min_y, max_x-min_x, max_y-min_y);
      },

      middle: function() {
        return module.createPoint(this.origin.x + this.size.width/2, this.origin.y + this.size.height/2);
      },
      
      equals: function(other, precision) {
        return this.origin.equals(other.origin, precision) && this.size.equals(other.size, precision);
      },
      
      toString: function() {
        return "("+this.origin.x+", "+this.origin.y+" -- "+this.size.width+", "+this.size.height+")";
      },
    };
  };
  
  return module;
  
}(AWE.Geometry || {}));

