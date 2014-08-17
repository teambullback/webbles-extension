var bubblecount = 1; //버블의 개수 
var pagecount = 1; //페이지의 개수 

var dragTargetId;
var dragoverflag = false;
var bubble_buffer = "";
var Current_bubble; //현재선택된 bubble

//임시 next값/ click값 
var is_nextclick = true;
var is_clicked = false;
var is_save = true;
var next_width=115;




//현재 id값들 
var tutorial_num=31;
var page_num=1;
var bubble_num=1;
function add_Statusbar(){//STATUSBAR 출력 
	
	$(document).ready(function(){
		$('#leftScroll').css('display','block');
		$('#rightScroll').css('display','block');
	    $('#myStatus').css('display','block');
	    $('#controlbar').css('display','block');
	    
	    
	    //site/tutorial 만들기 
	    get_auth_token("admin", "admin");
	    
	  
	   // get_auth_token("admin", "admin");
	   // post_new_site('test title', 'test description');  //정보 넣어주기 사이트 정보 
	   
	    //원경이 togglemode 호출 
	    
	   
	    
	});
	
};
function add_Document(){//BUBBLE/PAGE 추가 ()
	
	$(document).ready(function(){
	   	//page
	   	if(is_nextclick){ //NEXT일경우 삭제하기 
	   		$("#black_bar" + page_num).remove();
	   		$("#dummy_bar" + page_num).remove();
	   		$("#pagebar" + page_num).remove();
	   		
	   		var pageCreator = [ 
		   		'<div id="impagebar' + pagecount +'"  style="float:left" >',
					'<div  id="impagebar_up' + pagecount + '" style="width: ' + next_width +'; height :20px;" align="center">Page' + pagecount + '</div>',
					'<div  id="impagebar_down' + pagecount + '"style="width: ' + next_width +'; height :30px; text-overflow:ellipsis;overflow:hidden;" align="center">' + document.location.href + '</div>',
				'</div>',
				'<div id="imblack_bar' + pagecount + '" style="float:left; width:5px; height:100%; background-color:black;" ></div>',
				'<div id="imdummy_bar' + pagecount + '" style="float:left; width:10px; height:100%;" ></div>',
	   		].join('\n');
	   		
	   		next_width += 130;
	   		
	   	}
	   	else{ //click일때 
	   		pagecount ++;
	   		
	   		var pageCreator = [
		   		'<div id="impagebar' + pagecount +'" style="float:left" >',
					'<div  id="impagebar_up' + pagecount + '"style="width: 115px; height :20px;" align="center" >Page' + pagecount + '</div>',
					'<div  id = "impagebar_down' + pagecount + '"style="width: 115px; height :30px;text-overflow:ellipsis;overflow:hidden;" align="center">' + document.location.href + '</div>',
				'</div>',
				'<div id="imblack_bar' + pagecount + '" style="float:left; width:5px; height:100%; background-color:black;" ></div>',
				'<div id="imdummy_bar' + pagecount + '" style="float:left; width:10px; height:100%;" ></div>',
	   		].join('\n');
	   		
	   		next_width = 245;
	   		is_nextclick = true;
	   		is_clicked = true;
	   		
	   	}  
	   	
	   
	    //Bubble
	     var bubbleCreator = [
	     	//버블 
			'<div id="imbigbubble' +bubblecount+ '"style="float:left">',
				'<div  style="width: 80px; height :10px;"></div>',
				//'<div  id="m" style="float:left; border:5px solid black; width:70px;height:70px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 60px;" align = "center" >1</div>',
				'<div  id="immyBubble' + bubblecount + '" style="border:5px solid black; width:60px;height:60px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 50px;" align = "center" onmouseDown="Bubble_click(event)" ondblclick="Bubble_delete(event)"   draggable="true" tag="' + pagecount + '">'+ bubblecount +'</div>',
				'<div  style="width: 80px; height :10px;"></div>',
			'</div>',
			
			//이밴트 + 화살표 
			'<div id="imeventallow' + bubblecount + '"style="float:left;">',
				'<div id="immyEvent_button' + bubblecount + '" style = "width:50px; height:20px; background-size: 50px 20px; background-image: url(' + 'next.png' + ');"></div>',
				'<div style = "width:50px; height:60px; background-size: 50px 60px; background-image: url(' + 'arrow.png' + ');"></div>',
				'<div style = "width:50px; height:20px;"></div>',
			'</div>',
	    ].join('\n');
	    
	    $(pageCreator).appendTo('#myStatus_up');
	    $(bubbleCreator).appendTo('#myStatus_down');
		
		 //드&드 설정 
	  	Current_bubble = document.getElementById('immyBubble' + bubblecount);
		Current_bubble.addEventListener("drag",function(e){e.preventDefault();},false);
		Current_bubble.addEventListener("dragover",dragovered,false);
		Current_bubble.addEventListener("drop",dropped,false);
		
		is_save =false;
	});
	
};
function select_Nextevent(){ //NEXT선택
	$(document).ready(function(){
		console.log(Current_bubble.id);
		console.log(is_save);
		currentcount = Current_bubble.id.replace(/[^0-9]/g,'');
		if(is_save)
			$('#myEvent_button'+currentcount).css('background-image','url(' + 'next.png' + ')');
		else
			$('#immyEvent_button'+currentcount).css('background-image','url(' + 'next.png' + ')');
		 is_nextclick = true;
	});
};
function select_Clickevent(){//CLICK선택
	$(document).ready(function(){
		console.log(Current_bubble.id);
		currentcount =Current_bubble.id.replace(/[^0-9]/g,'');
		if(is_save)
			$('#myEvent_button'+currentcount).css('background-image','url(' + 'click.png' + ')');
		else
			$('#immyEvent_button'+currentcount).css('background-image','url(' + 'click.png' + ')');
		
		is_nextclick = false;
	});
	
};

