/*!
 * zoom.js 0.3
 * http://lab.hakim.se/zoom-js
 * MIT licensed
 *
 * Copyright (C) 2011-2014 Hakim El Hattab, http://hakim.se
 */
var zoom = (function(){

  // The current zoom level (scale)
  var level = 1;

  // The current mouse position, used for panning
  var mouseX = 0,
    mouseY = 0;

  // Timeout before pan is activated
  var panEngageTimeout = -1,
    panUpdateInterval = -1;

  // Timeout for call back function
  var callbackTimeout = -1;

  // Check for transform support so that we can fallback otherwise
  var supportsTransforms =  'WebkitTransform' in document.body.style ||
                'MozTransform' in document.body.style ||
                'msTransform' in document.body.style ||
                'OTransform' in document.body.style ||
                'transform' in document.body.style;

  if( supportsTransforms ) {
    // The easing that will be applied when we zoom in/out
    document.body.style.transition = 'transform 0.8s ease';
    document.body.style.OTransition = '-o-transform 0.8s ease';
    document.body.style.msTransition = '-ms-transform 0.8s ease';
    document.body.style.MozTransition = '-moz-transform 0.8s ease';
    document.body.style.WebkitTransition = '-webkit-transform 0.8s ease';
  }

  // Zoom out if the user hits escape
  document.addEventListener( 'keyup', function( event ) {
    if( level !== 1 && event.keyCode === 27 ) {
      zoom.out();
    }
  } );

  // Monitor mouse movement for panning
  document.addEventListener( 'mousemove', function( event ) {
    if( level !== 1 ) {
      mouseX = event.clientX;
      mouseY = event.clientY;
    }
  } );

  /**
   * Applies the CSS required to zoom in, prefers the use of CSS3
   * transforms but falls back on zoom for IE.
   *
   * @param {Object} rect
   * @param {Number} scale
   */
  function magnify( rect, scale ) {

    var scrollOffset = getScrollOffset();

    // Ensure a width/height is set
    rect.width = rect.width || 1;
    rect.height = rect.height || 1;

    // Center the rect within the zoomed viewport
    rect.x -= ( window.innerWidth - ( rect.width * scale ) ) / 2;
    rect.y -= ( window.innerHeight - ( rect.height * scale ) ) / 2;

    if( supportsTransforms ) {
      // Reset
      if( scale === 1 ) {
        document.body.style.transform = '';
        document.body.style.OTransform = '';
        document.body.style.msTransform = '';
        document.body.style.MozTransform = '';
        document.body.style.WebkitTransform = '';
      }
      // Scale
      else {
        var origin = scrollOffset.x +'px '+ scrollOffset.y +'px',
          transform = 'translate('+ -rect.x +'px,'+ -rect.y +'px) scale('+ scale +')';

        document.body.style.transformOrigin = origin;
        document.body.style.OTransformOrigin = origin;
        document.body.style.msTransformOrigin = origin;
        document.body.style.MozTransformOrigin = origin;
        document.body.style.WebkitTransformOrigin = origin;

        document.body.style.transform = transform;
        document.body.style.OTransform = transform;
        document.body.style.msTransform = transform;
        document.body.style.MozTransform = transform;
        document.body.style.WebkitTransform = transform;
      }
    }
    else {
      // Reset
      if( scale === 1 ) {
        document.body.style.position = '';
        document.body.style.left = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.zoom = '';
      }
      // Scale
      else {
        document.body.style.position = 'relative';
        document.body.style.left = ( - ( scrollOffset.x + rect.x ) / scale ) + 'px';
        document.body.style.top = ( - ( scrollOffset.y + rect.y ) / scale ) + 'px';
        document.body.style.width = ( scale * 100 ) + '%';
        document.body.style.height = ( scale * 100 ) + '%';
        document.body.style.zoom = scale;
      }
    }

    level = scale;
  }

  /**
   * Pan the document when the mosue cursor approaches the edges
   * of the window.
   */
  function pan() {
    var range = 0.12,
      rangeX = window.innerWidth * range,
      rangeY = window.innerHeight * range,
      scrollOffset = getScrollOffset();

    // Up
    if( mouseY < rangeY ) {
      window.scroll( scrollOffset.x, scrollOffset.y - ( 1 - ( mouseY / rangeY ) ) * ( 14 / level ) );
    }
    // Down
    else if( mouseY > window.innerHeight - rangeY ) {
      window.scroll( scrollOffset.x, scrollOffset.y + ( 1 - ( window.innerHeight - mouseY ) / rangeY ) * ( 14 / level ) );
    }

    // Left
    if( mouseX < rangeX ) {
      window.scroll( scrollOffset.x - ( 1 - ( mouseX / rangeX ) ) * ( 14 / level ), scrollOffset.y );
    }
    // Right
    else if( mouseX > window.innerWidth - rangeX ) {
      window.scroll( scrollOffset.x + ( 1 - ( window.innerWidth - mouseX ) / rangeX ) * ( 14 / level ), scrollOffset.y );
    }
  }

  function getScrollOffset() {
    return {
      x: window.scrollX !== undefined ? window.scrollX : window.pageXOffset,
      y: window.scrollY !== undefined ? window.scrollY : window.pageYOffset
    }
  }

  return {
    /**
     * Zooms in on either a rectangle or HTML element.
     *
     * (necessary)
     * @param {Object} options
     *
     *   (necessary)
     *   - element: HTML element to zoom in on
     *   OR
     *   - x/y: coordinates in non-transformed space to zoom in on
     *   - width/height: the portion of the screen to zoom in on
     *   - scale: can be used instead of width/height to explicitly set scale
     *
     *   (optional)
     *   - callback: call back when zooming in ends
     *   - padding: space around of zoomed in element
     */
      to: function( options ) {

      // Due to an implementation limitation we can't zoom in
      // to another element without zooming out first
      if( level !== 1 ) {
        zoom.out();
      }
      else {
        options.x = options.x || 0;
        options.y = options.y || 0;

        // If an element is set, that takes precedence
        if( !!options.element ) {
          // Space around the zoomed in element to leave on screen
          var padding = (typeof options.padding === "undefined") ? (20) : (options.padding);
          var bounds = options.element.getBoundingClientRect();

          options.x = bounds.left - padding;
          options.y = bounds.top - padding;
          options.width = bounds.width + ( padding * 2 );
          options.height = bounds.height + ( padding * 2 );
        }

        // If width/height values are set, calculate scale from those values
        if( options.width !== undefined && options.height !== undefined ) {
          options.scale = Math.max( Math.min( window.innerWidth / options.width, window.innerHeight / options.height ), 1 );
        }

        if( options.scale > 1 ) {
          options.x *= options.scale;
          options.y *= options.scale;

          options.x = (options.x < 0) ? 0 : options.x;
          options.y = (options.y < 0) ? 0 : options.y;

          magnify( options, options.scale );

          if( options.pan !== false ) {

            // Wait with engaging panning as it may conflict with the
            // zoom transition
            panEngageTimeout = setTimeout( function() {
              panUpdateInterval = setInterval( pan, 1000 / 60 );
            }, 800 );

          }

          if ( !!options.callback ) {
              callbackTimeout = setTimeout ( function () {
                options.callback();
            }, 800);
          }
        }
      }
    },

    /**
     * Resets the document zoom state to its default.
     *
     * (optional)
     * @param {Object} options
     *   (optional)
     *   - callback: call back when zooming out ends
     *
     */
    out: function( options ) {

      clearTimeout( panEngageTimeout );
      clearInterval( panUpdateInterval );
      clearTimeout( callbackTimeout );

      magnify( { x: 0, y: 0 }, 1 );

      if( typeof options !== "undefined" && typeof options.callback !== "undefined"){
        setTimeout ( function () {
            options.callback();          
        }, 800);
      }

      level = 1;
    },

    // Alias
    magnify: function( options ) { this.to( options ) },
    reset: function() { this.out() },

    zoomLevel: function() {
      return level;
    }
  }

})();



