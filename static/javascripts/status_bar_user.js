
function status_user(){ 
	this.um = new UM();
};

status_user.prototype = {
	//vars
	user_bubblecount : 0, //usermode 
	um : null,
	//실제로 사용자들이 보고싶은 tutorial을 찾을때 
	//site -> tutorial 몇번짼지 찾아주기 / 내가어디소속되어있는지 

	//methods
	make_bubble : function(selectlist,bubbles_list){
		this.user_bubblecount++;
		var bubbleCreator_user = [
	    	'<div id="allbubble_user' + selectlist.id + '" style="float:left;">',
	    		'<div style="width:150px; height:15%; "></div>',
	    		'<div id="bigbubble_user' + selectlist.id + '" style="width:150px; height:70%; ">',
	    			'<div style="width:100%; height:30%">',
		    			'<div id="eventbtn_user' +  selectlist.id + '" style="float:left;width:40%; height:100%; background-color:green; background-size: 60px 40px;"> </div>', //event버
		    			'<div style="float:left;width:20%; height:100%;"> </div>',
		    			'<div id="cnt_user" style="float:left;width:40%; height:100%;" align="center">#' + this.user_bubblecount + '</div>', //몇번째 버블인지 
	    			'</div>',
	    			'<div id="content_user' + selectlist.id + '" style = "width:100%; height: 70%; background-color:blue;" align="center" >' + selectlist.description + '</div>',//내용 
	    		'</div>',
	    		'<div style="width:150px; height:15%;"></div>',
	    	'</div>',
	    	
	    	'<div id="allow' + selectlist.id + '" style="float:left; width :50px; height: 100%; background-size: 60px 170px; "></div>'
	    ].join('\n');
	    $(bubbleCreator_user).appendTo('#myStatus_all');
	    
	    $('#eventbtn_user' + selectlist.id).css('background-image','url("' + chrome.extension.getURL('static/img/next.png').toString() + '");');
		$('#allow' + selectlist.id).css('background-image','url("' + chrome.extension.getURL('static/img/arrow1.png').toString() + '");');

	    if(selectlist.trigger == "C")
	    	$('#eventbtn_user'+selectlist.id).css('background-image','url("' + chrome.extension.getURL('static/img/click.png').toString() + '");');
	},

	create_bubble : function(selectlist,bubbles_list){
		var self = this;
		console.log(selectlist.next);
		if(selectlist.next){
			self.make_bubble(selectlist,bubbles_list); //현재에 대한 버블 만들어 주
		   for(var list in bubbles_list){
	        	if(bubbles_list[list].id == selectlist.next){
	        		self.create_bubble(bubbles_list[list],bubbles_list);
	        		break;
	        	}
	        }
		}
		else{
			self.make_bubble(selectlist,bubbles_list); //마지막 버블 만들어주기 
			return;
		}
	},

	add_bubble_user : function(tutorial_num){
		console.log(tutorial_num);
		var self = this;
		//여백넣어주기 
	   var isbubble_user = '<div id="dummy_user" style="float:left; width:20px; height:100%;" ></div>'
	   $(isbubble_user).appendTo('#myStatus_all');
	   
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
			        		self.create_bubble(bubbles_list[list],bubbles_list); //모든 버블 다 만들어주고 
			        		self.select_focusing(bubbles_list[list]);//모든 포커싱 
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
	},
	
	select_focusing : function(selectlist){
		console.log('selectlistnext' + selectlist.next);
		$('#content_user' + selectlist.id).css('background-color','red');
		if(selectlist.next){
			console.log('um' + this.um);
			this.um.setSpeechBubbleOnTarget(selectlist,function(){//원경이 호출 
				Nextbubble = document.getElementById('myBubble' + selectlist.next);
				self.select_focusing(Nextbubble);//모든 포커싱 
			});
		}
		else{ //끝낫으면 
			return;
			console.log("end");
		}
	},
	/*
	select_focusing : function(selectlistid){
		console.log(selectlistid);
		if(selectlistid){
			$('#content_user' + selectlistid).css('background-color','red');

			//um.setSpeechBubbleOnTarget(bubble,function(){})

			//원경이 호출 
		}
		
		else{ //끝낫으면 
			console.log("end");
		}
	},*/

	on_preview : function(){
		//성필이에게 어디어디 값 뭐 불러와야되는지 가져온다 .
		//preview 참고 
	}
};