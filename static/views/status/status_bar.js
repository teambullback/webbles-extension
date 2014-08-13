var bubblecount = 1; //버블의 개수 
var pagecount = 1; //페이지의 개수 
var dragTargetId;
var bubble_buffer = "";
var Current_bubble; //현재선택된 bubble
//임시 next값/ click값 
var is_nextclick = true;
var next_width=115;
var dragoverflag = false;
function add_Statusbar(){//STATUSBAR 출
	
	$(document).ready(function(){
		$('#leftScroll').css('display','block');
		$('#rightScroll').css('display','block');
	    $('#myStatus').css('display','block');
	    $('#controlbar').css('display','block');
	});
	
};
function add_Document(){//BUBBLE추가
	
	$(document).ready(function(){
	
	   	//page
	   	if(is_nextclick){ //NEXT일경우 삭제하기 
	   		$("#black_bar" + pagecount).remove();
	   		$("#dummy_bar" + pagecount).remove();
	   		$("#pagebar" + pagecount).remove();
	   		//	$("#pagebar_up" + pagecount).remove();
	   		//	$("#pagebar_down" + pagecount).remove();
	   			
	   		
	   		var pageCreator = [ 
		   		'<div id="pagebar' + pagecount +'"  style="float:left" >',
					'<div  id="pagebar_up' + pagecount + '" style="width: ' + next_width +'; height :20px;" align="center" value = "' + pagecount + '">Page' + pagecount + '</div>',
					'<div  id="pagebar_down' + pagecount + '"style="width: ' + next_width +'; height :30px; text-overflow:ellipsis;overflow:hidden;" align="center"; value = "' + pagecount + '">' + document.location.href + '</div>',
				'</div>',
				'<div id="black_bar' + pagecount + '" style="float:left; width:5px; height:100%; background-color:black;" ></div>',
				'<div id="dummy_bar' + pagecount + '" style="float:left; width:10px; height:100%;" ></div>',
	   		].join('\n');
	   		
	   		next_width += 130;
	   	}
	   	else{ //click일때 
	   		pagecount ++;
	   		var pageCreator = [
		   		'<div id="pagebar' + pagecount +'" style="float:left" >',
					'<div  id="pagebar_up' + pagecount + '"style="width: 115px; height :20px;" align="center" value = "' + pagecount + '">Page' + pagecount + '</div>',
					'<div  id = "pagebar_down' + pagecount + '"style="width: 115px; height :30px;text-overflow:ellipsis;overflow:hidden;" align="center" value = "' + pagecount + '">' + document.location.href + '</div>',
				'</div>',
				'<div id="black_bar' + pagecount + '" style="float:left; width:5px; height:100%; background-color:black;" ></div>',
				'<div id="dummy_bar' + pagecount + '" style="float:left; width:10px; height:100%;" ></div>',
	   		].join('\n');
	   		next_width = 245;
	   		is_nextclick = true;
	   	}
	   	
	  $(pageCreator).appendTo('#myStatus_up');
	  
	   	
	   
	    //Bubble
	     var bubbleCreator = [
	     	//버블 
			'<div id="bigbubble' +bubblecount+ '"style="float:left" >',
				'<div  style="width: 80px; height :10px;"></div>',
				//'<div  id="m" style="float:left; border:5px solid black; width:70px;height:70px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 60px;" align = "center" >1</div>',
				'<div  id="myBubble' + bubblecount + '" style="border:5px solid black; width:60px;height:60px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 50px;" align = "center" onmouseDown="Bubble_click(event)" ondblclick="Bubble_delete(event)"  tag="' + pagecount + '" draggable="true"  value="' + bubblecount + '" >'+ bubblecount +'</div>',
				'<div  style="width: 80px; height :10px;"></div>',
			'</div>',
			
			//이밴트 + 화살표 
			'<div id="eventallow' + bubblecount + '"style="float:left;">',
				'<div id="myEvent_button' + bubblecount + '" style = "width:50px; height:20px; background-size: 50px 20px; background-image: url(' + 'next.png' + ');"></div>',
				'<div style = "width:50px; height:60px; background-size: 50px 60px; background-image: url(' + 'arrow.png' + ');"></div>',
				'<div style = "width:50px; height:20px;"></div>',
			'</div>'
			
	    ].join('\n');
	    
	    $(bubbleCreator).appendTo('#myStatus_down');
	    
	    
	  	Currentbubble = document.getElementById('myBubble' + bubblecount);
		Currentbubble.addEventListener("drag",function(e){e.preventDefault();},false);
		Currentbubble.addEventListener("dragover",dragovered,false);
		Currentbubble.addEventListener("drop",dropped,false);
	});
};
function select_Nextevent(){ //NEXT선택
	$(document).ready(function(){
		if(Current_bubble){
			currentcount = $('#' + Current_bubble.id).attr('value');
			$('#myEvent_button'+currentcount).css('background-image','url(' + 'next.png' + ')');
		}
		else
			$('#myEvent_button'+bubblecount).css('background-image','url(' + 'next.png' + ')');
		 is_nextclick = true;
	});
};
function select_Clickevent(){//CLICK선택
	$(document).ready(function(){
		if(Current_bubble){
			currentcount = $('#' + Current_bubble.id).attr('value');
			$('#myEvent_button'+currentcount).css('background-image','url(' + 'click.png' + ')');
		}
		else
			$('#myEvent_button'+bubblecount).css('background-image','url(' + 'click.png' + ')');
		is_nextclick = false;
	});
	
};