/*!
 * jQuery Smooth Scroll - v1.5.3 - 2014-10-15
 * https://github.com/kswedberg/jquery-smooth-scroll
 * Copyright (c) 2014 Karl Swedberg
 * Licensed MIT (https://github.com/kswedberg/jquery-smooth-scroll/blob/master/LICENSE-MIT)
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {

  var version = '1.5.3',
      optionOverrides = {},
      defaults = {
        exclude: [],
        excludeWithin:[],
        offset: 0,

        // one of 'top' or 'left'
        direction: 'top',

        // jQuery set of elements you wish to scroll (for $.smoothScroll).
        //  if null (default), $('html, body').firstScrollable() is used.
        scrollElement: null,

        // only use if you want to override default behavior
        scrollTarget: null,

        // fn(opts) function to be called before scrolling occurs.
        // `this` is the element(s) being scrolled
        beforeScroll: function() {},

        // fn(opts) function to be called after scrolling occurs.
        // `this` is the triggering element
        afterScroll: function() {},
        easing: 'swing',
        speed: 400,

        // coefficient for "auto" speed
        autoCoefficient: 2,

        // $.fn.smoothScroll only: whether to prevent the default click action
        preventDefault: true
      },

      getScrollable = function(opts) {
        var scrollable = [],
            scrolled = false,
            dir = opts.dir && opts.dir === 'left' ? 'scrollLeft' : 'scrollTop';

        this.each(function() {

          if (this === document || this === window) { return; }
          var el = $(this);
          if ( el[dir]() > 0 ) {
            scrollable.push(this);
          } else {
            // if scroll(Top|Left) === 0, nudge the element 1px and see if it moves
            el[dir](1);
            scrolled = el[dir]() > 0;
            if ( scrolled ) {
              scrollable.push(this);
            }
            // then put it back, of course
            el[dir](0);
          }
        });

        // If no scrollable elements, fall back to <body>,
        // if it's in the jQuery collection
        // (doing this because Safari sets scrollTop async,
        // so can't set it to 1 and immediately get the value.)
        if (!scrollable.length) {
          this.each(function() {
            if (this.nodeName === 'BODY') {
              scrollable = [this];
            }
          });
        }

        // Use the first scrollable element if we're calling firstScrollable()
        if ( opts.el === 'first' && scrollable.length > 1 ) {
          scrollable = [ scrollable[0] ];
        }

        return scrollable;
      };

  $.fn.extend({
    scrollable: function(dir) {
      var scrl = getScrollable.call(this, {dir: dir});
      return this.pushStack(scrl);
    },
    firstScrollable: function(dir) {
      var scrl = getScrollable.call(this, {el: 'first', dir: dir});
      return this.pushStack(scrl);
    },

    smoothScroll: function(options, extra) {
      options = options || {};

      if ( options === 'options' ) {
        if ( !extra ) {
          return this.first().data('ssOpts');
        }
        return this.each(function() {
          var $this = $(this),
              opts = $.extend($this.data('ssOpts') || {}, extra);

          $(this).data('ssOpts', opts);
        });
      }

      var opts = $.extend({}, $.fn.smoothScroll.defaults, options),
          locationPath = $.smoothScroll.filterPath(location.pathname);

      this
      .unbind('click.smoothscroll')
      .bind('click.smoothscroll', function(event) {
        var link = this,
            $link = $(this),
            thisOpts = $.extend({}, opts, $link.data('ssOpts') || {}),
            exclude = opts.exclude,
            excludeWithin = thisOpts.excludeWithin,
            elCounter = 0, ewlCounter = 0,
            include = true,
            clickOpts = {},
            hostMatch = ((location.hostname === link.hostname) || !link.hostname),
            pathMatch = thisOpts.scrollTarget || ( $.smoothScroll.filterPath(link.pathname) === locationPath ),
            thisHash = escapeSelector(link.hash);

        if ( !thisOpts.scrollTarget && (!hostMatch || !pathMatch || !thisHash) ) {
          include = false;
        } else {
          while (include && elCounter < exclude.length) {
            if ($link.is(escapeSelector(exclude[elCounter++]))) {
              include = false;
            }
          }
          while ( include && ewlCounter < excludeWithin.length ) {
            if ($link.closest(excludeWithin[ewlCounter++]).length) {
              include = false;
            }
          }
        }

        if ( include ) {

          if ( thisOpts.preventDefault ) {
            event.preventDefault();
          }

          $.extend( clickOpts, thisOpts, {
            scrollTarget: thisOpts.scrollTarget || thisHash,
            link: link
          });

          $.smoothScroll( clickOpts );
        }
      });

      return this;
    }
  });

  $.smoothScroll = function(options, px) {
    if ( options === 'options' && typeof px === 'object' ) {
      return $.extend(optionOverrides, px);
    }
    var opts, $scroller, scrollTargetOffset, speed, delta,
        scrollerOffset = 0,
        offPos = 'offset',
        scrollDir = 'scrollTop',
        aniProps = {},
        aniOpts = {};

    if (typeof options === 'number') {
      opts = $.extend({link: null}, $.fn.smoothScroll.defaults, optionOverrides);
      scrollTargetOffset = options;
    } else {
      opts = $.extend({link: null}, $.fn.smoothScroll.defaults, options || {}, optionOverrides);
      if (opts.scrollElement) {
        offPos = 'position';
        if (opts.scrollElement.css('position') === 'static') {
          opts.scrollElement.css('position', 'relative');
        }
      }
    }

    scrollDir = opts.direction === 'left' ? 'scrollLeft' : scrollDir;

    if ( opts.scrollElement ) {
      $scroller = opts.scrollElement;
      if ( !(/^(?:HTML|BODY)$/).test($scroller[0].nodeName) ) {
        scrollerOffset = $scroller[scrollDir]();
      }
    } else {
      $scroller = $('html, body').firstScrollable(opts.direction);
    }

    // beforeScroll callback function must fire before calculating offset
    opts.beforeScroll.call($scroller, opts);

    scrollTargetOffset = (typeof options === 'number') ? options :
                          px ||
                          ( $(opts.scrollTarget)[offPos]() &&
                          $(opts.scrollTarget)[offPos]()[opts.direction] ) ||
                          0;

    aniProps[scrollDir] = scrollTargetOffset + scrollerOffset + opts.offset;
    speed = opts.speed;

    // automatically calculate the speed of the scroll based on distance / coefficient
    if (speed === 'auto') {

      // $scroller.scrollTop() is position before scroll, aniProps[scrollDir] is position after
      // When delta is greater, speed will be greater.
      delta = aniProps[scrollDir] - $scroller.scrollTop();
      if(delta < 0) {
        delta *= -1;
      }

      // Divide the delta by the coefficient
      speed = delta / opts.autoCoefficient;
    }

    aniOpts = {
      duration: speed,
      easing: opts.easing,
      complete: function() {
        opts.afterScroll.call(opts.link, opts);
      }
    };

    if (opts.step) {
      aniOpts.step = opts.step;
    }

    if ($scroller.length) {
      $scroller.stop().animate(aniProps, aniOpts);
    } else {
      opts.afterScroll.call(opts.link, opts);
    }
  };

  $.smoothScroll.version = version;
  $.smoothScroll.filterPath = function(string) {
    string = string || '';
    return string
      .replace(/^\//,'')
      .replace(/(?:index|default).[a-zA-Z]{3,4}$/,'')
      .replace(/\/$/,'');
  };

  // default options
  $.fn.smoothScroll.defaults = defaults;

  function escapeSelector (str) {
    return str.replace(/(:|\.)/g,'\\$1');
  }

}));

// ------------------------------------------------------------------------------------
// http://paste.blixt.org/297640
// http://stackoverflow.com/questions/2068272/getting-a-jquery-selector-for-an-element

jQuery.fn.getPath = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;

        name = name.toLowerCase();
        // form의 경우 form 내부에 hidden input 자식의 id가 "id"인 경우, realNode.id를 찍으면 해당 노드를 가르키게 된다.
        // 이에 오작동이 발생하므로, form인 경우를 realNode.length로 판가름 하여
        // form인 경우에 단순히 name(tagName)만 추가하도록 수정하고
        // 만약 같은 레벨에 form 객체가 여러게 있는 경우 단순히 시블링 순서로만 찾아 갈 수 있게끔 유도한다.
        // 141016 by LyuGGang
        if(typeof realNode.length == "undefined"){
          if (realNode.id) {
              // As soon as an id is found, there's no need to specify more.
              return name + '#' + realNode.id + (path ? '>' + path : '');
          } else if (realNode.className) {
              name += '.' + realNode.className.split(/\s+/).join('.');
          }
        }

        var parent = node.parent(), siblings = parent.children(name);
        if (siblings.length > 1) name += ':eq(' + siblings.index(node) + ')';
        path = name + (path ? '>' + path : '');

        node = parent;
    }

    return path;
};


// ------------------------------------------------------------------------------------

$.fn.getSelector = function() {
  var el = this[0];
  if (!el.tagName) {
    return '';
  }

  // If we have an ID, we're done; that uniquely identifies this element
  var el$ = $(el);
  var id = el$.attr('id');
  if (id) {
    return '#' + id;
  }

  var classNames = el$.attr('class');
  var classSelector;
  if (classNames) {
    classSelector = '.' + $.trim(classNames).replace(/\s/gi, '.');
  }

  var selector;
  var parent$ = el$.parent();
  var siblings$ = parent$.children();
  var needParent = false;
  if (classSelector && siblings$.filter(classSelector).length == 1) {
     // Classes are unique among siblings; use that
     selector = classSelector;
  } else if (siblings$.filter(el.tagName).length == 1) {
     // Tag name is unique among siblings; use that
     selector = el.tagName;
  } else {
     // Default to saying "nth child"
     // :nth 앞에만 '>' 를 붙여주어 sizzle library에서 정상적으로 인식이 가능하도록 합니다. 141011 by LyuGGang
     selector = '> :nth(' + $(this).index() + ')';
     needParent = true;
  }

  // Bypass ancestors that don't matter
  if (!needParent) {
    for (ancestor$ = parent$.parent();
         ancestor$.length == 1 && ancestor$.find(selector).length == 1;
         parent$ = ancestor$, ancestor$ = ancestor$.parent());
    if (ancestor$.length == 0) {
       return selector;
    }
  }

  // selector 맨 앞에 .이나 #가 붙어있는 경우 앞에 ">"를 붙여준다. 141011 by LyuGGang
  // if(selector[0] == "." || selector[0] == "#")
  //   selector =  "> " + selector;

  return parent$.getSelector() + ' ' + selector;
}






