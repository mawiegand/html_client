/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Util = (function(module) {


  /** TemplateLoader is used to dynamically load additional HTML into the 
   * document after the app has started (document ready). Also it's name
   * refers to it's main purpose of loading handle bar templates from 
   * individual files, the TemplateLoader can be used for loading anything
   * else, as it does not impose any restrictions of what can be loaded.
   *
   * The TemplateLoader is used in two phases:
   * A) modules register their files to be loaded after document ready
   *    with the loader singleton. Just hand over a valid URL.
   * B) the app controller should trigger loadAllTemplates once. This will
   *    cause the loaded to load all registered files and hook the contents
   *    into the document object model; all content is appended to body
   *    without further inspection. */
  module.TemplateLoader = (function () {
    var that = {};

    var _templates = [];

    that.registerTemplate = function (url, callback) {
      _templates.push({ url: url, callback: callback });
    }
      
    that.loadAllTemplates = function () {
      for (var i=0; i < _templates.length; i++) {
        console.log(_templates[i].url);
        $('#templates').load(_templates[i].url, (function(entry) {
          return function(responseText, textStatus, jqXHR) {
            if (entry.callback) {
              entry.callback(responseText, textStatus, jqXHR);
            };
          }
        }(_templates[i])));
      }
    }
    
    that.numTemplates = function () { return _templates.length; }

    return that;
  }());

    
  return module;
    
}(AWE.Util || {}));




