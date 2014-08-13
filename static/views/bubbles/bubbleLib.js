/*===========================================================================
	Bubble Library
	included in goDumber Project, Team Bullback
	Writen by LyuGGang on 14.08.11.
===========================================================================*/

/*===========================================================================
// MM(Making Mode) Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function MM(){

	// freeze Constants
	Object.freeze(this.CONSTS);

	// set general utils
	this.util = new generalUtil();
};

/*---------------------------------------------------------------------------
// prototype
---------------------------------------------------------------------------*/
MM.prototype = {

	/*-----------------------------------------------------------------------
	//consts
	-----------------------------------------------------------------------*/

	// private
	CONSTS: {
		//PRJ_NAME: "goDumber",
		SHADOW_SIZE: 10,
		SHADOW_COLOR: "#3DB7CC",
		PLUS_BUTTON_DIV: "<div class='goDumber__PLUSBUTTON__' style='position:absolute;z-index:999;top:0px;left:0px;width:20px;cursor:pointer;'><img class='goDumber__PLUSBUTTON__IMG__' src='../plus.png' /></div>"
	},

	/*-----------------------------------------------------------------------
	// vars
	-----------------------------------------------------------------------*/

	// private
	doc: null,
	everyDOMs: null,
	originDOMstyle: null,
	onNewBubbleAddedCallback: null,
	nowOnFocusedDOMIdx: null,
	util: null,

	/*-----------------------------------------------------------------------
	// methods
	-----------------------------------------------------------------------*/

	// public
	toggleMode: function(doc, onNewBubbleAdded){

		var self = this;

		this.doc = doc;
		this.everyDOMs = $("*"); //this.doc.getElementsByTagName("*");
		this.originDOMstyle = new Array(this.everyDOMs.length);
		this.onNewBubbleAddedCallback = onNewBubbleAdded;

		// to keep the original styles!
		for (var i=0; i<this.everyDOMs.length; i++){

			this.originDOMstyle[i] = {

		    	webkitBoxShadow: this.everyDOMs[i].style.webkitBoxShadow
		    };

		  
		}

		// set mouse move event handler..
		$(this.doc).mousemove(function(event) {


		    for (var i=0; i<self.everyDOMs.length; i++){

		    	if(self.everyDOMs[i] == $(self.doc) || $(event.target).attr('class') == "goDumber__PLUSBUTTON__" || $(event.target).attr('class') == "goDumber__PLUSBUTTON__IMG__")
		        	continue;
		      
		      	if(self.everyDOMs[i] == event.target){

		        	// set shadow
		        	self.everyDOMs[i].style.webkitBoxShadow = "inset 0 0 " + self.CONSTS.SHADOW_SIZE + "px " + self.CONSTS.SHADOW_COLOR;

		        	// set plus button
		        	if($(self.everyDOMs[i]).has( ".goDumber__PLUSBUTTON__" ).length == 0){

		        		self.nowOnFocusedDOMIdx = i;

		        		var plusBtnDiv = $(self.CONSTS.PLUS_BUTTON_DIV);
		        		var rt = self.everyDOMs[i].getBoundingClientRect();
		        		plusBtnDiv.css("top", rt.top);
		        		plusBtnDiv.css("left", rt.left + rt.width - 20); 	// pixel
		        		// set click event handler
		        		plusBtnDiv.click(function() {
		        			self.plusButtonClicked(self.everyDOMs[self.nowOnFocusedDOMIdx]);
		        		});
		        		// appppppppppppppend
		        		$(self.everyDOMs[i]).append(plusBtnDiv);
		        	}

		      	}else{

		        	// get rid of shadow
		        	self.everyDOMs[i].style.webkitBoxShadow = self.originDOMstyle[i].webkitBoxShadow;

		        	// get rid of plus button
		        	$(self.everyDOMs[i]).find(".goDumber__PLUSBUTTON__").remove();


		      	}

		    }
		});


	},

	// private
	plusButtonClicked: function(targetDOM){

		console.log(this.util.getAbsoluteDOMPath(targetDOM));	// for debug

		var self = this;

		// making new speech bubble from templete.
		//this.util.makeNewSpeechBubble(true);


	}

	  


};

/*===========================================================================
// General Util Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function generalUtil(){


};

/*---------------------------------------------------------------------------
// prototype
---------------------------------------------------------------------------*/
generalUtil.prototype = {


	getAbsoluteDOMPath: function(targetDOM) {

		// from https://bitbucket.org/tehrengruber/jquery.dom.path
		// thx!
		return $(targetDOM).getDomPath();
    },

	preventALink: function() {

		$("a").click(function(event) {
  			event.preventDefault();
  		});
	},

	

}


/*===========================================================================
// Speech Bubble Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/

/*
function speechBubble(){

	
    var template = [
      '<div class="popover container-fluid" style="max-width: 400px;">',
      '  <div class="arrow"></div>',
      '  <div id="bubble" class="row panel panel-default panel-danger" style="width: 400px;">',
      '    <div id="title" class="panel-heading col-xs-12">',
      '      <div class="panel-title">',
      '        <div id="edit" class="popover-title" onclick="title_edit()">',
      '          ',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div id="content" class="panel-body col-xs-12">',
      '      <div class="row">',
      '        <div class="col-xs-12">',
      '          <div id="edit" class="popover-content" onclick="content_edit()">',
      '            ',
      '          </div>',
      '        </div>',
      '      </div>',
      '      <div class="row">',
      '        <div class="col-xs-3" style="padding-right: 0;">',
      '          <form class="form-inline" role="form">',
      '            <div class="form-group">',
      '              <label class="sr-only" for="triggerType">trigger type</label>',
      '              <select class="form-control">',
      '                <option>next</option>',
      '                <option>click</option>',
      '              </select>',
      '            </div>',
      '          </form>',
      '        </div>',
      '        <div class="col-xs-1">',
      '        </div>',
      '        <div class="col-xs-4" style="padding-left: 0;">',
      '          <button class="btn btn-block btn-danger" onclick="save()">',
      '            <i class="fa fa-check"></i> 저장',
      '          </button>',
      '        </div>',
      '        <div class="col-xs-4" style="padding-left: 0;">',
      '          <button class="btn btn-block btn-default">',
      '            <i class="fa fa-times"></i> 취소',
      '          </button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n')
    
    var config = {
	    html: true,
	    title: function() {
	    	return '수정하려면 클릭하세요';
	    },
	    content: function() {
	        return '수정하려면 클릭하세요';
	    },
	    template: template,
	    placement: 'right',
	    }

	    $('#target').popover(config);
	    $('#target').popover('show');
  	});

  var title_edit = function() {
    $('#bubble #title #edit').summernote({
      airMode: true,
      airPopover: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol']],
        ['insert', ['link']],
      ]
    });
  };
  
  var content_edit = function() {
    $('#bubble #content #edit').summernote({
      airMode: true,
      airPopover: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol']],
        ['insert', ['link']],
      ]
    });
  };
  
  var save = function() {
    var title = $('#bubble #title #edit').code();
    var content = $('#bubble #content #edit').code();


    $('#bubble #title #edit').destroy();
    $('#bubble #content #edit').destroy();
  };

	return bubble;

};
*/