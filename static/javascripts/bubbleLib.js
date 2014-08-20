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

	Known Bugs:
		1. 같은 버블에서 두 번 이상 '+' 클릭시 마우스 오버 포커싱 On/Off가 정상적으로
		작동하지 않음.

	TODOs:
		1. 스피치 버블이 올라왔을 때, 다시 '+' 버튼 안눌러지게.
		2. 기타 주석에 포함된 'TODO'
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
	onBubbleSavedCallback: null,
	nowOnFocusedElementIdx: null,
	util: null,
	nowShowingBubble: null,
	toggleSwitch: true,

	/*-----------------------------------------------------------------------
	// methods
	-----------------------------------------------------------------------*/

	// public
	toggleMode: function(doc, onNewBubbleAdded, onBubbleSaved){

		var self = this;

		this.doc = doc;
		this.everyElements = $("*");//this.doc.getElementsByTagName("*");
		this.originElementstyle = new Array(this.everyElements.length);
		this.onNewBubbleAddedCallback = onNewBubbleAdded;	// function(isNewAdded, triggerType)
		this.onBubbleSavedCallback = onBubbleSaved;	// function(bubble)

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

	// 제작모드에서 특정 스피치 버블로 쩜프시킨다.
	setSpeechBubbleOnTarget: function(bubbleInfo){

		// console.log('ddd'); 	// for debug

		// 제일 먼저 현재 제작모드가 맞는지 validate (throw Exception)

		// 이미 떠있는 버블이 있는지 확인
		if(this.nowShowingBubble != null){

			if(this.nowShowingBubble.bubble != null){
				// 떠있으면 내리기
				this.nowShowingBubble.onCancle(null);
			}
		}

		// TODO: 마우스 오버 포커싱 온오프 부분 확실하게
		//this.toggleSwitchOnOff();

		// 가져온 bubbleInfo를 기준으로 해당 Target element 찾아서 띄워줌.
		// Target Element 가져오기(jQuery Selector)
		var targetElement = this.util.getSpecificElementWithPathObj(bubbleInfo.dompath);

		// TODO: 해당 Target Element 포커싱해주기(쉐도우)


		// bubbleInfo를 실제 bubble로 제작
		this.nowShowingBubble = new speechBubble(this);

		// 띄우고 토글스위치 끄기
		this.nowShowingBubble.makeNewBubble(targetElement, bubbleInfo, this.onBubbleSavedCallback, this.nowShowingBubble.CONSTS.bubbleMakingMode.MM['modify']);
	},

	// private
	evtPlusButtonClicked: function(targetElement){

		var self = this;

		// making new speech bubble from templete.
		this.nowShowingBubble = new speechBubble(this);

		// status bar에게 plus 버튼이 눌러졌음을 알려줌
		// plus 버튼이 눌러져서 처음 버블이 생성되었기 때문에 처음 파라미터는 true로!
		this.onNewBubbleAddedCallback(true, 'next');
	
		this.nowShowingBubble.makeNewBubble(targetElement, null, this.onBubbleSavedCallback, this.nowShowingBubble.CONSTS.bubbleMakingMode.MM['first']);
	}
};

