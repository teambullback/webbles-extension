
//빌드모드 statusbar 

function status_build(){
 	this.token_load = new status_server();
};

status_build.prototype = {

	//vars
	bubblecount : 1,//버블의 개수 
	pagecount : 1,//페이지의 개수 

	dragTargetId : null,
	bubble_buffer : null,
	Current_bubble : null, //현재선택된 bubble

	dragoverflag : false,
	is_nextclick : true,
	is_clicked : false,
	is_save :false,
	is_first_bubble : true,

	page_width : 115, //page너비 

	tutorial_num : 1, //server에서 받아온 tutorial_num
	page_num : 1, //server에서 받아온 page_num
	bubble_num : 1, //server에서 받아온 bubble_num

	token_load : null, //token 객체 
	

	dum : null,

	//methods
	add_Statusbar : function(){
		var self = this;
		$('#leftScroll').css('display','block');
		$('#rightScroll').css('display','block');
	    $('#myStatus').css('display','block');
	    $('#controlbar').css('display','block');
	    
	   

	    //site/tutorial 만들기 
	    this.token_load.get_auth_token("admin", "admin");
		self.post_new_site('test title', 'test description');  //정보 넣어주기 사이트 정보 
	   
	    //원경이 togglemode 호출 
		  
	},

	createPageAsHtml : function(pagecount, page_width, flag){ 
		console.log('pagecount' + pagecount);
		if(flag){//진짜
			return [ 
				'<div id="pagebar' + pagecount +'"  style="float:left" >',
				'<div  id="pagebar_up' + pagecount + '" style="width: ' + page_width +'; height :20px;" align="center">Page' + this.pagecount + '</div>',
				'<div  id="pagebar_down' + pagecount + '"style="width: ' + page_width +'; height :30px; text-overflow:ellipsis;overflow:hidden;" align="center">' + document.location.href + '</div>',
				'</div>',
				'<div id="black_bar' + pagecount + '" style="float:left; width:5px; height:100%; background-color:black;" ></div>',
				'<div id="dummy_bar' + pagecount + '" style="float:left; width:10px; height:100%;" ></div>',
			].join('\n');   
		}
		else{//가짜
			return [ 
				'<div id="impagebar' + pagecount +'"  style="float:left" >',
				'<div  id="impagebar_up' + pagecount + '" style="width: ' + page_width +'; height :20px;" align="center">Page' + this.pagecount + '</div>',
				'<div  id="impagebar_down' + pagecount + '"style="width: ' + page_width +'; height :30px; text-overflow:ellipsis;overflow:hidden;" align="center">' + document.location.href + '</div>',
				'</div>',
				'<div id="imblack_bar' + pagecount + '" style="float:left; width:5px; height:100%; background-color:black;" ></div>',
				'<div id="imdummy_bar' + pagecount + '" style="float:left; width:10px; height:100%;" ></div>',
			].join('\n');   
		}
	},

	add_Document : function(){ 
		var self = this;
		// add page
	   	if(this.is_nextclick){ //Next 일때 
	   		// next를 클릭했을 때에는 이전의 Page를 삭제하고 새로운 Page를 생성한다.
	   		$("#black_bar" + this.page_num).remove();
	   		$("#dummy_bar" + this.page_num).remove();
	   		$("#pagebar" + this.page_num).remove();
	   	}
	   	else{ //click일때 
	   		// Click 일 때에는 새로운 페이지를 생성한다.
	   		this.pagecount ++;
	   		this.is_nextclick = true;
	   		this.is_clicked = true;
	   		this.page_width = 115;
	   	}  
		var pageCreator = self.createPageAsHtml(this.pagecount, this.page_width,false); //add page 
		this.page_width += 130;
	   	
	   
	    //add Bubble
	     var bubbleCreator = [
	     	//버블 
			'<div id="imbigbubble' +this.bubblecount+ '"style="float:left">',
				'<div  style="width: 80px; height :10px;"></div>',
				//'<div  id="m" style="float:left; border:5px solid black; width:70px;height:70px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 60px;" align = "center" >1</div>',
				'<div  id="immyBubble' + this.bubblecount + '" style="border:5px solid black; width:60px;height:60px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 50px;" align = "center"    draggable="true" tag="' + this.pagecount + '">'+ this.bubblecount +'</div>',
				'<div  style="width: 80px; height :10px;"></div>',
			'</div>',
			
			//이밴트 + 화살표 
			'<div id="imeventallow' + this.bubblecount + '"style="float:left;">',
				'<div id="immyEvent_button' + this.bubblecount + '" style = "width:50px; height:20px; background-size: 50px 20px; background-image: url(' + '../../img/next.png' + ');"></div>',
				'<div style = "width:50px; height:60px; background-size: 50px 60px; background-image: url(' + '../../img/arrow.png' + ');"></div>',
				'<div style = "width:50px; height:20px;"></div>',
			'</div>',
	    ].join('\n');
	    
	    $(pageCreator).appendTo('#myStatus_up');
	    $(bubbleCreator).appendTo('#myStatus_down');
		
		this.Current_bubble = document.getElementById('immyBubble' + this.bubblecount);

		this.is_save = false;
	},	

	select_Nextevent : function(){ //NEXT선택
		console.log(this.Current_bubble.id);
		console.log(this.is_save);
		var currentcount = this.Current_bubble.id.replace(/[^0-9]/g,'');
		if(this.is_save)
			$('#myEvent_button'+currentcount).css('background-image','url(' + '../../img/next.png' + ')');
		else
			$('#immyEvent_button'+currentcount).css('background-image','url(' + '../../img/next.png' + ')');
		this.is_nextclick = true;
	},
	select_Clickevent : function(){//CLICK선택
		console.log(this.Current_bubble.id);
		var currentcount =this.Current_bubble.id.replace(/[^0-9]/g,'');
		if(this.is_save)
			$('#myEvent_button'+currentcount).css('background-image','url(' + '../../img/click.png' + ')');
		else
			$('#immyEvent_button'+currentcount).css('background-image','url(' + '../../img/click.png' + ')');
		
		this.is_nextclick = false;
	},

	push_realid : function(){//실제값으로 변경 
		var self = this;
		if(this.is_nextclick){
			//page id 실제로 서버에 있는 id로 교체 
			$('#impagebar' +this.pagecount).attr('id','pagebar' + this.page_num);
			$('#impagebar_up' +this.pagecount).attr('id','pagebar_up' + this.page_num);
			$('#impagebar_down' +this.pagecount).attr('id','pagebar_down' + this.page_num);
			$('#imblack_bar' +this.pagecount).attr('id','black_bar' + this.page_num);
			$('#imdummy_bar' +this.pagecount).attr('id','dummy_bar' + this.page_num);
		}
		//bubble id 실제로 서버에 있는 id로 교체 
		$('#imbigbubble' +this.bubblecount).attr('id','bigbubble' + this.bubble_num);
		$('#immyBubble' +this.bubblecount).attr('tag',this.page_num);
		$('#immyBubble' +this.bubblecount).attr('id','myBubble' + this.bubble_num);
		$('#imeventallow' +this.bubblecount).attr('id','eventallow' + this.bubble_num);
		$('#immyEvent_button' +this.bubblecount).attr('id','myEvent_button' + this.bubble_num);
		
		
		 //드&드 설정 
		$('#myBubble' + this.bubble_num).bind('drag',function(){
			event.preventDefault();
		});
		$('#myBubble' + this.bubble_num).bind('drop',function(){
			self.dropped(event);
		});
		$('#myBubble' + this.bubble_num).bind('dragover',function(){
			self.dragovered(event);
		});
		this.Current_bubble = document.getElementById('myBubble' + this.bubble_num);

		//이벤트 넣기 
		$('#myBubble' + this.bubble_num).mousedown(function(){
    		self.Bubble_click(event);
    	});
    	$('#myBubble' + this.bubble_num).dblclick(function(){
    		self.Bubble_delete(event);
    	});

    	
	},

	success_on_save : function(){// 서버에 페이지 정보가 저장되었을 때 호출되는 callback 함수
		this.is_save = true;
	},

	on_save : function(){
		var self = this;
		//bubble원경이에게 받은거 넣어주기 
		//초기 page랑 초기 bubble 생성 
		if(this.is_first_bubble){
			self.post_new_page('test', 'test', document.location.href, true,this.tutorial_num, self.success_on_save); 
			this.is_first_bubble = false;
		}
		else{
			if(this.is_clicked){
				self.post_new_page('test', 'test', document.location.href, false,this.tutorial_num, self.success_on_save); 
				this.is_clicked=false;
			}
			else
			{
			 	if(this.is_nextclick){ 
			 		console.log('next');
			 		self.post_new_bubble('test', 'test',"DIV","N",false,this.bubble_num,this.page_num, self.success_on_save);
			 	}
			 	else{
			 		console.log('click');
			 		self.post_new_bubble('title', 'description',"DIV","C",false,this.bubble_num,this.page_num, self.success_on_save);
				}
			}
		}	
	},

	on_load : function(tutorial_num){
		console.log("load 기능은 구현되어 있지 않음");
		// tutorial_num 으로 서버에서 가져옴

		// 서버에서 성공적으로 정보를 가져왔고 만약 bubble 정보가 있다면,
		// is_first_bubble = false;
	},

	Bubble_click : function(e){ //버블 선택시 
		//저장안하고 선택하면 저장하라고 alert띄어주기 

		console.log('bubble_buffer' + this.bubble_buffer);
		if(this.bubble_buffer){ //이전 누른 bubble 되돌리기 
			$('#' + this.bubble_buffer).css('background-color','white');
		}

		this.Current_bubble= e.target;
		this.dragTargetId= this.Current_bubble.id;
		$('#' + this.dragTargetId).css('background-color','red'); //현재 bubble 색 바꾸기 
		this.bubble_buffer = this.dragTargetId;

		console.log('id ' + this.Current_bubble.id);
		console.log('id ' + this.bubble_buffer);
		
		//id값 비교하여 해당 페이지 수정할 수 있게 띄어주기 ! 
		//원경이 호출 
		//patch로 변
	},

	Bubble_delete : function(e){//더블클릭 삭제 
		var self = this;
		alert("delete bubble " +e.target.id );
		//page remove
		var tag = $('#' + e.target.id).attr('tag');
		var string_current_width = $('#pagebar_up' + tag).css('width');
		console.log(tag);
		console.log(string_current_width);

		var current_width = string_current_width.replace(/[^0-9]/g,'');
		if(current_width <130){
			$("#black_bar" + tag).remove();
	   		$("#dummy_bar" + tag).remove();
	   		$("#pagebar" + tag).remove();
		}
		else{
			$('#pagebar_up' + tag).css('width',current_width-130);
			$('#pagebar_down' + tag).css('width',current_width-130);
			this.page_width-=130;
		}
		//bubble remove
		var num = e.target.id.replace(/[^0-9]/g,'');
		console.log(num);	
		$('#bigbubble' +num).remove(); 
		$('#eventallow' +num).remove(); 
		

		//server remove
		self.delete_bubble(num);
		
	},

	dropped : function(e){//버블 변경 
		
		var self = this;
		e.preventDefault();
		//흔들기 취소 
		$('#' + e.target.id).stop(true,true);
		
		//링크형태 / 텍스트형태 / 이미지 형태
		var dropTargetId = e.target.id;
		

		$('#' +dropTargetId).css('background-color','red');
		if(this.bubble_buffer){ //이전 누른 bubble 되돌리기 
			$('#' + this.bubble_buffer).css('background-color','white');
		}
		
		
		var currentpagecount = $('#' + this.Current_bubble.id).attr('tag');
		var droppagecount = $('#' + dropTargetId).attr('tag');
		
		var dragTargeturl = $('#pagebar_down' + currentpagecount).text();
		var dropTargeturl = $('#pagebar_down' + droppagecount).text();


		if(dragTargeturl == dropTargeturl){
			//dragTargetId랑  dropTargetId 보내주기 !!
			var dragnum= this.dragTargetId.replace(/[^0-9]/g,'');
			var dropnum= dropTargetId.replace(/[^0-9]/g,'');
			//UI적으로 바꿔주고 0        
			dragText =  $('#' +this.dragTargetId).text();  
			dropText =  $('#' +dropTargetId).text();                                                                                                                                                                                                                                                                               
			$('#' +this.dragTargetId).text(dropText);
			$('#' +dropTargetId).text(dragText);

			//id바꾸고		
			$('#' +dropTargetId).attr('id','x');
			$('#' +this.dragTargetId).attr('id',dropTargetId);
			$('#x').attr('id',this.dragTargetId);

			//레이아웃도 바꿔줘야 한다.
			$('#bigbubble' +dropnum).attr('id','x');
			$('#bigbubble' +dragnum).attr('id','bigbubble' + dropnum);
			$('#x').attr('id','bigbubble' + dragnum);
			
			$('#eventallow' +dropnum).attr('id','x');
			$('#eventallow' +dragnum).attr('id','eventallow' + dropnum);
			$('#x').attr('id','eventallow' + dragnum);
			
		}
		else{
			alert("don't move.");
		}

		this.bubble_buffer = e.target.id;
		
		
		//server change
		self.change_bubble(dragnum,dropnum);

	},

	dragovered : function(e){//효과 흔들기 효과 
		e.preventDefault();
		console.log(e.target.id);
		//$('#' + e.target.id).effect( "shake", { direction: "up", times: 50, distance: 2}, 100 );
		   /*
		if(e.target.id == bubbles_list[list].id){
			if(dragoverflag){
				$('#' + e.target.id).effect( "shake", { direction: "up", times: 50, distance: 2}, 100 );
				dragoverflag = false;
			}
		}
		else{
			console.log('hello');
			 $('#'+bubbles_list[list].id).stop(true,true);
			 dragoverflag = true;
		}*/
	},

	on_refresh : function(){
		var self = this;
		//모든 값 다 지워주기 
		$('#myStatus_up').remove();
		$('#myStatus_down').remove();
		
		//값 다 지워주기 초기화 
		var dum_div = [ 
				 '<div id="myStatus_up"></div>',
			     '<div id="myStatus_down">',
			     '<div  style="float:left; width: 10px; height :100%; "></div>',
			     '</div>',
		].join('\n'); 

		$(dum_div).appendTo('#myStatus');
		
		this.bubblecount = 1; //버블의 개수 
		this.pagecount = 0; //페이지의 개수 
		
		self.add_editdocument(this.tutorial_num); //add_page , add_bubble
	},

	add_editdocument : function(tutorialnum){
		var self = this;
		//모든 페이지들  
		$.getJSON( "http://175.126.232.145:8000/api-list/documents", {  } ) 
	   .done(function(pages) {
	   		 $.each( pages, function( key, pages ) {
	   			//page 만들기  
	   			if(pages.tutorial == tutorialnum){
	   				self.addbuild_page(pages.bubbles.length,pages.id);
		   			bubbles_list = [];
		   			bubbles_list = pages.bubbles;
		   			//처음 버블 넘겨주기  
				    for(var list in bubbles_list){
						 self.addbuild_bubble(bubbles_list[list],pages.id);
						 self.bubblecount++;
				    }
				    self.page_width += 130;
			   	}
	   		 }); 
	    })
	    .fail(function( jqxhr, textStatus, error ) {
	      // do something...
	    });	
	},

	addbuild_page : function (bubble_cnt,pageid){//페이지 add 
		var self = this;
		this.page_width=115;
		this.page_width+=130*(bubble_cnt-1);
		console.log(this.page_width);
		this.pagecount++;
		var pageCreator = self.createPageAsHtml(pageid, this.page_width,true); //add page 

		$(pageCreator).appendTo('#myStatus_up');
	},

	addbuild_bubble : function (bubbleid,pageid ){ //버블 add
		var self = this;
		var bubbleCreator = [
	     	//버블 
			'<div id="bigbubble' +bubbleid+ '"style="float:left">',
				'<div  style="width: 80px; height :10px;"></div>',
				//'<div  id="m" style="float:left; border:5px solid black; width:70px;height:70px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 60px;" align = "center" >1</div>',
				'<div  id="myBubble' + bubbleid + '" style="border:5px solid black; width:60px;height:60px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 50px;" align = "center" tag="' + pageid + '" draggable="true">'+ this.bubblecount +'</div>',
				'<div  style="width: 80px; height :10px;"></div>',
			'</div>',
			
			//이밴트 + 화살표 
			'<div id="eventallow' + bubbleid + '"style="float:left;">',
				'<div id="myEvent_button' + bubbleid + '" style = "width:50px; height:20px; background-size: 50px 20px; background-image: url(' + '../../img/next.png' + ');"></div>',
				'<div style = "width:50px; height:60px; background-size: 50px 60px; background-image: url(' + '../../img/arrow.png' + ');"></div>',
				'<div style = "width:50px; height:20px;"></div>',
			'</div>',
    	].join('\n');
    
    	$(bubbleCreator).appendTo('#myStatus_down');


	    //NEXT / CLICK 인지 판단하여 바꿔준다. 
	   $.getJSON( "http://175.126.232.145:8000/api-list/bubbles", {  } ) 
	   .done(function(bubbles) {
	   		 $.each( bubbles, function( key, bubbles ) {
	   		 	if(bubbles.id == bubbleid){
	   		 		if(bubbles.trigger == 'C')
	   		 			$('#myEvent_button'+bubbleid).css('background-image','url(' + '../../img/click.png' + ')');
	   		 	}
	   		 		
	   		 }); 
	    })
	    .fail(function( jqxhr, textStatus, error ) {
	      // do something...
	    });		
	    
	    this.age_num = pageid;
	    this.bubble_num = bubbleid;
	    
	     //드&드 설정 
		$('#myBubble' + this.bubble_num).bind('drag',function(){
			event.preventDefault();
		});
		$('#myBubble' + this.bubble_num).bind('drop',function(){
			self.dropped(event);
		});
		$('#myBubble' + this.bubble_num).bind('dragover',function(){
			self.dragovered(event);
		});
		this.Current_bubble = document.getElementById('myBubble' + this.bubble_num);

		//이벤트 넣기 
		$('#myBubble' + bubbleid).mousedown(function(){
    		self.Bubble_click(event);
    	});
    	$('#myBubble' + bubbleid).dblclick(function(){
    		self.Bubble_delete(event);
    	});
	},

	on_edit : function(){//다른곳에서 수정하기 위함 
		//성필이에게 어디어디 값 뭐 불러와야되는지 가져온다 .
		//refresh 참고 
	},
	see_preview : function(){
		status_usermode = new status_user();
		//모든 값 다 지워주기 
		$('#myStatus_all').remove();
		//값 다 지워주기 초기화 
		var dum_div = [ 
				 '<div id="myStatus_all"></div>'
		].join('\n'); 
		$(dum_div).appendTo('#myStatus_user');

		//빌더모드 가려주고  
		$('#leftScroll').css('display','none');
		$('#rightScroll').css('display','none');
	    $('#myStatus').css('display','none');
	    $('#controlbar').css('display','none');
	    
		$('#leftScroll_user').css('display','block');
		$('#rightScroll_user').css('display','block');
	    $('#myStatus_user').css('display','block');
	    $('#controlbar_user').css('display','block');
	    
		status_usermode.add_bubble_user(this.tutorial_num); //모든 버블 만들어준다. 
	},
	do_cancel : function(){ //미리보기 취소 
		$('#leftScroll_user').css('display','none');
		$('#rightScroll_user').css('display','none');
	    $('#myStatus_user').css('display','none');
	    $('#controlbar_user').css('display','none');
	    
	    
		$('#leftScroll').css('display','block');
		$('#rightScroll').css('display','block');
	    $('#myStatus').css('display','block');
	    $('#controlbar').css('display','block');
	},
	vitual_save : function(){//가상 저장 (모든 버블에 대해서 저장하기 ) 

	},
	add_publish : function(){//게시하기 
		//is_finish true
		//putch_publish_tutorials(tutorial_num);
	},



	//post
    post_new_site : function(title, description){ //make site 
    	var self = this;
      	$.ajax({
	      url: "http://175.126.232.145:8000/api-list/sites/",
	      type: "POST",
	      data: {
	          "title": title,
	          "description": description,
	          //"auth_token": get_saved_token()
	      },
	      beforeSend: function (request) {
	      	request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
	      },
      	})
      	.done(function( data) {
         	self.post_new_tutorial('test', 'test',data.id); //튜토리얼 정보 넣기 
     	 })
      	.fail(function( ) {
       	 // do something...
     	 });
    },

    post_new_tutorial : function(title, description,site) {//make tutorials
    	var self = this;
		$.ajax({
		  url: "http://175.126.232.145:8000/api-list/tutorials/",
		  type: "POST",
		  data: {
		    "title": title,
		    "description": description,
		    "is_finish": false, 
		    "is_public": false, 
		    "is_hidden": false, 
		    "site": site,
		   // "auth_token": get_saved_token()      
		  },
		  beforeSend: function (request) {
		    request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
		  },
		})
		.done(function(data) {
			console.log(data.id);
			self.tutorial_num = data.id; //빌더모드에 넣어주기 
		})
		.fail(function( ) {
		// do something...
		});
    },

    post_new_page : function(title, description, address, is_init_tutorial,tutorial, callback_success) { //make pages

    	var self = this;
		$.ajax({
		  url: "http://175.126.232.145:8000/api-list/documents/",
		  type: "POST",
		  data: {
		    "title": title,
		    "description": description,
		    "address": address,
		    "is_init_tutorial": is_init_tutorial, 
		    "tutorial": self.tutorial_num,
		    // "auth_token": get_saved_token()  
		  },
		  beforeSend: function (request) {
		    request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
		  },
		})
		.done(function( data) {
			console.log(data.id);
			self.page_num = data.id;
			if(is_init_tutorial){
			  	self.post_new_bubble('title', 'description',"DIV","N",true,null,self.page_num);//dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
			}
			else{
			  if(self.is_nextclick)
			    	self.post_new_bubble('test', 'test',"DIV","N",false,self.bubble_num,self.page_num);//dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
			  else
			    	self.post_new_bubble('title', 'description',"DIV","C",false,self.bubble_num,self.page_num);//dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
			  
			}
			callback_success();
		})
		.fail(function( ) {
		// do something...
		});
	},

    post_new_bubble : function(title, description,dompath,trigger,is_init_document,prev,documents) {//make bubbles
    	var self = this;
    	console.log (prev);
		$.ajax({
		  url: "http://175.126.232.145:8000/api-list/bubbles/",
		  type: "POST",
		  data: {
		    "title": title,
		    "description": description,
		    "dompath": "html body div div div div", 
		    "trigger": trigger, 
		    "is_init_document": is_init_document, 
		    "prev": prev, 
		    "document": documents,
		    //"auth_token": get_saved_token()

		  },
		  beforeSend: function (request) {
		    request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
		  },
		})
		.done(function( data) {
			self.bubble_num = data.id;
			self.push_realid();
			self.bubblecount++;
			console.log(self.bubblecount);
		})
		.fail(function( ) {
			// do something...
		});
	},

	//delete
	delete_bubble : function(bubbleid) {//make tutorials
    	var self = this;
		$.ajax({
		  url: "http://175.126.232.145:8000/api-list/bubbles/" + bubbleid + "/delete",
		  type: "DELETE",
		  data: {
		  },
		  beforeSend: function (request) {
		    request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
		  },
		})
		.done(function(data) {
			console.log(data);
		})
		.fail(function( ) {
		// do something...
		});
    },

    //change
    change_bubble : function(dragid,dropid) {//make tutorials
    	var self = this;
		$.ajax({
		  url: "http://175.126.232.145:8000/api-list/bubbles/" + dragid + "/change",
		  type: "PATCH",
		  data: {
		  		"target": dropid,
		  },
		  beforeSend: function (request) {
		    request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
		  },
		})
		.done(function(data) {
			console.log(data);
		})
		.fail(function( ) {
		// do something...
		});
    },



    //patch
    putch_publish_tutorials : function(id){
    	var self = this;
        $.ajax({
	      url: "http://175.126.232.145:8000/api-list/tutorials/" + id.toString() + "/",
	      type: "PATCH",
	      data: {
	        "is_finish": true,
	        //"auth_token": get_saved_token()
	      },
	      beforeSend: function (request) {
	        request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
	      },
      })
      .done(function( ) {
        // do something...
        //location.reload();
      })
      .fail(function( ) {
        // do something...
      });
    },

    putch_new_bubble : function(id, title, description) {
    	var self = this;
      $.ajax({
	      url: "http://175.126.232.145:8000/api-list/bubbles/" + id.toString() + "/",
	      type: "PATCH",
	      data: {
	        "title": title,
	        "description": description,
	       // "auth_token": get_saved_token()
	      },
	      beforeSend: function (request) {
	        request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
	      },
      })
      .done(function( ) {
        // do something...
        //location.reload();
      })
      .fail(function( ) {
        // do something...
      });
    }

};


