//사용자 모드 
var user_bubblecount=0;

//실제로 사용자들이 보고싶은 tutorial을 찾을때 
//site -> tutorial 몇번짼지 찾아주기 / 내가어디소속되어있는지 

function see_preview(){ //미리보기 
	$(document).ready(function(){
		//삭제
		//초기화 
		user_bubblecount=0;
		
		
		//빌더모드 가려주고  
		$('#leftScroll').css('display','none');
		$('#rightScroll').css('display','none');
	    $('#myStatus').css('display','none');
	    $('#controlbar').css('display','none');
	    
	    //삭제 
		
		
		$('#leftScroll_user').css('display','block');
		$('#rightScroll_user').css('display','block');
	    $('#myStatus_user').css('display','block');
	    $('#controlbar_user').css('display','block');
	    
		//저장한거 불러와서 나타내 주기 
		add_bubble_user(); //모든 버블 만들어준다. 
		
	});
}
function make_bubble(selectlist,bubbles_list){
	user_bubblecount++;
	var bubbleCreator_user = [
    	'<div id="allbubble_user' + selectlist.id + '" style="float:left;">',
    		'<div style="width:150px; height:15%; "></div>',
    		'<div id="bigbubble_user' + selectlist.id + '" style="width:150px; height:70%; ">',
    			'<div style="width:100%; height:30%">',
	    			'<div id="eventbtn_user' +  selectlist.id + '" style="float:left;width:40%; height:100%; background-color:green; background-size: 60px 40px; background-image: url(' + 'next.png' + ');"> </div>', //event버
	    			'<div style="float:left;width:20%; height:100%;"> </div>',
	    			'<div id="cnt_user" style="float:left;width:40%; height:100%;" align="center">#' + user_bubblecount + '</div>', //몇번째 버블인지 
    			'</div>',
    			'<div id="content_user' + selectlist.id + '" style = "width:100%; height: 70%; background-color:blue;" align="center" >' + selectlist.description + '</div>',//내용 
    		'</div>',
    		'<div style="width:150px; height:15%;"></div>',
    	'</div>',
    	
    	'<div id="allow' + selectlist.id + '" style="float:left; width :50px; height: 100%; background-size: 60px 170px; background-image: url(' + 'arrow1.png' + ');"></div>'
    ].join('\n');
    $(bubbleCreator_user).appendTo('#myStatus_user');
    
    if(selectlist.trigger == "C")
    	$('#eventbtn_user'+selectlist.id).css('background-image','url(' + 'click.png' + ')');
	    
}
function create_bubble(selectlist,bubbles_list){
	console.log(selectlist.next);
	if(selectlist.next){
		make_bubble(selectlist,bubbles_list); //현재에 대한 버블 만들어 주
	   for(var list in bubbles_list){
        	if(bubbles_list[list].id == selectlist.next){
        		create_bubble(bubbles_list[list],bubbles_list);
        		break;
        	}
        }
	}
	else{
		make_bubble(selectlist,bubbles_list); //마지막 버블 만들어주기 
		return;
	}
	
}
function add_bubble_user(){//버블 생성 
	$(document).ready(function(){
	    //여백넣어주기 
	   var isbubble_user = '<div id="dummy_user" style="float:left; width:20px; height:100%;" ></div>'
	   $(isbubble_user).appendTo('#myStatus_user');
	   
	   var bubbles_list = [];
	   //모든 버블들 
	   $.getJSON( "http://175.126.232.145:8000/api-list/tutorials", {  } ) 
	   .done(function(tutorials) {
	   		$.each( tutorials, function( key, tutorials ) {
	   			
	   			if(tutorials.id == tutorial_num){
	   				tutorial_list = tutorials.documents;
	   				for(var list in tutorial_list){
	   					if(tutorial_list[list].bubbles.length){
	   						for(var list_bubble in tutorial_list[list].bubbles){
	   							bubbles_list.push(tutorial_list[list].bubbles[list_bubble]);
	   						}
	   						
	   					}
	   				} //버블 추출 
	   				
	   				console.log(bubbles_list);
	   				//처음 버블 넘겨주기  
			        for(var list in bubbles_list){
			        	if(bubbles_list[list].is_init_document){
			        		create_bubble(bubbles_list[list],bubbles_list); //모든 버블 다 만들어주고 
			        		select_focusing(bubbles_list[list].id);//모든 포커싱 
			        		break;
			        	}
			        }
			        return;
	   			}
	    	});
        })
        .fail(function( jqxhr, textStatus, error ) {
          // do something...
        });		
	});
}
function select_focusing(selectlistid){
	console.log(selectlistid);
	if(selectlistid){
		$('#content_user' + selectlistid).css('background-color','red');
		//원경이 호출 
	}
	
	else{ //끝낫으면 
		console.log("end");
	}
}


function on_preview(){//다른곳에서 보기 위함 
		$(document).ready(function(){
		//성필이에게 어디어디 값 뭐 불러와야되는지 가져온다 .
		//preview 참고 
		
	});
}
