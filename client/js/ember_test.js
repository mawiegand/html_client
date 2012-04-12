
var LoginApp = Ember.Application.create();


$(document).ready(function() {
  
  var count =0;
  var runTest = function() {
    //Ember.Handlebars.bootstrap();                  // Bootstrap Ember a second time to parse the newly loaded templates.    

    Ember.View.extend({
      templateName: 'army-details',
      
      press: function(event) {
        alert('hello'); console.log('pressed');
      }
    }).create().append();
    
  }
  runTest(); 
  /*

  for (var i=0; i < AWE.UI.Ember.templates.length; i++) {
    AWE.Util.TemplateLoader.registerTemplate(AWE.UI.Ember.templates[i], function() { 
      if (++count == AWE.UI.Ember.templates.length) {
        runTest();
      }
    });
  }
  AWE.Util.TemplateLoader.loadAllTemplates();*/
});





