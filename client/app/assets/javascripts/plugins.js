// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/

window.log = function f(){ 
  
  return ;
  
  log.history = log.history || []; 
  log.history.push(arguments); 
  if(this.console) { 
    var args = arguments, newarr; 
    args.callee = args.callee.caller; 
    newarr = [].slice.call(args); 
    if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); 
    else console.log.apply(console, newarr);
  }
};

// make it safe to use console.log always
(function(a) {
  function b(){}
  for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){
    a[d]=a[d]||b;
  }
})
(function() {
  try{
    console.log();
    return window.console;
  } catch(a) {
    return (window.console={});
  }
}());


// place any jQuery/helper plugins in here, instead of separate, slower script files.
Math.getRandomBetween = function(min, max) {
  return min + (Math.random()*(max - min));
};

Math.getRandomOfTwo = function(x, y) {
  if(Math.random() < 0.5)
  {
    return x;
  }
  else
  {
    return y;
  }
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
