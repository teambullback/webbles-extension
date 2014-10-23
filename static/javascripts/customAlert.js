function customAlert() {};

customAlert.prototype = {
  
  render : function(dialog){
    $.ajax({
        url: chrome.extension.getURL('static/pages/customAlert.html'),
        success: function(data) {
            $(data).appendTo('body');

            var winW = window.innerWidth;
            var winH = window.innerHeight;

            $('#dialogoverlay').css('height',winH + 'px');

            $('#dialogbox').css('left',(winW/2) - (300 * .5)+ 'px');
            $('#dialogbox').css('top','100px');

            //$('#dialogbox').fadeIn(500);
            $( "#dialogbox" ).show( "scale",100);

            $('#dialogboxhead').html('Warning');
            $('#dialogboxbody').html(dialog);
            

            $('#dialogboxfoot_ok').bind('click', function() { 
              $('#dialogoverlay').remove();
              $('#dialogbox').remove();
            });
        },
        fail: function() {
            throw "** COULD'T GET TEMPLATE FILE!";
        }
    });
  }

};

