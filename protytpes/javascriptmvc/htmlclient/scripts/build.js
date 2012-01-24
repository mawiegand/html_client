//steal/js htmlclient/scripts/compress.js

load("steal/rhino/rhino.js");
steal('steal/build').then('steal/build/scripts','steal/build/styles',function(){
	steal.build('htmlclient/scripts/build.html',{to: 'htmlclient'});
});
