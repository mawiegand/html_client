$(document).ready(function() {
  
  var details = false;
  
  var msgs = [ '#msg0', '#msg5', '#msg6', '#msg7', '#msg0', '#msg1', '#msg2', '#msg3'  ];
  var dm = 0;
  
  $('#footerbar').click(function() {
    if (!details) {
      $('#detailsbar').show();
      $('#message').fadeOut('slow');
      $('#mainbar').slideUp('slow');
      $('#menubar').slideUp('fast');
      details = true;
    }
    else {
      $('#menubar').slideDown('slow');
      $('#mainbar').slideDown('slow', function() {
        $('#detailsbar').hide(); 
        $('#message').fadeIn();
      });
      details = false;
    }
  });
  
  
  
  
  var animate = function() {
    if (details) return ; 
    $(msgs[dm]).fadeOut('slow', function() {
      if (details) return ;
      dm= (dm+1) % msgs.length;
      $(msgs[dm]).fadeIn('slow');
    });
  }
  
  //setInterval(animate, 5000);
  
  
});