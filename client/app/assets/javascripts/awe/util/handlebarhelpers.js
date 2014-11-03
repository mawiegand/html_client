/**
 * @fileOverview 
 * Collection of useful custom Handlebars view-helpers.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 */ 

//////////////////////////////////////////////////////////////////////////////
// Most helpers in this file use the Bound-Helper extension that brings 
// auto-updates to custom helpers. See the file "boundhelper.js" for
// details. 
//////////////////////////////////////////////////////////////////////////////


/** These custom helpers can be used in views like build-in helpers to ease
 * translation, localization and formatting of attributes.
 *
 * @example Amount: {{formatNumber aNumericProperty places=2}}  // 92.2393 -> 92.23
 *
 * @class
 * @name Handlebars.Helper */
var Ember = window.Ember || /** @lends Handlebars.Helper */ {};

//////////////////////////////////////////////////////////////////////////////
// 
//  GENERAL TRANSLATION AND LOCALIZATION
//
//////////////////////////////////////////////////////////////////////////////


/** This helper selects a string according to the present locale from a 
 * multi-language hash holding translations for different locales. This helper
 * is mainly used to select the correct name and description from the rules.
 *
 * Presently, the LOCALE as well as the DEFAULT_LOCALE to fall-back in case
 * of a missing translation are both set in AWE.Config.  
 * @name Handlebars.Helper.local
 */
Ember.registerBoundHelper("local", function(hash) {
  if (hash === undefined || hash === null) {
    return "" ;
  }
  return AWE.Util.Rules.lookupTranslation(hash); 
});

/** This helper selects a string according to the present locale from a 
 * multi-language hash holding translations for different locales. In contrast
 * to the previous version ("local"), this helper is not bound, thus it
 * does not update if the argument changes. This helper
 * is mainly used to select the correct name and description from the rules in
 * html attributes like title, where binding is not an option.
 *
 * Presently, the LOCALE as well as the DEFAULT_LOCALE to fall-back in case
 * of a missing translation are both set in AWE.Config.  
 * @name Handlebars.Helper.local
 */
Handlebars.registerHelper("unboundLocal", function(path) {
  var names = Ember.getPath(this, path);
  if (names === undefined || names === null) {
    return "" ;
  }
  return AWE.Util.Rules.lookupTranslation(names); 
});

/** Look-up the text for a given path in the translation file of the current
 * LOCALE. Falls-back to the DEFAULT_LOCALE in case the key cannot be found.
 *
 * ATTENTION: This is a simple Handlebars helper that does not bind to the 
 *            argument. Thus, only provide constant keys to the I18n - files.
 * 
 * @example 
 * 1. {{t settlement.buildings.details.speedup}}  // "Speedup to:" for LOCALE=en_US
 *
 * @name Handlebars.Helper.t
 */
Handlebars.registerHelper("t", function(path) {
  return AWE.I18n.lookupTranslation(path);
});

Handlebars.registerHelper("constructionSpeedupResource", function(path) {
  var seconds = Ember.getPath(this, path);
  if (seconds === undefined || seconds === null) {
    return "" ;
  }
  var costs = AWE.Util.Rules.lookupConstructionSpeedupCost(seconds);
  return costs ? AWE.GS.RulesManager.getRules().getResourceType(costs.resource_id).symbolic_id : null;
});

Handlebars.registerHelper("trainingSpeedupResource", function(path) {
  var seconds = Ember.getPath(this, path);
  if (seconds === undefined || seconds === null) {
    return "" ;
  }
  var costs = AWE.Util.Rules.lookupTrainingSpeedupCost(seconds);
  return costs ? AWE.GS.RulesManager.getRules().getResourceType(costs.resource_id).symbolic_id : null;
});

Handlebars.registerHelper("artifactInitiationSpeedupResource", function(path) {
  var seconds = Ember.getPath(this, path);
  if (seconds === undefined || seconds === null) {
    return "" ;
  }
  var costs = AWE.Util.Rules.lookupArtifactInitiationSpeedupCost(seconds);
  return costs ? AWE.GS.RulesManager.getRules().getResourceType(costs.resource_id).symbolic_id : null;
});

Handlebars.registerHelper("tradingSpeedupResource", function(path) {
  var seconds = Ember.getPath(this, path);
  if (seconds === undefined || seconds === null) {
    return "" ;
  }
  var costs = AWE.Util.Rules.lookupTradingSpeedupCost(seconds);
  return costs ? AWE.GS.RulesManager.getRules().getResourceType(costs.resource_id).symbolic_id : null;
});

