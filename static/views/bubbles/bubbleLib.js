/*===========================================================================
	Bubble Library
	included in goDumber Project, Team Bullback
	Writen by LyuGGang(me@lyuwonkyung.com) on 14.08.11. ~

	Required Libraries (Dependencies):
	- jQuery (http://jquery.com/)
	- Bootstrap (http://getbootstrap.com/)
	- Summernote (http://hackerwins.github.io/summernote/)
	- Font Awesome (http://fortawesome.github.io/Font-Awesome/)

	Structure:
	- MM Class: Making Mode
	- UM Class: User Mode
	- GeneralUtil Class: General Utilities
	- SpeechBubble Class: Speech Bubble
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
	everyElements: null,
	originElementstyle: null,
	onNewBubbleAddedCallback: null,
	nowOnFocusedElementIdx: null,
	util: null,
	nowShowingBubble: null,
	toggleSwitch: true,

	/*-----------------------------------------------------------------------
	// methods
	-----------------------------------------------------------------------*/

	// public
	toggleMode: function(doc, onNewBubbleAdded){

		var self = this;

		this.doc = doc;
		this.everyElements = $("*");//this.doc.getElementsByTagName("*");
		this.originElementstyle = new Array(this.everyElements.length);
		this.onNewBubbleAddedCallback = onNewBubbleAdded;

		this.toggleSwitch = true;

		// 기존의 쉐도우 스타일이 적용되어 있을 경우를 대비하여
		// 미리 저장해둠!
		for (var i=0; i<this.everyElements.length; i++){

			this.originElementstyle[i] = {
		    	webkitBoxShadow: this.everyElements[i].style.webkitBoxShadow
		    };
		  
		}

		// set mouse move event handler..
		$(this.doc).mousemove(function(event) {

			if(!self.toggleSwitch)
				return;

		    for (var i=0; i<self.everyElements.length; i++){

		    	// 전체 문서를 가리키거나 혹은 '+' 버튼을 가리킬 때에는 무시함
		    	if(self.everyElements[i] == $(self.doc) || $(event.target).attr('class') == "goDumber__PLUSBUTTON__" || $(event.target).attr('class') == "goDumber__PLUSBUTTON__IMG__")
		        	continue;
		      
		      	if(self.everyElements[i] == event.target){

		        	// set shadow
		        	self.everyElements[i].style.webkitBoxShadow = "inset 0 0 " + self.CONSTS.SHADOW_SIZE + "px " + self.CONSTS.SHADOW_COLOR;

		        	// '+' 버튼 추가
		        	if($(self.everyElements[i]).has( ".goDumber__PLUSBUTTON__" ).length == 0){

		        		self.nowOnFocusedElementIdx = i;

		        		var plusBtnDiv = $(self.CONSTS.PLUS_BUTTON_DIV);
		        		var rt = self.everyElements[i].getBoundingClientRect();
		        		plusBtnDiv.css("top", rt.top);
		        		plusBtnDiv.css("left", rt.left + rt.width - 20); 	// pixel

		        		// set click event handler
		        		plusBtnDiv.click(function() {

		        			self.toggleSwitchOnOff();
		        			self.evtPlusButtonClicked(self.everyElements[self.nowOnFocusedElementIdx]);
		        		});
		        		
		        		$(self.everyElements[i]).append(plusBtnDiv);
		        	}

		      	} 
		      	else {

		        	// get rid of shadow
		        	self.everyElements[i].style.webkitBoxShadow = self.originElementstyle[i].webkitBoxShadow;

		        	// get rid of plus button
		        	$(self.everyElements[i]).find(".goDumber__PLUSBUTTON__").remove();

		      	}

		    }
		});


	},

	toggleSwitchOnOff: function(){

		this.toggleSwitch = !this.toggleSwitch;
	},

	// private
	evtPlusButtonClicked: function(targetElement){

		var self = this;

		// making new speech bubble from templete.
		this.nowShowingBubble = new speechBubble(this);

		// null이면 제작 모드
		this.nowShowingBubble.makeNewBubble(targetElement, null, this.onNewBubbleAddedCallback);
	}
};