function push_realid(){//실제값으로 변경 
	console.log('abcd' + bubble_num);
	if(is_nextclick){
		//page id 실제로 서버에 있는 id로 교체 
		$('#impagebar' +pagecount).attr('id','pagebar' + page_num);
		$('#impagebar_up' +pagecount).attr('id','pagebar_up' + page_num);
		$('#impagebar_down' +pagecount).attr('id','pagebar_down' + page_num);
		$('#imblack_bar' +pagecount).attr('id','black_bar' + page_num);
		$('#imdummy_bar' +pagecount).attr('id','dummy_bar' + page_num);
	}
	//bubble id 실제로 서버에 있는 id로 교체 
	$('#imbigbubble' +bubblecount).attr('id','bigbubble' + bubble_num);
	$('#immyBubble' +bubblecount).attr('id','myBubble' + bubble_num);
	$('#immyBubble' +bubblecount).attr('tag',page_num);
	$('#imeventallow' +bubblecount).attr('id','eventallow' + bubble_num);
	$('#immyEvent_button' +bubblecount).attr('id','myEvent_button' + bubble_num);
	
	
	 //드&드 설정 
  	Current_bubble = document.getElementById('myBubble' + bubble_num);
	Current_bubble.addEventListener("drag",function(e){e.preventDefault();},false);
	Current_bubble.addEventListener("dragover",dragovered,false);
	Current_bubble.addEventListener("drop",dropped,false);
}
function on_save(){ //저장 클릭시 (하나하나저장) 실제 
	is_save = true;
	  //bubble원경이에게 받은거 넣어주기 
	 $.getJSON( "http://175.126.232.145:8000/api-list/tutorials/" +tutorial_num , {  } ) 
	   .done(function(tutorials) {
	   	    //초기 page랑 초기 bubble 생성 
    	 	console.log(is_nextclick);
    	 	if(!tutorials.documents.length){
	          	post_new_page('test', 'test', document.location.href, true,tutorial_num); //bubble에 뭐 넣을건지 생각 !
      		 }
      		 else{
      		 	if(is_clicked){
      		 		post_new_page('test', 'test', document.location.href, false,tutorial_num); //bubble에 뭐 넣을건지 생각 !
      		 		is_clicked=false;
      		 	}
      		 	else{
	      		 	if(is_nextclick){ 
	      		 		console.log('next');
	      		 		post_new_bubble('test', 'test',"DIV","N",false,bubble_num,page_num);//dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
	      		 	}
	      		 	else{
	      		 		console.log('click');
	      		 		post_new_bubble('title', 'description',"DIV","C",false,bubble_num,page_num);//dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
      		 		
      		 		}
      		 		
      		 	}
      		 }
      		 
	   	})
        .fail(function( jqxhr, textStatus, error ) {
          // do something...       
        });		
	
};

