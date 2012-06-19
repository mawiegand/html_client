/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

/** **************************************************************************
 * Most helpers in this file use the Bound-Helper extension that brings 
 * auto-updates to custom helpers. See the file "boundhelper.js" for
 * details. 
 ** **************************************************************************



//////////////////////////////////////////////////////////////////////////////
// 
//  GENERAL TRANSLATION AND LOCALIZATION
//
//////////////////////////////////////////////////////////////////////////////

/** this helper selects a string according to the present locale from a 
 * multi-language hash holding translations for different locales. This helper
 * is mainly used to select the correct name and description from the rules.
 *
 * Presently, the LOCALE as well as the DEFAULT_LOCALE to fall-back in case
 * of a missing translation are both set in AWE.Config. */
Ember.registerBoundHelper("local", function(hash) {
  if (hash === undefined || hash === null) {
    return "" ;
  }
  return hash[AWE.Config.LOCALE] ? hash[AWE.Config.LOCALE] : hash[AWE.Config.DEFAULT_LOCALE];
});


//////////////////////////////////////////////////////////////////////////////
// 
//  FORMATTING NUMBERS
//
//////////////////////////////////////////////////////////////////////////////

/** formats the specified number to the given number of significant places. */
Ember.registerBoundHelper("number", function(number, options) {
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
Ember.registerBoundHelper("duration", function(seconds) {
  if (seconds === undefined || seconds === null) {
    return "" ;
  }
  return AWE.Util.localizedDurationFromSeconds(seconds); // TODO: use locale!
});

/** TODO: extracts and formats the time component of the given date and time. 
 */
Ember.registerBoundHelper("time", function(datetime) {
  return datetime;
});

/** TODO: extracts and formats the date component of the given date and time. 
 *
Ember.registerBoundHelper("date", function(datetime) {
  return datetime;
});

/** TODO: extracts and formats the given date and time. */
Ember.registerBoundHelper("datetime", function(datetime) {
  return datetime;
});



