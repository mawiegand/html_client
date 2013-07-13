/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.I18n = function(module) {

  module.lookupTranslation = function(path) {
    if (path === undefined || path === null) return "" ;
    var locale = AWE.Settings.locale || AWE.Config.DEFAULT_LOCALE;
    if (!AWE.I18n[locale]) return "(NO TRANSLATION FOR "+locale+" LOADED.)";
    path = "localizedStrings." + path;   
    var string = Ember.getPath(AWE.I18n[locale], path);
    string     = string ? string : Ember.getPath(AWE.I18n[AWE.Config.DEFAULT_LOCALE], path);
    string     = string ? string : Ember.getPath(AWE.I18n[locale], 'localizedStrings.error.stringMissing');
    string     = string ? string :"FATAL ERROR IN I18N FOR LOCALE " + locale;
    
    if (string && string instanceof Array) { // allow to specify several translations for the same thing (not so borring...)
      string = string[Math.floor(Math.random()*string.length)];    
    }
    return string ;
  };
  
  module.localizedListString = function(list) {
    if (!list || list.length == 0) {
      return ""
    }
    var string = "";
    list.forEach(function(item, index) {
      string += item;
      if (index < list.length-2) string += ", ";
      if (index < list.length-1) string += " " + AWE.I18n.lookupTranslation('general.and') + " ";
    })
    return string;
  };

  module.printTranslationTable = function() {
    var div = $('#screen-content');
    var table = $('<table border="1"></table>');
    div.append(table);
    table.append('<tr><th>Key</th><th>Original</th><th>Edited</th></tr>');
    
    var traverse = function(keys, obj) {
      if (typeof obj === 'string') {
        table.append('<tr><td>' + keys + '</td><td>' + AWE.Util.removeHtmlTags(obj) + '</td><td></td></tr>\n');
      }
      else if (AWE.Ext.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
          traverse(keys + i, obj[i]);
        }
      }
      else {
        AWE.Ext.applyFunctionToHash(obj, function(key, elem) {
          traverse(keys + '.' + key, elem);
        })
      }
    }
    
    traverse('all', AWE.I18n.en_US.localizedStrings);
  }

  return module;
  
}(AWE.I18n|| {});