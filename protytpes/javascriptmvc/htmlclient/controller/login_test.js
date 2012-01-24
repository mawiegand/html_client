steal('funcunit').then(function(){

module("Htmlclient.Controller", { 
	setup: function(){
		S.open("//htmlclient/controller/login.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Htmlclient.Controller Demo","demo text");
});


});