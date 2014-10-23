function status_user() {
	this.um = new UM();
};

status_user.prototype = {
	//vars
	user_bubblecount: 0, //usermode 
	um: null,
	statusTrigger: true,
	current_selected_bubble: null,
	target_userbubbleid:null,
	bubbleNumber:null,
	current_selectlist:null,
	tutorial_num:null,
	//실제로 사용자들이 보고싶은 tutorial을 찾을때 
	//site -> tutorial 몇번짼지 찾아주기 / 내가어디소속되어있는지 
    /*---------------------------------------------------------------------------
    // 버블 만들기 
    ---------------------------------------------------------------------------*/
	//methodss
	make_bubble: function(selectlist) {
		var self = this;
		this.user_bubblecount++;
		$.ajax({
            url: chrome.extension.getURL('static/pages/userBubble.html'),
            success: function(data) {
                $(data).appendTo('#myStatus_all');
				
				$('#count_block').attr('id', 'count_block'+ selectlist.id); //버블의 순서 
                $('#content_user').attr('id', 'content_user'+ selectlist.id); //버블의 내용
                $('#allbubble_user').attr('id', 'allbubble_user'+ selectlist.id); //버블의 
                
                $('#count_block'+ selectlist.id).html(selectlist.id + ' / '+ self.bubbleNumber); //버블의 순서 
                $('#content_user'+ selectlist.id).html(selectlist.description); //버블의 내용

                $('#allbubble_user' + selectlist.id).mousedown(function() {
					self.content_user_click(event);
				});
            },
            fail: function() {
                throw "** COULD'T GET TEMPLATE FILE!";
            }
        });
	},

	make_lastbubble: function(selectlist) {
		var self = this;
		this.user_bubblecount++;
		$.ajax({
            url: chrome.extension.getURL('static/pages/userBubble.html'),
            success: function(data) {
                $(data).appendTo('#myStatus_all');
				
				$('#count_block').attr('id', 'count_block'+ selectlist.id); //버블의 순서 
                $('#content_user').attr('id', 'content_user'+ selectlist.id); //버블의 내용
                $('#allbubble_user').attr('id', 'allbubble_user'+ selectlist.id); //버블의 색상 
                
                $('#count_block'+ selectlist.id).html(selectlist.id + ' / '+ self.bubbleNumber); //버블의 순서 
                $('#count_block'+ selectlist.id).css('font-family','NanumGothic'); 
                $('#content_user'+ selectlist.id).html(selectlist.description); //버블의 내용
                $('#content_user'+ selectlist.id).css('font-family','NanumGothic'); 
                $('#count_block' + selectlist.id).css('background-color', '#dca800');

                $('#allbubble_user' + selectlist.id).mousedown(function() {
					self.content_user_click(event);
				});

                
                if(self.target_userbubbleid){
                	$('#allbubble_user' + self.target_userbubbleid).css('background-color', '#e8f1ff');
					$('#count_block' + self.target_userbubbleid).css('background-color', '#285f9c');
                }
                else{
                	$('#allbubble_user1').css('background-color', '#e8f1ff');
					$('#count_block1').css('background-color', '#285f9c');
                }

				

            },
            fail: function() {
                throw "** COULD'T GET TEMPLATE FILE!";
            }
        });
	},

	create_bubble: function(selectlist, bubbles_list) {
		var self = this;
		this.bubbleNumber = bubbles_list.length;
		console.log(this.bubbleNumber)
		if (selectlist.next) {
			self.make_bubble(selectlist); //현재에 대한 버블 만들어 주
			for (var list in bubbles_list) {
				if (bubbles_list[list].id == selectlist.next) {
					self.create_bubble(bubbles_list[list], bubbles_list);
					break;
				}
			}
		} else {
			self.make_lastbubble(selectlist); //마지막 버블 만들어주기 
			
			//마지막 돌아가기버튼 만들어주기 
			$.ajax({
	            url: chrome.extension.getURL('static/pages/userlastBubble.html'),
	            success: function(data) {
	                $(data).appendTo('#myStatus_all');

					$('#userlast_image').css("background-image", "url('" + chrome.extension.getURL('static/img/Icon_Restart.png').toString() + "')");
	                $('#alllastbubble').mousedown(function() {
						self.go_first();
					});
	                

	            },
	            fail: function() {
	                throw "** COULD'T GET TEMPLATE FILE!";
	            }
	        });
			return;
		}
	},

	add_bubble_user: function(selectList) {
		console.log('this.statusTrigger' + this.statusTrigger);
		if(this.statusTrigger){
			//만들기전에 스크롤 닫기
			$("#bubblemapall_user").show();
	        $("#bubblemap_user").animate({
	            'bottom':"-=128px"
			});
		}
		else{
			$("#bubblemap_trigger").html('버블 맵 닫기');

		}


		var self = this;
		//여백넣어주기 

		var bubbles_list = [];


		//모든 버블들 
		chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);
            console.log(parse_bubbles);
            for(var list in parse_bubbles){
                if(!parse_bubbles[list].prev){
                	self.create_bubble(parse_bubbles[list], parse_bubbles); //모든 버블 다 만들어주고 
                	if(selectList == null)//처음부터 
						self.select_focusing(parse_bubbles[list], parse_bubbles); //모든 포커싱 
					else//중간 selectlist부터 
						self.select_focusing(selectList, parse_bubbles); 
                    break;
                }
            }
            
        });
	},

    /*---------------------------------------------------------------------------
    // 현재 포커싱 되있는 버블 & 내용  
    ---------------------------------------------------------------------------*/
	select_focusing: function(selectlist, bubbles_list) {
		var self = this;

		this.current_selected_bubble = selectlist;

		current_selectlist	= selectlist;
		$('#allbubble_user' + selectlist.id).css('background-color', '#e8f1ff');
		$('#count_block' + selectlist.id).css('background-color', '#285f9c');
		

		console.log('selectlist.id' + selectlist.id);
		console.log(selectlist.dompath);

		if(typeof selectlist.dompath == "string")
			selectlist.dompath = JSON.parse(selectlist.dompath);
		contentScriptsPort.postMessage({type: "current_bubble_url", data: selectlist.page_url}, function(response){});

		this.um.setSpeechBubbleOnTarget(selectlist, function() { //원경이 호출
			
			$('#allbubble_user' + selectlist.id).css('background-color', '#ffffff');
			$('#myStatus_user').scrollTo('#allbubble_user'+ selectlist.id ,{duration:'slow'});
			$('#count_block' + selectlist.id).css('background-color', '#52abb9');

			console.log(selectlist.next);
			if (selectlist.next) {
		        for (var list in bubbles_list) {
		          if (bubbles_list[list].id == selectlist.next) {
		          	contentScriptsPort.postMessage({type: "next_bubble", data_1: bubbles_list[list], data_2:bubbles_list}, function(response){});
					
					self.select_focusing(bubbles_list[list], bubbles_list);
					
					return;
		          }
		        }
		    } 
		    else {
                //모달 띄여주기()
                chrome.runtime.sendMessage({
                    type: "user_mode_end_of_tutorial"
                }, function(response) {});
                $.ajax({
                    url: chrome.extension.getURL('static/pages/ratingModal.html'),
                    success: function(data) {
                        $(data).appendTo('body');

                        // 이미지 동적으로 넣어줌 141021 by LyuGgang
                        $("#__goDumber__popover__modal__logo__").attr('src', chrome.extension.getURL('static/img/modal_logo.png'));
                        $("#__goDumber__popover__modal__rewindBtn__").attr('src', chrome.extension.getURL('static/img/modal_rewind.png'));
                        $("#__goDumber__popover__modal__movingArrow__").attr('src', chrome.extension.getURL('static/img/modal_movingArrow.png'));
                        $("#__goDumber__popover__modal__itHelpedBtn__").css('background-image', "url(" + chrome.extension.getURL('static/img/modal_itWasHelpful.png') + ")");
                        $("#__goDumber__popover__modal__previewLeftBtn__").attr('src', chrome.extension.getURL('static/img/modal_previewLeft.png'));
                        $("#__goDumber__popover__modal__previewRightBtn__").attr('src', chrome.extension.getURL('static/img/modal_previewRight.png'));
                        $("#__goDumber__popover__modal__fbBtn__").attr('src', chrome.extension.getURL('static/img/modal_fbBtn.png'));
                        $("#__goDumber__popover__modal__twBtn__").attr('src', chrome.extension.getURL('static/img/modal_twBtn.png'));
                        $("#__goDumber__popover__modal__linkBtn__").attr('src', chrome.extension.getURL('static/img/modal_linkBtn.png'));
                        $("#__goDumber__popover__modal__reviewListBubble__").attr('src', chrome.extension.getURL('static/img/modal_reviewListBubble.png'));
                        $("#__goDumber__popover__modal__reviewListBtn__").attr('src', chrome.extension.getURL('static/img/modal_reviewListBtn.png'));

                        $('#__goDumber__popover__myModal').modal({
                            backdrop: 'static',
                            keyboard: false
                        });

                        //클릭이벤트 
                        $("__goDumber__popover__modal__replay__").bind('click', function() { 
				            //self.tutorial_num
				        });


                        //버블맵 지워주
                        $('#bubblemap_user').remove();
                    },
                    fail: function() {
                        throw "** COULD'T GET TEMPLATE FILE!";
                    }
                });
                return;
            }
		});
	},


	/*---------------------------------------------------------------------------
    // 이벤트 
    ---------------------------------------------------------------------------*/
	bubble_move: function(){
		var self = this;
		var moving_url;
		var selected_bubble;

		chrome.storage.local.get("tutorials", function(data){
	        var parse_tutorials = JSON.parse(data.tutorials);
	        var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

	      	for(var list in parse_bubbles){
	            if(parse_bubbles[list].id == self.target_userbubbleid){
	            	moving_url = parse_bubbles[list].page_url;
	            	selected_bubble = parse_bubbles[list];
	            }
	        }
	        contentScriptsPort.postMessage({type: "change_focused_bubble", data_1: moving_url, data_2: selected_bubble, data_3: self.statusTrigger });
			//moving_url로 이동후 statusbar만들어주고 해당지점부터 실행   ---> reload_user_mode
		});
	},

	content_user_click: function(e) {
		this.target_userbubbleid = Number(e.target.id.replace(/[^0-9]/g, ''));
		this.bubble_move();
	},
	
	leftScroll_user : function(){
		//$('#myStatus_user').scrollTo($('#myStatus_user').scrollLeft()-100, {duration:'slow'});
		
		this.target_userbubbleid = current_selectlist.prev;
		if(this.target_userbubbleid === null)
			alert('제일 처음 버블입니다.');
		else
			this.bubble_move();
    },

    rightScroll_user : function(){
    	//$('#myStatus_user').scrollTo($('#myStatus_user').scrollLeft()+100, {duration:'slow'});
    	
    	this.target_userbubbleid = current_selectlist.next;
    	if(this.target_userbubbleid === null)
			alert('제일 마지막 버블입니다.');
		else
    		this.bubble_move();
    },

    statusContent_mouseover :function(){
    	$('#myStatus_user').css('overflow-x','scroll');
    },
    statusContent_mouseleave :function(){
    	$('#myStatus_user').css('overflow-x','hidden');
    },

	go_first: function() {
		var moving_url;
        chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

          	for(var list in parse_bubbles){
                if(!parse_bubbles[list].prev){
                	moving_url = parse_bubbles[list].page_url;
                	selected_bubble = parse_bubbles[list];
                }
            }
	        contentScriptsPort.postMessage({type: "change_focused_bubble", data_1: moving_url, data_2: selected_bubble});
           
        });
    },

	exit: function() {
		var moving_url;
        chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

          for(var list in parse_bubbles){
                if(!parse_bubbles[list].prev){
                moving_url = parse_bubbles[list].page_url;
                }
            }
            contentScriptsPort.postMessage({type: "exit_user_mode"});
        });
    },

    statususer_trigger: function() { 
 		if(this.statusTrigger){ //열기
 			$("#bubblemap_trigger").html('버블 맵 닫기');

			$("#bubblemapall_user").show();
			$("#bubblemap_user").animate({
				'bottom':"+=128px"
			});

            this.statusTrigger =false;
        }
        else{//닫기
        	$("#bubblemap_trigger").html('버블 맵 열기');

 			$("#bubblemapall_user").show();
			$("#bubblemap_user").animate({
				'bottom':"-=128px"
			});

            this.statusTrigger=true;
        }
    },

	do_cancel: function() { //미리보기 취소 
        this.um.hideSpeechBubble();

        $('#leftScroll_user').css('display', 'none');
        $('#rightScroll_user').css('display', 'none');
        $('#myStatus_user').css('display', 'none');
        $('#controlbar_user').css('display', 'none');


        $('#leftScroll').css('display', 'block');
        $('#rightScroll').css('display', 'block');
        $('#myStatus').css('display', 'block');
        $('#controlbar').css('display', 'block');
    },

};