function on_save(){ //저장 클릭시 (하나하나저장)
	bubblecount ++;
};
function Bubble_delete(e){ //더블클릭 삭
	alert("delete bubble");
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
	var value = $('#' + e.target.id).attr('value');
	$('#bigbubble' +value).remove(); //현재 bubble 색 바꾸기 
	$('#eventallow' +value).remove(); //현재 bubble 색 바꾸기
	
	
	//삭제된 결과 서버로 보내주기  
	
}
function Bubble_click(e){ //버블선택시 
	

	
	console.log('bubble_buffer' + bubble_buffer);
	if(bubble_buffer){ //이전 누른 bubble 되돌리기 
		$('#' +bubble_buffer).css('background-color','white');
	}
	
	Current_bubble= e.target;
	dragTargetId = Current_bubble.id;
	$('#' +dragTargetId).css('background-color','red'); //현재 bubble 색 바꾸기 
	bubble_buffer = dragTargetId;
	
	
	console.log('id ' + Current_bubble.id);
	console.log('value ' + $('#' + Current_bubble.id).attr('value'));
	
	//id값 비교하여 해당 페이지 수정할 수 있게 띄어주기 ! 
};
function dropped(e){ //drop_zone
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
		var dragvalue= $('#' + dragTargetId).attr('value');
		var dropvalue= $('#' + dropTargetId).attr('value');
		//UI적으로 바꿔주고 
		$('#' +dragTargetId).text(dropvalue);
		$('#' +dropTargetId).text(dragvalue);
		
		//id바꾸고		
		$('#' +dropTargetId).attr('id','x');
		$('#' +dragTargetId).attr('id',dropTargetId);
		$('#x').attr('id',dragTargetId);
		/*
		var dum= $('#' + dropTargetId).attr('id');
		$('#' +dropTargetId).attr('id',$('#' + dragTargetId).attr('id'));
		$('#' +dragTargetId).attr('id',dum);
		
		var dum= $('#' + dragTargetId).attr('id');
		$('#' +dragTargetId).attr('id',$('#' + dropTargetId).attr('id'));
		$('#' +dropTargetId).attr('id',dum);
		*/
		//value바꾸고 
		var dum= $('#' + dragTargetId).attr('value');
		$('#' +dragTargetId).attr('value',$('#' + dropTargetId).attr('value'));
		$('#' +dropTargetId).attr('value',dum);
		
	}
	else{
		alert("don't move.");
	}
	
	
	bubble_buffer = e.target.id;
	//$('#' +dropTargetId).css('background-color','black');
	
	//바뀌는 값 보내주기 
};

function dragovered(e){
	e.preventDefault();
	
	
	for(var i=1; i<= bubblecount ; i ++){
		
		if(e.target.id == "myBubble" + i){
			if(dragoverflag){
				$('#' + e.target.id).effect( "shake", { direction: "up", times: 50, distance: 2}, 100 );
				dragoverflag = false;
			}
		}
		else{
			console.log('hello');
			 $('#myBubble'+i).stop(true,true);
			 dragoverflag = true;
		}
	
	}
}

function see_preview(){ //미리보기 
	//sorry
}
function vitual_save(){//가상 저장 (모든 버블에 대해서 저장하기 ) 
	//sorry
}
function add_publish(){//게시하기 
	//sorry
}