/*===========================================================================
// UM(User Mode) Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function UM(){



};

/*---------------------------------------------------------------------------
// prototype
---------------------------------------------------------------------------*/
UM.prototype = {

	/*-----------------------------------------------------------------------
	// vars
	-----------------------------------------------------------------------*/
	bubble: null,
	nowShowingBubble: null,


	/*-----------------------------------------------------------------------
	// methods
	-----------------------------------------------------------------------*/
	// 스피치 버블에 대한 정보를 넘겨 받으면, 해당 target element에 스피치 버블을 생성해줌.
	setSpeechBubbleOnTarget: function(bubbleInfo, onActionCallback){


		// (new speechBubble(this)).makeNewBubble(null, bubbleInfo, onActionCallback);	// 이렇게도 되긴 하는구나.. 그래도 어디서 메모리 가져갈지도 모르니까 확실해지면 쓰자.

		this.nowShowingBubble = new speechBubble(this);
		this.nowShowingBubble.makeNewBubble(null, bubbleInfo, onActionCallback);



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


	getAbsoluteElementPath: function(targetElement) {

		// from https://bitbucket.org/tehrengruber/jquery.Element.path

		var self = this;

		if (typeof(targetElement) == "undefined") {
            targetElement = true;		
        }

		var Elements = new Array();
		var element = $(targetElement).first();

		element.parents().not('html').each(function() {

		 	// 현재 추가된 태그가 처음이 아니라면
		 	if(Elements.length > 0){

 				if (Elements.length-1 < 0) {
 					throw "Elements.length-1 cannot be less than 0";	// throw exception!
 				}
 				
		 		//전에 추가된(자식)의 갯수를 구해서 순서를 추가해주어야함.
		 		var childElement = Elements[Elements.length-1];

		 		var i = 1;

		 		$(this).find(childElement.name).each(function() {

		 			if($(this).hasClass("__goDumber__specificElement__")){

		 				Elements[Elements.length-1].order = i;
		 				$(this).removeClass("__goDumber__specificElement__");
		 				return;

		 			}else{

		 				i++;
		 			}

		 		});

        	}

		 	// 이름, 갯수 객체를 임시로 만들어 배열에 추가한다.
        	Elements.push({
        		Element: this,
		 		name: self.getStringForElement(this),
		 		order: 1
		 	});
        	
        	// 추후에 카운팅을 위해 임시로 클래스를 추가한다.
        	$(this).addClass("__goDumber__specificElement__");

        });

        Elements.reverse();

		// 마지막 Element은 별개로 처리한다.        
        Elements.push({
        	Element: element[0],
        	name: this.getStringForElement(element[0]),
        	order: 1
        });


		$(element[0]).addClass("__goDumber__specificElement__");

        var order = 1;
       
        $(Elements[Elements.length-2].Element).find(Elements[Elements.length-1].name).each(function() {

			if($(this).hasClass("__goDumber__specificElement__")){

	 				Elements[Elements.length-1].order = order;
	 				$(this).removeClass("__goDumber__specificElement__");

	 			}else{

	 				order++;
	 			}

        });

        $("body").removeClass("__goDumber__specificElement__");
        return Elements;

    },

    getStringForElement: function (element) {
        var string = element.tagName.toLowerCase();

        if (element.id) {
            string += "#" + element.id;
        }
        if (element.className) {
            string += "." + element.className.replace(/ /g, '.');
        }

        return string;
    },

	getSpecificElementWithPathObj: function(ElementPathObj){


		var curObj = $(ElementPathObj[0].name);

		for(var i = 1; i<ElementPathObj.length; i++){


			curObj = $($(curObj.find(ElementPathObj[i].name))[ElementPathObj[i].order-1]);			

		}

		return curObj;


	},

	preventALinks: function() {

		$("a").click(function(event) {
  			event.preventDefault();
  		});
	},

	restoreALinks: function() {
		throw "Not implemented yet";

	}

	

}


/*===========================================================================
// Speech Bubble Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function speechBubble(parentObj){

	var self = this;


	// freeze constants
	Object.freeze(this.CONSTS);


	this.parentObj = parentObj;


};

/*---------------------------------------------------------------------------
// prototype
---------------------------------------------------------------------------*/
speechBubble.prototype = {

	CONSTS: {
		TEMPLATE: [
	          '<div id="__goDumber__popover__" class="popover container-fluid" role="tooltip" style="max-width: 400px;">',
	          '  <div class="arrow"></div>',
	          '  <div id="bubble" class="row panel panel-default panel-danger" style="width: 400px;">',
	          '    <div id="title" class="panel-heading col-xs-12">',
	          '      <div class="panel-title">',
	          '        <div id="edit" class="popover-title" >',
	          '          ',
	          '        </div>',
	          '      </div>',
	          '    </div>',
	          '    <div id="content" class="panel-body col-xs-12">',
	          '      <div class="row">',
	          '        <div class="col-xs-12">',
	          '          <div id="edit" class="popover-content" >',
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
	          '          <button id="__goDumber__bubbleSaveBtn__" class="btn btn-block btn-danger">',
	          '            <i class="fa fa-check"></i> 저장',
	          '          </button>',
	          '        </div>',
	          '        <div class="col-xs-4" style="padding-left: 0;">',
	          '          <button id="__goDumber__bubbleCancleBtn__" class="btn btn-block btn-default">',
	          '            <i class="fa fa-times"></i> 취소',
	          '          </button>',
	          '        </div>',
	          '      </div>',
	          '    </div>',
	          '  </div>',
	          '</div>'
	    ].join('\n')
	},


    bubble: null,
    onSaveCallback: null,
    onActionCallback: null,
    parentObj: null,

	makeNewBubble: function(targetElement, bubbleData, onActionCallback){

		var self = this;

		// 제작 모드
		if(bubbleData == null){

			// making mode
			this.bubble = this.CONSTS.TEMPLATE;
			this.onSaveCallback = onActionCallback;

			$(targetElement).popover({
		        html: true,
		        title: function() {
		          return '수정하려면 클릭하세요';
		        },
		        content: function() {
		          return '수정하려면 클릭하세요';
		        },
		        template: this.bubble,
		        placement: 'right',
		        trigger: 'manual'
		    });


	        $(targetElement).popover('show');

	        // TODO: css는 별도의 css 파일로 빠져야함
			$("#edit.popover-title").css('color', 'rgb(0,0,0)');
			$("#edit.popover-content").css('color', 'rgb(0,0,0)');

			$("#edit.popover-title").click(function() {
				self.onTitleEdit();
			});


			$("#edit.popover-content").click(function() {
				self.onContentEdit();
			});


			$("#__goDumber__bubbleSaveBtn__").click(function() {
				self.onSave(targetElement);
			});

			$("#__goDumber__bubbleCancleBtn__").click(function() {
				self.onCancle(targetElement);
			});

		}
		else{
			// 플레이 모드
			// throw 'Not implemented yet';

			// 액션이 일어난 이후의 콜백을 저장
			this.onActionCallback = onActionCallback;


			// 가져온 정보를 기반으로 스피치 버블 엘레멘트(div) 만들기

			// 넥스트 버튼이나 클릭 이벤트 등록

			// append!



		}

	},

    onTitleEdit: function() {
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
    },

    onContentEdit: function() {
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
    },

    onSave: function(targetElement) {

    	this.parentObj.toggleSwitchOnOff();

    	var title = $('#bubble #title #edit').code();
    	var content = $('#bubble #content #edit').code();

    	this.onSaveCallback();

    	$(targetElement).popover('hide');
    },

    onCancle: function(targetElement){


    	this.parentObj.toggleSwitchOnOff();

    	$(targetElement).popover('hide');
    	$('#__goDumber__popover__').destroy();
    }
}