/*===========================================================================
// UM(User Mode) Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function UM(){


	this.util = new generalUtil();

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
	util: null,


	/*-----------------------------------------------------------------------
	// methods
	-----------------------------------------------------------------------*/
	// 스피치 버블에 대한 정보를 넘겨 받으면, 해당 target element에 스피치 버블을 생성해줌.
	setSpeechBubbleOnTarget: function(bubbleInfo, onActionCallback){

		var self = this;

		// (new speechBubble(this)).makeNewBubble(null, bubbleInfo, onActionCallback);	// 이렇게도 되긴 하는구나.. 그래도 어디서 메모리 가져갈지도 모르니까 확실해지면 쓰자.
		this.nowShowingBubble = new speechBubble(this);
		

		// target element 구하기
		var targetElement = this.util.getSpecificElementWithPathObj(bubbleInfo.dompath);

		// 트리거 종류에 맞게 다르게 처리해야(이벤트를 다르게 주어야)함.
		switch(bubbleInfo.trigger){


			case "N":
				this.nowShowingBubble.makeNewBubble(targetElement, bubbleInfo, onActionCallback, this.nowShowingBubble.CONSTS.bubbleMakingMode.UM[bubbleInfo.trigger]);	// onCationCallback();
				break;
			
			case "C":
				self.nowShowingBubble.makeNewBubble(targetElement, bubbleInfo, onActionCallback, this.nowShowingBubble.CONSTS.bubbleMakingMode.UM[bubbleInfo.trigger]);
				break;
			
			default:
				throw 'undefined bubble trigger!: ' + bubbleInfo.trigger;
				break;

		}



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


	this.util = new generalUtil();

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
	          '        <div id="edit" class="edit popover-title" >',
	          '          ',
	          '        </div>',
	          '      </div>',
	          '    </div>',
	          '    <div id="content" class="panel-body col-xs-12">',
	          '      <div class="row">',
	          '        <div class="col-xs-12">',
	          '          <div id="edit" class="edit popover-content" >',
	          '            ',
	          '          </div>',
	          '        </div>',
	          '      </div>',
	          '      <div class="row">',
	          '        <div class="col-xs-3" style="padding-right: 0;">',
	          '          <form class="form-inline" role="form">',
	          '            <div class="form-group">',
	          '              <label class="sr-only" for="triggerType">trigger type</label>',
	          '              <select id="__goDumber__trigger__" class="form-control">',
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
	          '            <i id="__goDumber__bubbleCancleBtn__inner__icon" class="fa fa-times"></i> <span id="__goDumber__bubbleCancleBtn__inner__text">취소</span>',
	          '          </button>',
	          '        </div>',
	          '      </div>',
	          '    </div>',
	          '  </div>',
	          '</div>'
	    ].join('\n'),

	    bubbleInfo: {      
	    	"id": null,
	    	"title": null,
	    	"description": null,
	    	"dompath":null,
	    	"trigger": null,
	    	"is_init_document":true,
	    	"prev": null,
	    	"document": null
	    },

	    triggers:{

	    	'next': "N",
	    	'click': "C"
	    },

	    bubbleMakingMode:{

	    	'MM': {
	    		'first': 11,
	    		'modify': 12
	    	},

	    	'UM': {
	    		'N': 21,
	    		'C': 22
	    	}
	    }
	},


    bubble: null,
    onSaveCallback: null,
    onActionCallback: null,
    parentObj: null,
    util: null,
    selectedTrigger: null,
    target: null,
    isFirstSave: null,

	makeNewBubble: function(targetElement, bubbleData, onActionCallback, bubbleMakingMode){

		var self = this;
		this.target = targetElement;



		// 제작 모드
		switch(bubbleMakingMode){
			case this.CONSTS.bubbleMakingMode.MM['first']:
			case this.CONSTS.bubbleMakingMode.MM['modify']:

				// 수정인가?아닌가?
				this.isFirstSave = (bubbleMakingMode == this.CONSTS.bubbleMakingMode.MM['first']) ? true : false;
							

				// making mode
				this.bubble = this.CONSTS.TEMPLATE;
				this.onSaveCallback = onActionCallback;

				$(this.target).popover({
			        html: true,
			        title: function() {
			        	if(!self.isFirstSave)
			        		return bubbleData.title;
			        	else
			        		return '수정하려면 클릭하세요';
			        },
			        content: function() {
			        	if(!self.isFirstSave)
			        		return bubbleData.description;
			        	else
			          		return '수정하려면 클릭하세요';
			        },
			        template: this.bubble,
			        placement: 'right',
			        trigger: 'manual'
			    });


		        $(this.target).popover('show');

		        // TODO: css는 별도의 css 파일로 빠져야함
				$("#edit.popover-title").css('color', 'rgb(0,0,0)');
				$("#edit.popover-content").css('color', 'rgb(0,0,0)');

				$("#edit.popover-title").click(function() {
					self.onTitleEdit();
				});

				$("#edit.popover-content").click(function() {
					self.onContentEdit();
				});

				$("#__goDumber__trigger__").change(function() {

					self.onTriggerChanged();

				});

				$("#__goDumber__bubbleSaveBtn__").click(function() {
					self.onSave(targetElement);
				});

				$("#__goDumber__bubbleCancleBtn__").click(function() {
					self.onCancle(targetElement);
				});
			break;

			case this.CONSTS.bubbleMakingMode.UM[this.CONSTS.triggers['next']]:
			case this.CONSTS.bubbleMakingMode.UM[this.CONSTS.triggers['click']]:

				// 플레이 모드(User Mode)
				// throw 'Not implemented yet';

				// 액션이 일어난 이후의 콜백을 저장
				this.onActionCallback = onActionCallback;

				// 가져온 정보를 기반으로 스피치 버블 엘레멘트(div) 만들기
				this.bubble = this.CONSTS.TEMPLATE;

				// append!
				$(this.target).popover({
			        html: true,
			        title: function() {
			        		return bubbleData.title;
			        },
			        content: function() {
			        		return bubbleData.description;
			        },
			        template: this.bubble,
			        placement: 'right',
			        trigger: 'manual'
			    });

		        $(this.target).popover('show');

		        // TODO: css는 별도의 css 파일로 빠져야함
				$("#edit.popover-title").css('color', 'rgb(0,0,0)');
				$("#edit.popover-content").css('color', 'rgb(0,0,0)');

				// 템플릿에서 공통으로 필요없는 객체 제거
				$("#__goDumber__trigger__").remove();
				$("#__goDumber__bubbleSaveBtn__").remove();

				// click인경우 
				if(bubbleMakingMode == this.CONSTS.bubbleMakingMode.UM[this.CONSTS.triggers['click']]){

					// next 버튼 제거
					$("#__goDumber__bubbleCancleBtn__").remove();

					// // 해당 target Element에 onClick 이벤트를 걸어주어야함. 단 기존에 onClick 이벤트가 있을 수 있기 때문에 백업을 떠놓어야함.
					// var originalClickEvt = $(this.target).attr('onclick'); //targetElement.onclick;

					// $(this.target).removeAttr('onclick');
					// $(this.target).unbind("click");

					// // onClick이 발생하였을 때 다음으로 넘어가게끔!!
					// $(this.target).bind("click", function() {

					// 	self.onActionCallback();
						
					// 	// 팝업 닫기
					// 	$(this).popover('hide');
					// 	$('#__goDumber__popover__').destroy();

					// 	// resotre click event
					// 	$(this).unbind("click");
					// 	$(this).bind("click", eval(originalClickEvt));
					// 	// this.click(function() {
					// 	// 	eval(originalClickEvt);
					// 	// });


					// });

				

				}else if(bubbleMakingMode == this.CONSTS.bubbleMakingMode.UM[this.CONSTS.triggers['next']]){
					
					// next인 경우

					// 기존의 cancle 버튼을 next(다음으로)버튼으로 변경
					$("#__goDumber__bubbleCancleBtn__inner__icon").removeClass('fa-times');
					$("#__goDumber__bubbleCancleBtn__inner__icon").addClass('fa-arrow-circle-right');
					$("#__goDumber__bubbleCancleBtn__inner__text").text('다음으로');
					

					// next 버튼 이벤트 등록
					$("#__goDumber__bubbleCancleBtn__").click(function() {
						self.onActionCallback();

						// 팝업 닫기
						$(self.target).popover('hide');
						$('#__goDumber__popover__').destroy();
					});



				}

				break;

			default:
				throw "undefined speech bubble mode!:" + bubbleMakingMode;
				break;


		}

	},

    onTitleEdit: function() {
        $('#bubble #title .edit').summernote({
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
      	$('#bubble #content .edit').summernote({
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

    	var title = $('#bubble #title .edit').code();
    	var content = $('#bubble #content .edit').code();
    	this.onTriggerChanged();

    	// 넘겨줄 실 bubble 객체를 생성한다.
    	var bubbleInfo = Object.create(this.CONSTS.bubbleInfo);
    	bubbleInfo.title = title;
    	bubbleInfo.description = content;
    	bubbleInfo.dompath = this.util.getAbsoluteElementPath(targetElement);
    	bubbleInfo.trigger = this.CONSTS.triggers[this.selectedTrigger];

    	this.onSaveCallback(this.isFirstSave, bubbleInfo);	// (isFirstSave, bubbleInfo)

    	$(targetElement).popover('hide');

    	this.bubble = null;
    },

    onCancle: function(targetElement) {

    	if(targetElement == null){

    		// target이 null이면 외부에서 강제 이벤트로 죽이는거임.
    		targetElement = this.target;
    	}

    	this.parentObj.toggleSwitchOnOff();

    	$(targetElement).popover('hide');
    	$('#__goDumber__popover__').destroy();

    	this.bubble = null;
    },

    onTriggerChanged: function() {

		var str = "";

		// 추후에 트리거도 다중선택 가능할 수 있으니..
		$("#__goDumber__trigger__ option:selected").each(function() {


			str += $(this).text();

		});

		this.selectedTrigger = str;

		// 트리거가 변경되었음을 상태바에도 알려주어야함.
		this.parentObj.onNewBubbleAddedCallback(false, this.selectedTrigger);
    }
}