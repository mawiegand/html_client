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
  return hash[AWE.Config.LOCALE] ? hash[AWE.Config.LOCALE] : hash[AWE.Config.DEFAULT_LOCALE];
});

/** Look-up the text for a given path in the translation file of the current
 * LOCALE. Falls-back to the DEFAULT_LOCALE in case the key cannot be found.
 * 
 * @example 
 * 1. {{t settlement.buildings.details.speedup}}  // "Speedup to:" for LOCALE=en_US
 *
 * ATTENTION: This is a simple Handlebars helper that does not bind to the 
 *            argument. Thus, only provide constant keys to the I18n - files.
 *
 * @name Handlebars.Helper.t
 */
Handlebars.registerHelper("t", function(path) {
  if (path === undefined || path === null) return "" ;
  if (!AWE.I18n[AWE.Config.LOCALE]) return "(NO TRANSLATION FOR "+AWE.Config.LOCALE+" LOADED.)";
  path = "localizedStrings." + path;   
  var string = Ember.getPath(AWE.I18n[AWE.Config.LOCALE], path);
  string     = string ? string : Ember.getPath(AWE.I18n[AWE.Config.DEFAULT_LOCALE], path);
  string     = string ? string : Ember.getPath(AWE.I18n[AWE.Config.LOCALE], 'localizedStrings.error.stringMissing');
  string     = string ? string :"FATAL ERROR IN I18N FOR LOCALE " + AWE.Config.LOCALE;
  return string ;
});

//////////////////////////////////////////////////////////////////////////////
// 
//  FORMATTING NUMBERS
//
//////////////////////////////////////////////////////////////////////////////

/** formats the specified number to the given number of significant places. */
Ember.registerBoundHelper("formatNumber", function(number, options) {
  var maxPlaces = options.maxPlaces || 0;
  if (number === undefined || number === null) {
    return "" ;
  }
  var fac = Math.pow(10, maxPlaces);
  return Math.floor(number * fac + 0.5) / fac; // TODO: use locale!
});


//////////////////////////////////////////////////////////////////////////////
// 
//  FORMATTING TIMES AND DURATIONS
//
//////////////////////////////////////////////////////////////////////////////

/** formats the specified duration (expects seconds) according to the local 
 * conventions */
Ember.registerBoundHelper("formatDuration", function(seconds) {
  if (seconds === undefined || seconds === null) {
    return "" ;
  }
  return AWE.Util.localizedDurationFromSeconds(seconds); // TODO: use locale!
});

/** TODO: extracts and formats the time component of the given date and time. 
 */
Ember.registerBoundHelper("formatTime", function(datetime) {
  return datetime;
});

/** TODO: extracts and formats the date component of the given date and time. 
 *
Ember.registerBoundHelper("date", function(datetime) {
  return datetime;
});

/** TODO: extracts and formats the given date and time. */
Ember.registerBoundHelper("formatDatetime", function(datetime) {
  return datetime;
});



