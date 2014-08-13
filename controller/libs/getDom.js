$(document).ready(function() {
  $('body').bind('mouseover mouseout click', function(event) {

    var $status = $('#ycs-status');
    var $target = $(event.target);
    if (! ($target.closest('#ycs-wrapper').length || $target.closest('#ycs-handler').length) && ! $status.hasClass('handling')) {
      $target.toggleClass(event.type == 'click' ? 'ycs-outline-clicked' : 'ycs-outline-hovered');

      if(event.type == 'click') {
        $status.addClass('handling');
        $target.addClass('ycs-clicked');
        $('#ycs-handler #handler').modal({
          backdrop: 'static',
          keyboard: false
        })
        $('#ycs-handler #handler #locate').removeClass('clicked btn-danger').addClass('btn-info');
        $('#ycs-handler #handler #locate').empty().append("<i class=\"fa fa-arrows\"></i>&nbsp;이동");
        $('#ycs-handler #handler #delete').removeClass('clicked btn-danger').addClass('btn-info');
        $('#ycs-handler #handler #delete').empty().append("<i class=\"fa fa-trash-o\"></i>&nbsp;삭제");

        $('#ycs-handler #handler').modal('show');
        /*
        $.ajax({
          type: 'POST',
          data: {
            'test': 'test',
          },
          url : 'http://bullback.cafe24.com/ajax/',
          success: function(data) {
            var msg = 'Request Status: ' + request.status + '\n';
            msg += 'Request Errors: ' + error + '\n';
            msg += 'Response Message: ' + request.responseText
            alert(msg);
          },
          error: function(request, status, error) {
            var msg = 'Request Status: ' + request.status + '\n';
            msg += 'Request Errors: ' + error + '\n';
            msg += 'Response Message: ' + request.responseText
            alert(msg);
          },
        });
        */
      }
      
    }
  });

  $('#ycs-handler #handler #locate').bind('click', function(event) {
    var $status = $('#ycs-status');
    var $target = $('.ycs-clicked');

    if(! $status.hasClass('locating')) {
      $status.addClass('locating');
      $target.draggable();
      
      $('#ycs-handler #handler #locate').addClass('clicked btn-danger').removeClass('btn-info');
      $('#ycs-handler #handler #locate').empty().append("<i class=\"fa fa-undo\"></i>&nbsp;취소");
    } else {
      $status.removeClass('locating');
      $target.draggable('option', 'disabled', true);
      
      $('#ycs-handler #handler #locate').removeClass('clicked btn-danger').addClass('btn-info');
      $('#ycs-handler #handler #locate').empty().append("<i class=\"fa fa-arrows\"></i>&nbsp;이동");
    }
  });

  $('#ycs-handler #handler #delete').bind('click', function(event) {
    var $status = $('#ycs-status');
    var $target = $('.ycs-clicked');
    
    if(! $status.hasClass('deleting')) {
      $status.addClass('deleting');
      $target.hide();

      $('#ycs-handler #handler #delete').addClass('clicked btn-danger').removeClass('btn-info');
      $('#ycs-handler #handler #delete').empty().append("<i class=\"fa fa-undo\"></i>&nbsp;취소");
    } else {
      $status.removeClass('deleting');
      $target.show();

      $('#ycs-handler #handler #delete').removeClass('clicked btn-danger').addClass('btn-info');
      $('#ycs-handler #handler #delete').empty().append("<i class=\"fa fa-trash-o\"></i>&nbsp;삭제");
    }

  });

  $('#ycs-handler #handler #cancel').bind('click', function(event) {
    var $status = $('#ycs-status');

    $('.ycs-clicked').removeClass('ycs-clicked').removeClass('ycs-outline-hovered').removeClass('ycs-outline-clicked');
    $status.removeClass('handling');
    $status.removeClass('deleting');
    $status.removeClass('locating');
  });

  $('#ycs-handler #handler .close').bind('click', function(event) {
    var $status = $('#ycs-status');

    $('.ycs-clicked').removeClass('ycs-clicked').removeClass('ycs-outline-hovered').removeClass('ycs-outline-clicked');
    $status.removeClass('handling');
    $status.removeClass('deleting');
    $status.removeClass('locating');
  });
});
