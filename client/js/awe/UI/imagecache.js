/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {


  /*** ImageCache ***/
  module.ImageCache = (function () {
    var that = {};

    var _images = {};
    var _outstandingImages = {};

    that.init = function() {}

    that.loadImage = function (name, src) {
      if (name in _images) {
        console.warn("tried to load image '"+name+"' from '"+url+"' but there was already an image by that name");
        return;
      }
      _outstandingImages[name] = src;

      var image = new Image();
      _images[name] = image;
      image.src = src;
      image.onload = function(event) {
        delete _outstandingImages[name];
        log("loaded image", name, src);
      };
    };

    that.allImagesLoaded = function () {
      for (key in _outstandingImages) {
        return false;
      }
      return true;
    };

    that.getImage = function(name) {
      if (!(name in _images)) {
        console.error("tried to get the image with the name '"+name+"' that has no cache entry");
      }
      return _images[name];
    }

    return that;
  }());

    
  return module;
    
}(AWE.UI || {}));