function Bubble_click(e){ //버블선택시 
	
	//저장안하고 선택하면 저장하라고 alert띄어주기 
	
	
	console.log('bubble_buffer' + bubble_buffer);
	if(bubble_buffer){ //이전 누른 bubble 되돌리기 
		$('#' +bubble_buffer).css('background-color','white');
	}
	
	Current_bubble= e.target;
	dragTargetId = Current_bubble.id;
	$('#' +dragTargetId).css('background-color','red'); //현재 bubble 색 바꾸기 
	bubble_buffer = dragTargetId;
	
	
	console.log('id ' + Current_bubble.id);
	
	
	//id값 비교하여 해당 페이지 수정할 수 있게 띄어주기 ! 
	//원경이 호출 
	//patch로 변
};


function Bubble_delete(e){ //더블클릭 삭제 
	alert("delete bubble " +e.target.id );
	//page remove
	var tag = $('#' + e.target.id).attr('tag');
	var string_current_width = $('#pagebar_up' + tag).css('width');
	var current_width = string_current_width.replace(/[^0-9]/g,'');
	if(current_width <130){
		$("#black_bar" + tag).remove();
   		$("#dummy_bar" + tag).remove();
   		$("#pagebar" + tag).remove();
	}
	else{
		$('#pagebar_up' + tag).css('width',current_width-130);
		$('#pagebar_down' + tag).css('width',current_width-130);
		next_width-=130;
	}
	//bubble remove
	var num = e.target.id.replace(/[^0-9]/g,'');
	console.log(num);	
	$('#bigbubble' +num).remove(); 
	$('#eventallow' +num).remove(); 
	
	
	//삭제된 결과 서버로 보내주기  
}
function dropped(e){ //버블 변경 
	e.preventDefault();
	//흔들기 취소 
	$('#' + e.target.id).stop(true,true);
	
	//링크형태 / 텍스트형태 / 이미지 형태
	dropTargetId = e.target.id;
	
	
	
	$('#' +dropTargetId).css('background-color','red');
	if(bubble_buffer){ //이전 누른 bubble 되돌리기 
		$('#' +bubble_buffer).css('background-color','white');
	}
	
	
	currentpagecount = $('#' + Current_bubble.id).attr('tag');
	droppagecount = $('#' + dropTargetId).attr('tag');
	
	dragTargeturl = $('#pagebar_down' + currentpagecount).text();
	dropTargeturl = $('#pagebar_down' + droppagecount).text();

	if(dragTargeturl == dropTargeturl){
		//dragTargetId랑 dropTargetId 보내주기 !!
		var dragnum= dragTargetId.replace(/[^0-9]/g,'');
		var dropnum= dropTargetId.replace(/[^0-9]/g,'');
		//UI적으로 바꿔주고 0        
		dragText =  $('#' +dragTargetId).text();  
		dropText =  $('#' +dropTargetId).text();                                                                                                                                                                                                                                                                               
		$('#' +dragTargetId).text(dropText);
		$('#' +dropTargetId).text(dragText);
		
		//id바꾸고		
		$('#' +dropTargetId).attr('id','x');
		$('#' +dragTargetId).attr('id',dropTargetId);
		$('#x').attr('id',dragTargetId);
		
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
	
	
	bubble_buffer = e.target.id;
	//$('#' +dropTargetId).css('background-color','black');
	
	//바뀌는 값 보내주기 
};

function dragovered(e){ //효과 흔들기 효과 
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
}



function do_cancel(){ //미리보기 취소 
	$(document).ready(function(){
		$('#leftScroll_user').css('display','none');
		$('#rightScroll_user').css('display','none');
	    $('#myStatus_user').css('display','none');
	    $('#controlbar_user').css('display','none');
	    
	    
		$('#leftScroll').css('display','block');
		$('#rightScroll').css('display','block');
	    $('#myStatus').css('display','block');
	    $('#controlbar').css('display','block');
	});
}
function vitual_save(){//가상 저장 (모든 버블에 대해서 저장하기 ) 
}
function add_publish(){//게시하기 
	//is_finish true
	//putch_publish_tutorials(tutorial_num);
}



function on_refresh(){
	//값 다 지워주기 초기화 
	$(document).ready(function(){
		
		//모든 값 다 지워주기 버블 + 페이지 
		$('#myStatus_up').remove();
		$('#myStatus_down').remove();
		
		var a = [ 
   			     '<div id="myStatus_up"></div>',
			     '<div id="myStatus_down">',
			     '<div  style="float:left; width: 10px; height :100%; "></div>',
			     '</div>',
		].join('\n'); 
		
		$(a).appendTo('#myStatus');
	    
		
		bubblecount = 1; //버블의 개수 
		pagecount = 0; //페이지의 개수 
		
		add_editdocument(tutorial_num);
		//pagecount / bubblecount 값 변동 
	});
}

function add_editdocument(tutorialnum){
	//모든 페이지들  
	
   $.getJSON( "http://175.126.232.145:8000/api-list/documents", {  } ) 
   .done(function(pages) {
   		 $.each( pages, function( key, pages ) {
   		 	
   		 	
   			//page 만들기  
   			if(pages.tutorial == tutorialnum){
   				addbuild_page(pages.bubbles.length,pages.id);
	   			bubbles_list = [];
	   			bubbles_list = pages.bubbles;
	   			//처음 버블 넘겨주기  
			    for(var list in bubbles_list){
					 addbuild_bubble(bubbles_list[list],pages.id);
					 bubblecount++;
			    }
			    next_width += 130;
		   	}
   		 }); 
    })
    .fail(function( jqxhr, textStatus, error ) {
      // do something...
    });		
    
	
}

function addbuild_page(bubble_cnt,pageid){ //해당 페이지 추가 
	next_width=115;
	next_width+=130*(bubble_cnt-1);
	console.log(next_width);
	pagecount++;
	var pageCreator = [ 
   		'<div id="pagebar' + pageid +'"  style="float:left" >',
			'<div  id="pagebar_up' + pageid + '" style="width: ' + next_width +'; height :20px;" align="center">Page' + pagecount + '</div>',
			'<div  id="pagebar_down' + pageid + '"style="width: ' + next_width +'; height :30px; text-overflow:ellipsis;overflow:hidden;" align="center">' + document.location.href + '</div>',
		'</div>',
		'<div id="black_bar' + pageid + '" style="float:left; width:5px; height:100%; background-color:black;" ></div>',
		'<div id="dummy_bar' + pageid + '" style="float:left; width:10px; height:100%;" ></div>',
	].join('\n');

	$(pageCreator).appendTo('#myStatus_up');
	
}
function addbuild_bubble(bubbleid,pageid ){//해당 버블 추가 
	 var bubbleCreator = [
     	//버블 
		'<div id="bigbubble' +bubbleid+ '"style="float:left">',
			'<div  style="width: 80px; height :10px;"></div>',
			//'<div  id="m" style="float:left; border:5px solid black; width:70px;height:70px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 60px;" align = "center" >1</div>',
			'<div  id="myBubble' + bubbleid + '" style="border:5px solid black; width:60px;height:60px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 50px;" align = "center" onmouseDown="Bubble_click(event)" ondblclick="Bubble_delete(event)"  tag="' + pageid + '" draggable="true">'+ bubblecount +'</div>',
			'<div  style="width: 80px; height :10px;"></div>',
		'</div>',
		
		//이밴트 + 화살표 
		'<div id="eventallow' + bubbleid + '"style="float:left;">',
			'<div id="myEvent_button' + bubbleid + '" style = "width:50px; height:20px; background-size: 50px 20px; background-image: url(' + 'next.png' + ');"></div>',
			'<div style = "width:50px; height:60px; background-size: 50px 60px; background-image: url(' + 'arrow.png' + ');"></div>',
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
   		 			$('#myEvent_button'+bubbleid).css('background-image','url(' + 'click.png' + ')');
   		 	}
   		 		
   		 }); 
    })
    .fail(function( jqxhr, textStatus, error ) {
      // do something...
    });		
    
    page_num = pageid;
    bubble_num = bubbleid;
    
     //드&드 설정 
  	Current_bubble = document.getElementById('myBubble' + bubbleid);
	Current_bubble.addEventListener("drag",function(e){e.preventDefault();},false);
	Current_bubble.addEventListener("dragover",dragovered,false);
	Current_bubble.addEventListener("drop",dropped,false);
		
}

function on_edit(){ //다른곳에서 수정하기 위함 
	$(document).ready(function(){
		//성필이에게 어디어디 값 뭐 불러와야되는지 가져온다 .
		//refresh 참고 
	});
}