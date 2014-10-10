function status_user() {
	this.um = new UM();
};

status_user.prototype = {
	//vars
	user_bubblecount: 0, //usermode 
	um: null,
	bubble_buffer: null,
	statustrigger: false,
	current_selected_bubble: null,
	//실제로 사용자들이 보고싶은 tutorial을 찾을때 
	//site -> tutorial 몇번짼지 찾아주기 / 내가어디소속되어있는지 
    /*---------------------------------------------------------------------------
    // 버블 만들기 
    ---------------------------------------------------------------------------*/
	//methods
	make_bubble: function(selectlist) {
		var self = this;
		this.user_bubblecount++;
		var bubbleCreator_user = [
			'<div id="allbubble_user' + selectlist.id + '" style="float:left;">',
			'<div style="width:150px; height:15%; "></div>',
			'<div id="bigbubble_user' + selectlist.id + '" style="width:150px; height:70%; ">',
			'<div style="width:100%; height:30%">',
			'<div id="eventbtn_user' + selectlist.id + '" style="float:left;width:40%; height:100%; background-color:green; background-size: 60px 40px;"> </div>', //event버
			'<div style="float:left;width:20%; height:100%;"> </div>',
			'<div id="cnt_user" style="float:left;width:40%; height:100%;" align="center">#' + this.user_bubblecount + '</div>', //몇번째 버블인지 
			'</div>',
			'<div id="content_user' + selectlist.id + '" style = "width:100%; height: 70%; background-color:blue;" align="center" >' + selectlist.description + '</div>', //내용 
			'</div>',
			'<div style="width:150px; height:15%;"></div>',
			'</div>',

			'<div id="allow' + selectlist.id + '" style="float:left; width :50px; height: 100%; background-size: 60px 170px; "></div>'
		].join('\n');
		$(bubbleCreator_user).appendTo('#myStatus_all');

		$('#eventbtn_user' + selectlist.id).css('background-image', 'url("' + chrome.extension.getURL('static/img/next.png').toString() + '");');
		$('#allow' + selectlist.id).css('background-image', 'url("' + chrome.extension.getURL('static/img/arrow1.png').toString() + '");');

		if (selectlist.trigger == "C")
			$('#eventbtn_user' + selectlist.id).css('background-image', 'url("' + chrome.extension.getURL('static/img/click.png').toString() + '");');


		$('#content_user' + selectlist.id).mousedown(function() {
			self.content_user_click(event);
		});
	},

	create_bubble: function(selectlist, bubbles_list) {
		var self = this;
		if (selectlist.next) {
			self.make_bubble(selectlist); //현재에 대한 버블 만들어 주
			for (var list in bubbles_list) {
				if (bubbles_list[list].id == selectlist.next) {
					self.create_bubble(bubbles_list[list], bubbles_list);
					break;
				}
			}
		} else {
			self.make_bubble(selectlist); //마지막 버블 만들어주기 
			return;
		}
	},

	add_bubble_user: function() {
		var self = this;
		//여백넣어주기 
		var isbubble_user = '<div id="dummy_user" style="float:left; width:20px; height:100%;" ></div>'
		$(isbubble_user).appendTo('#myStatus_all');

		var bubbles_list = [];

		//모든 버블들 
		chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);
            console.log(parse_bubbles);
            for(var list in parse_bubbles){
                if(!parse_bubbles[list].prev){
                	self.create_bubble(parse_bubbles[list], parse_bubbles); //모든 버블 다 만들어주고 
					self.select_focusing(parse_bubbles[list], parse_bubbles); //모든 포커싱 
                    break;
                }
            }
            
        });
	},

	add_newbubble_user: function(selectList) { //페이지 이동시 다른페이지 될때 그 시점부터 시작하기 위한 것 
		var self = this;
		//여백넣어주기 
		var isbubble_user = '<div id="dummy_user" style="float:left; width:20px; height:100%;" ></div>'
		$(isbubble_user).appendTo('#myStatus_all');

		var bubbles_list = [];
		chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

            for(var list in parse_bubbles){
                if(!parse_bubbles[list].prev){
                	self.create_bubble(parse_bubbles[list], parse_bubbles); //모든 버블 다 만들어주고 
					self.select_focusing(selectList, parse_bubbles); //모든 포커싱 
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
		var x;
		console.log('select_focusing');
		console.log(selectlist.next);
		this.current_selected_bubble = selectlist;
		this.bubble_buffer = selectlist.id;
		$('#content_user' + selectlist.id).css('background-color', 'red');
		console.log('selectlist.id' + selectlist.id);
		//console.log('1' + selectlist.dompath);

		selectlist.dompath = JSON.parse(selectlist.dompath);
		selectlist.etc_val = JSON.parse(selectlist.etc_val);
		// if(selectlist.trigger == 'C'){

		// 	chrome.runtime.sendMessage({type: "selectlist", data: bubbles_list[list]}, function(response){});

		// }

		this.um.setSpeechBubbleOnTarget(selectlist, function() { //원경이 호출
			selectlist.dompath = JSON.stringify(selectlist.dompath);
			selectlist.etc_val = JSON.stringify(selectlist.etc_val);

			$('#content_user' + selectlist.id).css('background-color', 'blue');
			console.log(selectlist.next);
			if (selectlist.next) {
		        for (var list in bubbles_list) {
		          if (bubbles_list[list].id == selectlist.next) {
		          	chrome.runtime.sendMessage({type: "selectlist", data: bubbles_list[list]}, function(response){});
		          	console.log('selectlist.trigger  ' + selectlist.trigger  );
					if(selectlist.trigger == 'C'){
						//메세지 
						self.select_focusing(bubbles_list[list], bubbles_list);
						//chrome.runtime.sendMessage({type:"clickButtonClicked", data_1: bubbles_list[list], data_2: bubbles_list}, function(response){});
					}
					else{
						console.log('2' + selectlist.dompath);
						self.select_focusing(bubbles_list[list], bubbles_list);
					}
					break;
		          }
		        }
		    } 
			else {
				//모달 띄여주기()

				$.ajax({
					url: chrome.extension.getURL('static/pages/ratingModal.html'),
					success: function(data) {
						$(data).appendTo('body');
						$('#__goDumber__popover__myModal').modal('show');
					},
					fail: function() {
						throw "** COULD'T GET TEMPLATE FILE!";
					}
				});
				return;

				
			}
		});

		//selectlist.dompath = JSON.stringify(selectlist.dompath);
	},


	/*---------------------------------------------------------------------------
    // 이벤트 
    ---------------------------------------------------------------------------*/
	content_user_click: function(e) {
		var self = this;
		$('#content_user' + this.bubble_buffer).css('background-color', 'blue');
		//사이트 이동 
		this.um.hideSpeechBubble();

		//모든 버블들 
		chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

            console.log(parse_bubbles);

			target_userbubbleid = Number(e.target.id.replace(/[^0-9]/g, ''));

            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == target_userbubbleid){
					self.select_focusing(parse_bubbles[list], parse_bubbles); //모든 포커싱 
                    break;
                }
            }
            
        });
	},

	go_first: function() {
		//모든버블 지우기 
		this.um.hideSpeechBubble();
        var self = this;
		$('#content_user' + this.bubble_buffer).css('background-color', 'blue');
		//모든 버블들 
		chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

            for(var list in parse_bubbles){
                if(!parse_bubbles[list].prev){
					self.select_focusing(parse_bubbles[list], parse_bubbles); //모든 포커싱 
                    break;
                }
            }
            
        });
    },

    statususer_trigger: function() { 
 		if(this.statustrigger){
            $('#leftScroll_user').css('display', 'none');
            $('#rightScroll_user').css('display', 'none');
            $('#myStatus_user').css('display', 'none');
            this.statustrigger =false;
        }
        else{
            $('#leftScroll_user').css('display', 'block');
            $('#rightScroll_user').css('display', 'block');
            $('#myStatus_user').css('display', 'block');
            this.statustrigger=true;
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