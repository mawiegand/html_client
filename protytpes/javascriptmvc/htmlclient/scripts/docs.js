//js htmlclient/scripts/doc.js

load('steal/rhino/rhino.js');
steal("documentjs").then(function(){
	DocumentJS('htmlclient/htmlclient.html', {
		markdown : ['htmlclient']
	});
});