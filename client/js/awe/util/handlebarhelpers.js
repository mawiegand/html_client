/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

/** **************************************************************************
 * Most helpers in this file use the Bound-Helper extension that brings 
 * auto-updates to custom helpers. See the file "boundhelper.js" for
 * details. 
 ** **************************************************************************


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
