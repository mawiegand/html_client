steal("funcunit", function(){
	module("htmlclient test", { 
		setup: function(){
			S.open("//htmlclient/htmlclient.html");
		}
	});
	
	test("Copy Test", function(){
		equals(S("h1").text(), "Welcome to JavaScriptMVC 3.2!","welcome text");
	});
})