Ember.registerBoundHelper("localizedList", function(list) {
  return AWE.I18n.localizedListString(list);
});

//////////////////////////////////////////////////////////////////////////////
// 
//  FORMATTING NUMBERS
//
//////////////////////////////////////////////////////////////////////////////

/** formats the specified number to the given number of significant places. 
 * @name Handlebars.Helper.formatNumber
 */
Ember.registerBoundHelper("formatNumber", function(number, options) {
  var maxPlaces = options.maxPlaces || 0;
  if (typeof number === "undefined" || number === null) {
    return "" ;
  }
  var fac = Math.pow(10, maxPlaces);
  return maxPlaces == 0 && number < 1.0 && number > 0.01 ? "" + (Math.floor(number*100.0) / 100.0) : "" + (Math.floor(number * fac + 0.5) / fac); // TODO: use locale!
  // TODO add option to append '0's to fill maxPlaces
});

Ember.registerBoundHelper("formatNumberFloor", function(number, options) {
  if (typeof number === "undefined" || number === null) {
    return "" ;
  }
  return "" + Math.floor(number);
});

Ember.registerBoundHelper("formatAsPercent", function(number, options) {
  var maxPlaces = options.maxPlaces || 0;
  if (typeof number === "undefined" || number === null) {
    return "" ;
  }
  var fac = Math.pow(10, maxPlaces);
  return Math.floor(number * 100 * fac + 0.5) / fac + '%'; // TODO: use locale!
  // TODO add option to append '0's to fill maxPlaces
});


//////////////////////////////////////////////////////////////////////////////
// 
//  ENUMERABLE HELPERS
//
//////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////
// 
//  FORMATTING TIMES AND DURATIONS
//
//////////////////////////////////////////////////////////////////////////////

/** formats the specified duration (expects seconds) according to the local 
 * conventions 
 * @name Handlebars.Helper.formatDuration
 */
Ember.registerBoundHelper("formatDuration", function(seconds) {
  if (typeof seconds === "undefined" || seconds === null) {
    return "" ;
  }
  return AWE.Util.localizedDurationFromSeconds(seconds); // TODO: use locale!
});

/** TODO: extracts and formats the time component of the given date and time. 
 * @name Handlebars.Helper.formatTime
 */
Ember.registerBoundHelper("formatTime", function(datetime) {
  return datetime ? Date.parseISODate(datetime).toString('HH:mm:ss') : "";
});

/** TODO: extracts and formats the date component of the given date and time. 
 * @name Handlebars.Helper.formatDate
 */
Ember.registerBoundHelper("date", function(datetime) {
  return datetime ? Date.parseISODate(datetime).toString('dd.MM') : "";
});

/** TODO: extracts and formats the given date and time. 
 * @name Handlebars.Helper.formatDatetime
 */
Ember.registerBoundHelper("formatDatetime", function(datetime) {
  return datetime ? Date.parseISODate(datetime).toString('dd.MM. HH:mm:ss') : "";
});

/** TODO: extracts and formats the given date and time. 
 * @name Handlebars.Helper.formatDatetime
 */
Ember.registerBoundHelper("formatPercentage", function(percentage) {
  return "" + (Math.floor(percentage*1000)/10.0) + "%";
});

/** calculates and returns the cost for speeding up a construction job
 * with the given remaining duration in seconds 
 * @name Handlebars.Helper.constructionSpeedupCost
 */
Ember.registerBoundHelper("constructionSpeedupCost", function(seconds) {
  if (typeof seconds === "undefined" || seconds === null) {
    return "" ;
  }
  var costs = AWE.Util.Rules.lookupConstructionSpeedupCost(seconds);
  return costs ? "" + costs.amount : null;
});


/** calculates and returns the cost for speeding up a training job
 * with the given remaining duration in seconds 
 * @name Handlebars.Helper.trainingSpeedupCost
 */
Ember.registerBoundHelper("trainingSpeedupCost", function(seconds) {
  if (typeof seconds === "undefined" || seconds === null) {
    return "" ;
  }
  var costs = AWE.Util.Rules.lookupTrainingSpeedupCost(seconds);
  return costs ? "" + costs.amount : null;
});


/** calculates and returns the cost for speeding up a training job
 * with the given remaining duration in seconds
 * @name Handlebars.Helper.trainingSpeedupCost
 */
Ember.registerBoundHelper("artifactInitiationSpeedupCost", function(seconds) {
  if (typeof seconds === "undefined" || seconds === null) {
    return "" ;
  }
  var costs = AWE.Util.Rules.lookupArtifactInitiationSpeedupCost(seconds);
  return costs ? "" + costs.amount : null;
});


