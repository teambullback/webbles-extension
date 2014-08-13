function putDom(selector, type, attr, css, cls) {
  if(typeof(attr)==='undefined')
    attr = NaN;
  if(typeof(css)==='undefined')
    css = NaN;
  if(typeof(cls)==='undefined')
    cls = NaN;
  
  var elem = $("<" + type + "></" + type + ">");

  $.each(attr, function(index, value) {
    elem.attr(index, value);
  });

  $.each(css, function(index, value) {
    elem.css(index, value);
  });

  $.each(cls, function(index, value) {
    elem.addClass(value);
  });

  elem.appendTo(selector);

  return elem;
}