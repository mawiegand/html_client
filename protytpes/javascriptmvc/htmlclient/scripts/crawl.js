// load('htmlclient/scripts/crawl.js')

load('steal/rhino/rhino.js')

steal('steal/html/crawl', function(){
  steal.html.crawl("htmlclient/htmlclient.html","htmlclient/out")
});
