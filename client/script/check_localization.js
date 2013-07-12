#!/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Resources/jsc
//
// JavaScript for comparing localization files of html client
//
// runs only under mac without modifications

var VERBOSE = true;


var AWE = {};
AWE.I18n = {};
AWE.Config = {};
AWE.Config.RAILS_ASSET_PATH = '';

load('app/assets/javascripts/awe/i18n/de_DE.js');
load('app/assets/javascripts/awe/i18n/en_US.js');

var missingCount = 0;
var notTranslatedCount = 0;

var compare = function(a, b, notTranslated) {

  var localizedStringsA = AWE.I18n[a].localizedStrings;
  var localizedStringsB = AWE.I18n[b].localizedStrings;

  var checkIn = function(h1, h2, path) {
    for (var key in h1) {
      if (h1.hasOwnProperty(key)) {
        if (typeof h1[key] === 'string') {
          if (h2 === undefined || h2[key] === undefined) {
            if (VERBOSE) {
              print('- ' + a + path + '.' + key + ': missing string');
            }
            else {
              print('- ' + a + path + '.' + key + ':');
            }
            print(h1[key]);
            missingCount++;
          }
          else if (h1[key] == h2[key] && notTranslated) {
            if (VERBOSE) {
              print('- ' + a + path + '.' + key + ': not translated');
            }
            else {
              print('- ' + a + path + '.' + key + ':');
            }
            print(h1[key]);
            notTranslatedCount++;
          }
        }
        else {
          if (h2 === undefined || h2[key] === undefined) {
            if (VERBOSE) print('- ' + a + path + '.' + key + ': missing key');
            checkIn(h1[key], undefined, path + '.' + key);
          }
          else {
            checkIn(h1[key], h2[key], path + '.' + key);
          }
        }
      }
    }
  };

  checkIn(localizedStringsA, localizedStringsB, '');
};

compare('de_DE', 'en_US', true);

if (VERBOSE) {
  compare('en_US', 'de_DE', false);
}


if (VERBOSE && missingCount > 0) {
  print('* missing: ' + missingCount);
}

if (VERBOSE && notTranslatedCount > 0) {
  print('* not translated: ' + notTranslatedCount);
}
