/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  /**
   * @namespace
   * @name AWE.GS.Util
   */
  module.Util = (function(that) /** @lends AWE.GS.Util */ {    

    that.equal = function(a, b) {
      return a === b ? 1 : 0;
    }
    
    that.less = function(a, b) {
      return a < b ? 1 : 0;
    }
    
    that.greater = function(a, b) {
      return a > b ? 1 : 0;
    }
    
    that.not = function(a) {
      return a === 0 ? 1 : 0;
    }
    
    that.and = function(a,b) {
      return that.not(a) === 0 && that.not(b) === 0 ? 1 : 0;
    }

    that.or = function(a,b) {
      return that.not(a) === 0 || that.not(b) === 0 ? 1 : 0;
    }

    functions = {
      'MIN':     'Math.min',
      'MAX':     'Math.max',
      'ROUND':   'Math.round',
      'CEIL':    'Math.ceil',
      'FLOOR':   'Math.floor',
      'POW':     'Math.pow',
      'SIGN':    'AWE.Ext.sign',
      'EQUAL':   'AWE.GS.Util.equal',
      'LESS':    'AWE.GS.Util.less',
      'GREATER': 'AWE.GS.Util.greater',
      'NOT':     'AWE.GS.Util.not',
      'AND':     'AWE.GS.Util.and',
      'OR':      'AWE.GS.Util.or',
    }

    /**
     * @function
     * @name AWE.GS.Util.parseFormula */
    that.parseFormula = function(formula) {
      AWE.Ext.applyFunctionToHash(functions, function(key, val) {
        formula = formula.replace(new RegExp(key, "g"), val);
      })    
      formula = formula.replace(/LEVEL/g, 'level');
      return formula;
    }
        
    /**
     * @function
     * @name AWE.GS.Util.evalFormula */
    that.evalFormula = function(formula, level) {
      return formula ? eval(formula) : 0; // TODO: return null or 0 on missing formula?
    }
    
    /**
     * @function
     * @name AWE.GS.Util.parseAndEval */
    that.parseAndEval = function(formula, level) {
      return that.evalFormula(that.parseFormula(formula || ""), level);
    }
    
    /**
     * @function
     * @name AWE.GS.Util.parseDate */
    that.parseDate = function(date) {
      return Date.parse(date).setTimezone("MSZ").toString('HH:mm:ss');
    }
        
    return that;
      
  }(module.Util || {}));
    
  return module;
  
}(AWE.GS || {}));


