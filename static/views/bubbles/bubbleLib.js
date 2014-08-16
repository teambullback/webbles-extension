/*===========================================================================
	Bubble Library
	included in goDumber Project, Team Bullback
	Writen by LyuGGang on 14.08.11. ~
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
		        			self.evtPlusButtonClicked(self.everyDOMs[self.nowOnFocusedDOMIdx]);
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
	evtPlusButtonClicked: function(targetDOM){

		var tempDOM = this.util.getAbsoluteDOMPath(targetDOM);	// for debug

		var getDOM = this.util.getSpecificDOMWithPathObj(tempDOM); // for debug

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
		//return $(targetDOM).getDomPath();


		// DIY!
		var self = this;

		if (typeof(targetDOM) == "undefined") {
            targetDOM = true;		
        }

		var DOMs = new Array();
		var element = $(targetDOM).first();
		//var i = 1;	// for debug

		element.parents().not('html').each(function() {

		
		 	//console.log(String(i++) + ":" + self.getStringForElement(this)); // for debug


		 	// 현재 추가된 태그가 처음이 아니라면
		 	if(DOMs.length > 0){

		 		//전에 추가된(자식)의 갯수를 구해서 순서를 추가해주어야함.
		 		var childDOM = DOMs[DOMs.length-1];

		 		var i = 1;

		 		$(this).find(childDOM.name).each(function() {

		 			if($(this).hasClass("__goDumber__specificDOM__")){

		 				DOMs[DOMs.length-1].order = i;
		 				$(this).removeClass("__goDumber__specificDOM__");
		 				//break;	// jQuery each는 break가 안먹히나..

		 			}else{

		 				i++;
		 			}

		 		});

        	}

		 	// 이름, 갯수 객체를 임시로 만들어 배열에 추가한다.
        	DOMs.push({

        		DOM: this,
		 		name: self.getStringForElement(this),
		 		order: 1
		 	});
        	
        	//console.log(DOMs.length);

        	// 추후에 카운팅을 위해 임시로 클래스를 추가한다.
        	$(this).addClass("__goDumber__specificDOM__");


       
        });

        DOMs.reverse();

		//console.log(String(i) + "(last):" + this.getStringForElement(element[0])); // for debug
        


		// 마지막 DOM은 별개로 처리한다.
        
        DOMs.push({
        	DOM: element[0],
        	name: this.getStringForElement(element[0]),
        	order: 1
        });


		$(element[0]).addClass("__goDumber__specificDOM__");

        var order = 1;
       
        $(DOMs[DOMs.length-2].DOM).find(DOMs[DOMs.length-1].name).each(function() {


			if($(this).hasClass("__goDumber__specificDOM__")){

	 				DOMs[DOMs.length-1].order = order;
	 				$(this).removeClass("__goDumber__specificDOM__");

	 			}else{

	 				order++;
	 			}

        });

        //return targetDOM ? DOMs.join(" > ") : DOMs;

        $("body").removeClass("__goDumber__specificDOM__");
        return DOMs;

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

	getSpecificDOMWithPathObj: function(DOMPathObj){


		var curObj = $(DOMPathObj[0].name);

		for(var i = 1; i<DOMPathObj.length; i++){


			curObj = $($(curObj.find(DOMPathObj[i].name))[DOMPathObj[i].order-1]);			

		}

		return curObj;


	},

	preventALink: function() {

		$("a").click(function(event) {
  			event.preventDefault();
  		});
	}

	

	

}


/*===========================================================================
// Speech Bubble Class
===========================================================================*/
/*---------------------------------------------------------------------------
// constructor
---------------------------------------------------------------------------*/


function speechBubble(){

	

};
