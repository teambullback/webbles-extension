/*===========================================================================
	Bubble Library
	included in goDumber Project, Team Bullback
	Writen by LyuGGang(me@lyuwonkyung.com) on 14.08.11. ~

	Required Libraries (Dependencies):
	- Google Chrome Extension API (http://developer.chrome.com/)
	- jQuery (http://jquery.com/)
	- Bootstrap (http://getbootstrap.com/)
	- Summernote (http://hackerwins.github.io/summernote/)
	- Font Awesome (http://fortawesome.github.io/Font-Awesome/)
	- jQuery: Smooth Scroll Plugin (https://github.com/kswedberg/jquery-smooth-scroll/)

	Structure:
	- MM Class: Making Mode
	- UM Class: User Mode
	- generalUtil Class: General Utilities
	- speechBubble Class: Speech Bubble Frame Object

	Outer Templates:
	- plusBtn.html
	- speechBubble.html

	Known Bugs: -

	TODOs: -

===========================================================================*/

/*===========================================================================
// MM(Making Mode) Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function MM() {

	var self = this;

	// get static pages
	$.ajax({
		url: chrome.extension.getURL('static/pages/plusBtn.html'),
		success: function(data) {


			self.CONSTS.PLUS_BUTTON_DIV = data;


			// freeze Constants
			Object.freeze(self.CONSTS);
		},
		fail: function() {
			throw "** COULD'T GET TEMPLATE FILE!";
		}
	});



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
		PLUS_BUTTON_DIV: ""
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
	isMouseOnStatusBar: false,
	originStyle: null,
	bubbleIcon: null,

	/*-----------------------------------------------------------------------
	// methods
	-----------------------------------------------------------------------*/

	// public
	toggleMode: function(doc, onNewBubbleAdded, onBubbleSaved) {

		var self = this;

		this.doc = doc;

		console.log('#################################', this.doc);

		this.everyElements = this.doc.getElementsByTagName("*"); //$("*"); //this.doc.getElementsByTagName("*");
		this.originElementstyle = new Array(this.everyElements.length);
		this.onNewBubbleAddedCallback = onNewBubbleAdded; // function(isNewAdded, triggerType)
		this.onBubbleSavedCallback = onBubbleSaved; // function(bubble)

		this.toggleSwitch = true;



		// 기존의 쉐도우 스타일이 적용되어 있을 경우를 대비하여
		// 미리 저장해둠!
		for (var i = 0; i < this.everyElements.length; i++) {

			this.originElementstyle[i] = {
				webkitBoxShadow: this.everyElements[i].style.webkitBoxShadow //$(this.everyElements[i]).css('box-shadow')
			};



		}


		// 보물 숨겨놓기~~
		this.$bubbleIcon = $("<img class='goDumber__PLUSBUTTON__IMG__' src='' style='z-index:2147482000;position:absolute;display:block;cursor:pointer;'>");
		$(this.$bubbleIcon).attr('src', chrome.extension.getURL('static/img/plus.png'));
		$("body").append(this.$bubbleIcon);
		$(this.$bubbleIcon).hide();

		// get rid of mouse move evt
		// $(this.doc).off('mousemove');

		// set mouse move event handler..
		$(this.doc).on('mousemove', function(event) {

			if (!self.toggleSwitch)
				return;

			for (var i = 0; i < self.everyElements.length; i++) {

				// 전체 문서를 가리키거나 혹은 '+' 버튼을 가리킬 때에는 무시함
				if (self.everyElements[i] == $(self.doc) || $(event.target).attr('class') == "goDumber__PLUSBUTTON__" || $(event.target).attr('class') == "goDumber__PLUSBUTTON__IMG__")
					continue;



				if (self.everyElements[i] == event.target) {

					// status bar 객체는 무시함.
					$(event.target).first().parents().not('html').each(function() {
						if ($(this).hasClass('___tbb___')) {
							// console.log('mouse is on the status bar!');	// for debug
							self.isMouseOnStatusBar = true;
							return;
						}
					});

					if (self.isMouseOnStatusBar) {
						self.isMouseOnStatusBar = false;
						return;
					}

					// set shadow
					self.everyElements[i].style.webkitBoxShadow = "inset 0 0 " + self.CONSTS.SHADOW_SIZE + "px " + self.CONSTS.SHADOW_COLOR;
					//$(self.everyElements[i]).css('box-shadow', "inset 0 0 " + self.CONSTS.SHADOW_SIZE + "px " + self.CONSTS.SHADOW_COLOR);

					// '+' 버튼 추가
					if ($(self.everyElements[i]).has(".goDumber__PLUSBUTTON__").length == 0) {

						self.nowOnFocusedElementIdx = i;

						// 실제로 보여주는것임.
						$(self.$bubbleIcon).show();

						var offset = $(self.everyElements[i]).offset();
						var width = $(self.everyElements[i]).width();
						var height = $(self.everyElements[i]).height();
						$(self.$bubbleIcon).css("top", offset.top + height - 30);
						$(self.$bubbleIcon).css("left", offset.left + width - 30);


						$(self.$bubbleIcon).off('click');

						$(self.$bubbleIcon).on('click', function() {
							self.toggleSwitchOnOff();
							self.evtPlusButtonClicked(self.everyElements[self.nowOnFocusedElementIdx]);

						});
					}
				} else {

					// get rid of shadow
					self.everyElements[i].style.webkitBoxShadow = 'none'; //self.originElementstyle[i].webkitBoxShadow;
				}

			}
		});


	},

	toggleSwitchOnOff: function() {

		this.toggleSwitch = !this.toggleSwitch;
	},

	// 제작모드에서 특정 스피치 버블로 쩜프시킨다.
	setSpeechBubbleOnTarget: function(bubbleInfo) {

		// 제일 먼저 현재 제작모드가 맞는지 validate (throw Exception)

		// 이미 떠있는 버블이 있는지 확인
		if (this.nowShowingBubble != null) {

			if (this.nowShowingBubble.bubble != null) {
				// 떠있으면 내리기
				this.nowShowingBubble.onCancle(null);
			}
		}

		this.toggleSwitchOnOff();

		// 가져온 bubbleInfo를 기준으로 해당 Target element 찾아서 띄워줌.
		// Target Element 가져오기(jQuery Selector)
		var targetElement = this.util.getSpecificElementWithPathObj(bubbleInfo);

		// bubbleInfo를 실제 bubble로 제작
		this.nowShowingBubble = new speechBubble(this);

		// 띄우고 토글스위치 끄기
		this.nowShowingBubble.makeNewBubble(targetElement, bubbleInfo, this.onBubbleSavedCallback, this.nowShowingBubble.CONSTS.bubbleMakingMode.MM['modify']);
	},

	// private
	evtPlusButtonClicked: function(targetElement) {

		var self = this;

		// dim!
		this.util.dimScreenExceptTarget(targetElement, null);

		// get rid of plus btn!
		$(this.$bubbleIcon).hide();

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
function UM() {


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
	setSpeechBubbleOnTarget: function(bubbleInfo, onActionCallback) {

		var self = this;

		// (new speechBubble(this)).makeNewBubble(null, bubbleInfo, onActionCallback);	// 이렇게도 되긴 하는구나.. 그래도 어디서 메모리 가져갈지도 모르니까 확실해지면 쓰자.
		this.nowShowingBubble = new speechBubble(this);


		// target element 구하기
		var targetElement = this.util.getSpecificElementWithPathObj(bubbleInfo);

		// TODO: target element로 smooooooooooooth 하게 scrolling
		// http://balupton.github.io/jquery-scrollto/
		$(targetElement).ScrollTo({
			callback: function() {
				// 트리거 종류에 맞게 다르게 처리해야(이벤트를 다르게 주어야)함.
				switch (bubbleInfo.trigger) {

					case "N":
						self.nowShowingBubble.makeNewBubble(targetElement, bubbleInfo, onActionCallback, self.nowShowingBubble.CONSTS.bubbleMakingMode.UM[bubbleInfo.trigger]); // onCationCallback();
						break;

					case "C":
						self.nowShowingBubble.makeNewBubble(targetElement, bubbleInfo, onActionCallback, self.nowShowingBubble.CONSTS.bubbleMakingMode.UM[bubbleInfo.trigger]);
						break;

					default:
						throw '** undefined bubble trigger!: ' + bubbleInfo.trigger;
						break;

				}
			}
		});
	}
};



/*===========================================================================
// General Util Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function generalUtil() {


};

/*---------------------------------------------------------------------------
// prototype
---------------------------------------------------------------------------*/
generalUtil.prototype = {

	scrollToTargetElementOnCenter: function(win, targetElement) {

		// from http://stackoverflow.com/questions/8922107/javascript-scrollintoview-middle-alignment

		function documentOffsetTop(el) {

			return el.offsetTop + (el.offsetParent ? documentOffsetTop(el.offsetParent) : 0);
		}

		var top = documentOffsetTop(targetElement[0]) - (win.innerHeight / 2);
		win.scrollTo(0, top);

	},

	dimScreenExceptTarget: function(targetElement, evtType) {

		// 타겟과 스피치버블과 우리것들빼고 다 어둡게!
		// 어짜피 우리것들은 z-index가 쩌니까........

		// 랲핑을 포기하고 바람개비를 도입한다! // 140912 by LyuGGang
		// 나중에 쓸 위치 및 크기 변수들
		var targetElementOffset = {
			location: $(targetElement).offset(),
			size: {
				width: $(targetElement).width(),
				height: $(targetElement).height()
			}
		};
      
        // location 을 padding 을 포함한 값으로 재정의
        // 원래 값으로 테스트 하고 싶을 때는 여기서부터
        targetElementOffset['size'] = {
            width: $(targetElement).innerWidth(),
            height: $(targetElement).innerHeight()
        };
        // 여기까지의 부분을 주석 처리하세요.

		var documentSize = {
			width: $(document).width(),
			height: $(document).height()
		};

		// 하나짜리 dimElement는 더 이상 사용하지 않습니다. // 140911 by LyuGGang
		// var dimElement = "<div id='__goDumber__shadow__' style='background-image:url(" + chrome.extension.getURL('static/img/shadow1x1.png') + "); position:absolute; left:0; top:0; width:100%; z-index:2147481000;'></div>";
		var dimElements = {
			top: "<div id='__goDumber__shadow__top' class='___tbb___ __goDumber__shadow__' style='background-image:url(" + chrome.extension.getURL('static/img/shadow1x1.png') + "); position:absolute; top:0; z-index:2147481000;'></div>",
			bottom: "<div id='__goDumber__shadow__bottom' class='___tbb___ __goDumber__shadow__' style='background-image:url(" + chrome.extension.getURL('static/img/shadow1x1.png') + "); position:absolute; z-index:2147481000;'></div>",
			left: "<div id='__goDumber__shadow__left' class='___tbb___ __goDumber__shadow__' style='background-image:url(" + chrome.extension.getURL('static/img/shadow1x1.png') + "); position:absolute; top:0; left:0; z-index:2147481000;'></div>",
			right: "<div id='__goDumber__shadow__right' class='___tbb___ __goDumber__shadow__' style='background-image:url(" + chrome.extension.getURL('static/img/shadow1x1.png') + "); position:absolute; top:0; z-index:2147481000;'></div>"
		};

		var transparentElement = "<div id='__goDumber__shadow__transparent' class='___tbb___ __goDumber__shadow__' style='position:absolute; z-index:2147481001;'></div>";
      
		// dimElements Init.
		$.each(dimElements, function(index, value) {
			$("body").append(value);
		});
        
        $("#__goDumber__shadow__top").css("top", 0);
		$("#__goDumber__shadow__top").css("left", targetElementOffset.location.left);
		$("#__goDumber__shadow__top").css("height", targetElementOffset.location.top);
		$("#__goDumber__shadow__top").css("width", targetElementOffset.size.width);

		$("#__goDumber__shadow__bottom").css("top", targetElementOffset.location.top + targetElementOffset.size.height);
		$("#__goDumber__shadow__bottom").css("left", targetElementOffset.location.left);
		$("#__goDumber__shadow__bottom").css("height", documentSize.height - (targetElementOffset.location.top + targetElementOffset.size.height));
		$("#__goDumber__shadow__bottom").css("width", targetElementOffset.size.width);

		$("#__goDumber__shadow__left").css("width", targetElementOffset.location.left);
		$("#__goDumber__shadow__left").css("height", documentSize.height);

		$("#__goDumber__shadow__right").css("left", targetElementOffset.location.left + targetElementOffset.size.width);
		$("#__goDumber__shadow__right").css("width", documentSize.width - (targetElementOffset.location.left + targetElementOffset.size.width));
		$("#__goDumber__shadow__right").css("height", documentSize.height);


		// 만약 제작모드(11, 12, null)이거나, 사용자모드 중 넥스트 이벤트이면(21) 투명 레이어를 사용하여 강조는 되지만 실제로 클릭은 되지 않도록 처리한다.
		// 원래는 enum 값인데.. speechBubble에 정의되어 있어서.. 가져다쓰기 귀찮으니.. ㅈㅅ
		switch (evtType) {
			case 11:
			case 12:
			case 21:
			case null:
                $("body").append(transparentElement);
				$("#__goDumber__shadow__transparent").css("top", targetElementOffset.location.top);
				$("#__goDumber__shadow__transparent").css("left", targetElementOffset.location.left);
				$("#__goDumber__shadow__transparent").css("width", targetElementOffset.size.width);
				$("#__goDumber__shadow__transparent").css("height", targetElementOffset.size.height);
				break;
			case 22:
				break;
			default:
				throw '** Undefined Event(Trigger) Type!!: ' + evtType;
				break;

		}


	},

	restoreDimScreen: function(targetElement) {

		// 원복하기
		$('.__goDumber__shadow__').remove();
	},


	getAbsoluteElementPath: function(targetElement) {

		var self = this;

		if (typeof(targetElement) == "undefined") {
			targetElement = true;
		}

		var Elements = new Array();
		var element = $(targetElement).first();

		element.parents().not('html').each(function() {

			// 현재 추가된 태그가 처음이 아니라면
			if (Elements.length > 0) {

				if (Elements.length - 1 < 0) {
					throw "** Elements.length-1 cannot be less than 0"; // throw exception!
				}

				//전에 추가된(자식)의 갯수를 구해서 순서를 추가해주어야함.
				var childElement = Elements[Elements.length - 1];

				var i = 1;

				$(this).find(childElement.name).each(function() {

					if ($(this).hasClass("__goDumber__specificElement__")) {

						Elements[Elements.length - 1].order = i;
						$(this).removeClass("__goDumber__specificElement__");
						return;

					} else {

						i++;
					}

				});

			}

			// 이름, 갯수 객체를 임시로 만들어 배열에 추가한다.
			Elements.push({
				Element: this, //$(this).html(),
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

		$(Elements[Elements.length - 2].Element).find(Elements[Elements.length - 1].name).each(function() {

			if ($(this).hasClass("__goDumber__specificElement__")) {

				Elements[Elements.length - 1].order = order;
				$(this).removeClass("__goDumber__specificElement__");

			} else {

				order++;
			}

		});

		$("body").removeClass("__goDumber__specificElement__");
		return Elements;

	},

	getStringForElement: function(element) {
		var string = element.tagName.toLowerCase();

		if (element.id) {
			string += "#" + element.id;
		}
		if (element.className) {
			string += "." + element.className.replace(/ /g, '.');
		}

		return string;
	},

	// path object를 이용하여 해당 객체를 찾아서 리턴해줌.
	getSpecificElementWithPathObj: function(bubInfo) {

		var ElementPathObj = bubInfo.dompath;

		// 1차적으로 찾아봄: 걍 순차적으로 객체명, 순서를 가지고 내려가는 방식.
		var curObj = $(ElementPathObj[0].name);

		for (var i = 1; i < ElementPathObj.length; i++) {


			curObj = $($(curObj.find(ElementPathObj[i].name))[ElementPathObj[i].order - 1]);

		}

		if (curObj != undefined && curObj != null && curObj.length != 0) {
			// 찾았다!
			return curObj;
		}

		// 그래도 못찾으면.. 두번째 알고리즘: 
		// 끝에서부터 올라오면서 ID를 찾고, 거기서 다시 순서로만 찾기.
		curObj = null;

		for (var i = ElementPathObj.length - 1; i >= 0; i--) {

			if (ElementPathObj[i].name.indexOf('#') > -1) {

				// 해당 id를 가진 객체가 있는가?
				if ($(ElementPathObj[i]).length != 0) {

					// 있으면 거기서부터 순서로만 찾아내려가기
					curObj = $(ElementPathObj[i].name);

					// 혹시나 자식객체가 없진 않겠지?
					if (curObj.children().length <= 0) {
						curObj = null;
						break;
					}

					for (var j = i + 1; j < ElementPathObj.length; j++) {

						// selector string에서 오직 element type만 구하기
						var onlyOrderSelector = ElementPathObj[j].name;

						if (onlyOrderSelector.indexOf('.') > -1)
							onlyOrderSelector = onlyOrderSelector.slice(0, onlyOrderSelector.indexOf('.'));

						if (onlyOrderSelector.indexOf('#') > -1)
							onlyOrderSelector = onlyOrderSelector.slice(0, onlyOrderSelector.indexOf('#'));

						// get!
						curObj = $($(curObj.find(onlyOrderSelector))[ElementPathObj[j].order - 1]);
					}


				} else {

					// 없으면 null 넣고 break
					curObj = null;
					break;
				}

			} else {
				continue;
			}

		}


		if (curObj != undefined && curObj != null && curObj.length != 0) {

			// 찾았다!
			return curObj;
		}



		// 만약 못찾으면.. 세번째 알고리즘: innerHTML을 가지고 비교하는 방식.
		// 전체 Element를 돌아라.
		var everyEl = $("body").find("*").filter(':visible');
		// for (var i = 0; i < everyEl.length; i++) {
		for (var i = everyEl.length; i >= 0; i--) {

			if ($(everyEl[i]).html() == bubInfo.etc_val.innerHTML) {

				curObj = $(everyEl[i]);
				break;
			}
		}



		if (curObj != undefined && curObj != null && curObj.length != 0) {
			// 찾았다!
			return curObj;
		}

		// 끝까지 못찾으면 예외
		throw '** Could not find specific element with path obj!';

	},

	preventALinks: function() {

		$("a").click(function(event) {

			event.preventDefault();
		});
	},

	restoreALinks: function() {

		$("a").click(function() {

			return true;
		});

	},

	// 해당 DOM Element의 모든 CSS(Style)을 가져온다.
	// from http://stackoverflow.com/questions/754607/can-jquery-get-all-css-styles-associated-with-an-element
	// usage: var style = getEveryStyle($("#elementToGetAllCSS"));
	// 		  $("#elementToPutStyleInto").css(style);
	getEveryStyle: function(a) {
		var sheets = document.styleSheets,
			o = {};
		for (var i in sheets) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for (var r in rules) {
				if (a.is(rules[r].selectorText)) {
					o = $.extend(o, this.css2json(rules[r].style), this.css2json(a.attr('style')));
				}
			}
		}
		return o;
	},

	css2json: function(css) {
		var s = {};
		if (!css) return s;
		if (css instanceof CSSStyleDeclaration) {
			for (var i in css) {
				if ((css[i]).toLowerCase) {
					s[(css[i]).toLowerCase()] = (css[css[i]]);
				}
			}
		} else if (typeof css == "string") {
			css = css.split("; ");
			for (var i in css) {
				var l = css[i].split(": ");
				s[l[0].toLowerCase()] = (l[1]);
			}
		}
		return s;
	}


}


/*===========================================================================
// Speech Bubble Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/
function speechBubble(parentObj) {

	var self = this;



	// freeze Constants
	Object.freeze(self.CONSTS);


	self.parentObj = parentObj;


	self.util = new generalUtil();


};

/*---------------------------------------------------------------------------
// prototype
---------------------------------------------------------------------------*/
speechBubble.prototype = {

	CONSTS: {
		TEMPLATE: "",

		bubbleInfo: {
			"id": null,
			"title": null,
			"description": null,
			"dompath": null,
			"trigger": null,
			"is_init_document": true,
			"prev": null,
			"document": null,
			"etc_val": null,
		},

		triggers: {

			'next': "N",
			'click': "C"
		},

		bubbleMakingMode: {

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
	bubbleNowOnShowing: true,
	originTargetStyle: null,

	makeNewBubble: function(targetElement, bubbleData, onActionCallback, bubbleMakingMode) {

		var self = this;
		this.target = targetElement;



		// 제작 모드
		switch (bubbleMakingMode) {
			case this.CONSTS.bubbleMakingMode.MM['first']:
			case this.CONSTS.bubbleMakingMode.MM['modify']:

				// 수정인가?아닌가?
				this.isFirstSave = (bubbleMakingMode == this.CONSTS.bubbleMakingMode.MM['first']) ? true : false;


				// get static pages(template)
				$.ajax({
					url: chrome.extension.getURL('static/pages/speechBubble.html'),
					success: function(data) {

						self.bubble = data;
						self.onSaveCallback = onActionCallback;

						$(self.target).popover({
							html: true,
							title: function() {
								if (!self.isFirstSave)
									return bubbleData.title;
								else
									return '수정하려면 클릭하세요';
							},
							content: function() {
								if (!self.isFirstSave)
									return bubbleData.description;
								else
									return '수정하려면 클릭하세요';
							},
							template: self.bubble,
							placement: 'auto',
							trigger: 'manual',
							container: 'html'
						});


						$(self.target).popover('show');


						// TODO: css는 별도의 css 파일로 빠져야함
						//$("#edit.popover-title").css('color', 'rgb(0,0,0)'); 저는 하얀색이 좋더라요
						$("#edit.popover-content").css('color', 'rgb(0,0,0)');
						$("#__goDumber__popover__").css('z-index', '2147482000');

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


					},
					fail: function() {
						throw "** COULD'T GET TEMPLATE FILE!";
					}
				});



				break;

			case this.CONSTS.bubbleMakingMode.UM[this.CONSTS.triggers['next']]:
			case this.CONSTS.bubbleMakingMode.UM[this.CONSTS.triggers['click']]:

				// 플레이 모드(User Mode)
				// throw 'Not implemented yet';

				// get static pages(template)
				$.ajax({
					url: chrome.extension.getURL('static/pages/speechBubble.html'),
					success: function(data) {

						self.bubble = data;
						// 액션이 일어난 이후의 콜백을 저장
						self.onActionCallback = onActionCallback;

						// element를 제외한 화면 어둡게.
						self.util.dimScreenExceptTarget(self.target, bubbleMakingMode);

						// 가져온 정보를 기반으로 스피치 버블 엘레멘트(div) 만들기
						// this.bubble = this.CONSTS.TEMPLATE;

						// append!
						$(self.target).popover({
							html: true,
							title: function() {
								return bubbleData.title;
							},
							content: function() {
								return bubbleData.description;
							},
							template: self.bubble,
							placement: 'auto',
							trigger: 'manual',
							container: 'html'
						});

						$(self.target).popover('show');

						// TODO: css는 별도의 css 파일로 빠져야함
						// $("#edit.popover-title").css('color', 'rgb(0,0,0)');
						$("#edit.popover-content").css('color', 'rgb(0,0,0)');

						// 템플릿에서 공통으로 필요없는 객체 제거
						$("#__goDumber__trigger__").remove();
						$("#__goDumber__bubbleSaveBtn__").remove();


						// click인경우 
						if (bubbleMakingMode == self.CONSTS.bubbleMakingMode.UM[self.CONSTS.triggers['click']]) {

							// next 버튼 제거
							$("#__goDumber__bubbleCancleBtn__").remove();

							// 해당 target Element에 onClick 이벤트를 걸어주어야함. 단 기존에 onClick 이벤트가 있을 수 있기 때문에 백업을 떠놓어야함.
							var originalClickEvt = $(self.target).attr('onclick'); //targetElement.onclick;

							// // onClick이 발생하였을 때 다음으로 넘어가게끔!!
							$(self.target).click(function() {

								// restore dim
								self.util.restoreDimScreen(self.target, self.originTargetStyle);

								if (self.bubbleNowOnShowing == true) {
									self.onActionCallback();
									self.bubbleNowOnShowing = false;
								}

								// eval(originalClickEvt);

								// hide
								$(self.target).popover('hide');
								$('#__goDumber__popover__').popover('destroy');

							});

						} else if (bubbleMakingMode == self.CONSTS.bubbleMakingMode.UM[self.CONSTS.triggers['next']]) {

							// next인 경우

							// 기존의 cancle 버튼을 next(다음으로)버튼으로 변경
							$("#__goDumber__bubbleCancleBtn__inner__icon").removeClass('fa-times');
							$("#__goDumber__bubbleCancleBtn__inner__icon").addClass('fa-arrow-circle-right');
							$("#__goDumber__bubbleCancleBtn__inner__text").text('다음으로');


							// next 버튼 이벤트 등록
							$("#__goDumber__bubbleCancleBtn__").click(function() {

								$(self.target).on('hidden.bs.popover', function() {

									// restore dim
									self.util.restoreDimScreen(self.target, self.originTargetStyle);
									self.onActionCallback();

								});

								// 팝업 닫기
								$(self.target).popover('hide');
								$('#__goDumber__popover__').popover('destroy');



							});



						}
					}
				});

				break;

			default:
				throw "** undefined speech bubble mode!: " + bubbleMakingMode;
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


		var self = this;

		var title = $('#bubble #title .edit').code();
		var content = $('#bubble #content .edit').code();
		this.onTriggerChanged();

		// wrapping된 객체를 원복시켜준다.
		// $(targetElement).unwrap();	

		var tempAbsolutePath = this.util.getAbsoluteElementPath(targetElement);

		// 넘겨줄 실 bubble 객체를 생성한다.
		var bubbleInfo = Object.create(this.CONSTS.bubbleInfo);
		bubbleInfo.title = title;
		bubbleInfo.description = content;
		bubbleInfo.dompath = tempAbsolutePath; // this.util.getAbsoluteElementPath(targetElement);
		bubbleInfo.trigger = this.CONSTS.triggers[this.selectedTrigger];
		// target element의 innerHTML을 담아줌 - 140906 LyuGGang
		bubbleInfo.etc_val = {
			"innerHTML": $(targetElement).html()
		};

		this.onSaveCallback(this.isFirstSave, bubbleInfo); // (isFirstSave, bubbleInfo)

		// 실제 popover가 비동기로 제거되므로 이벤트를 등록한다.
		$(targetElement).on('hidden.bs.popover', function() {


			this.bubble = null;

			// 클릭 이벤트인 경우에는 이벤트 저장이 이루어진 이후에도 계속해서 해당 엘리멘트가 강조되어있도록 해야함.
			// dim toggle
			if (bubbleInfo.trigger == self.CONSTS.triggers['click']) {
                /* 풀리퀘 #76 바람개비 업데이트로 인해서 아래의 코드는 필요가 없어짐.
				// re-wrapping.
				$(targetElement).wrap("<div id='__goDumber__forShadowing__parentDIV__'></div>");

				$("#__goDumber__forShadowing__parentDIV__").css('position', 'relative');
				$("#__goDumber__forShadowing__parentDIV__").css('z-index', '2147481500');

				$("#__goDumber__forShadowing__parentDIV__").css('background-color', '#FFF');

				$("#__goDumber__forShadowing__parentDIV__").css('padding', '0');
				$("#__goDumber__forShadowing__parentDIV__").css('margin', '0');
				$("#__goDumber__forShadowing__parentDIV__").css('border', '0');
                */

				$('#__goDumber__popover__').popover('destroy');
				$(targetElement).popover('destroy');
				$(this).popover('destroy');

				// 말풍선띄워주기
				$(targetElement).popover({
					html: true,
					title: "",
					content: "Click 이벤트가 잘 저장되었습니다. <br />해당 아이템을 다시 눌러서 다음 스텝으로 진행해주세요!",
					template: "<div id='__goDumber__alert__popover' class='___tbb___ ___tbb__tb___ ___tbb__fa___ ___tbb__sn___ ___tbb__ee___ popover container-fluid' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content'></div></div>",
					placement: 'auto',
					trigger: 'manual',
					container: 'html'


				});
                
                $("#__goDumber__shadow__transparent").remove();
				$(targetElement).popover('show');

				// 해당 타겟 element에 온클릭 이벤트를 걸어서
				// 쉐도우도 죽이고, 플러스 버튼도 날려준다.
				$(targetElement).click(function() {

					$(this.$bubbleIcon).hide();
					self.parentObj.toggleSwitchOnOff();
					self.util.restoreDimScreen(targetElement);

					$(targetElement).popover('hide');
					$(targetElement).popover('destroy');

				});



			} else {
				self.parentObj.toggleSwitchOnOff();
				self.util.restoreDimScreen(targetElement);
			}
		});

		$(targetElement).popover('hide');

	},

	onCancle: function(targetElement) {

		if (targetElement == null) {

			// target이 null이면 외부에서 강제 이벤트로 죽이는거임.
			targetElement = this.target;
		}



		this.parentObj.toggleSwitchOnOff();

		// dim toggle
		this.util.restoreDimScreen(targetElement);

		$(targetElement).popover('hide');
		$('#__goDumber__popover__').popover('destroy');

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