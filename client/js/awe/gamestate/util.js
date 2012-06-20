/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
        
  module.Util = (function(that) {    

    functions = {
      'MIN':   'Math.min',
      'MAX':   'Math.max',
      'ROUND': 'Math.round',
      'CEIL':  'Math.ceil',
      'FLOOR': 'Math.floor',
      'POW':   'Math.pow',
      'SIGN':  'AWE.Ext.sign',
    }

    that.parseFormula = function(formula) {
      AWE.Ext.applyFunctionToHash(functions, function(key, val) {
        formula = formula.replace(new RegExp(key, "g"), val);
      })    
      formula = formula.replace(/LEVEL/g, 'level');
      return formula;
    }
        
    that.evalFormula = function(formula, level) {
      return formula ? eval(formula) : 0; // TODO: return null or 0 on missing formula?
    }
    
    that.parseAndEval = function(formula, level) {
      return that.evalFormula(that.parseFormula(formula || ""), level);
    }
    
    that.parseDate = function(date) {
      return Date.parse(date).setTimezone("MSZ").toString('HH:mm:ss');
    }
        
    return that;
      
  }(module.Util || {}));
    
  return module;
  
}(AWE.GS || {}));


