var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
	module.TaxesView = module.PopUpDialog.extend({
		templateName: 'taxes-view',
		controller: null,
		taxes: null,
	});
})