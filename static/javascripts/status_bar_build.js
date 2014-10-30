/*
        //넣기
        chrome.storage.local.set({tutorials_1:contact});
        //가져오기 
        chrome.storage.local.get("tutorials_1", function(data){
            // console.log('a ' + data);
            var a = JSON.parse(data.tutorials_1);
            // console.log(a);
            // console.log(a.title);

        });
*/
//빌드모드 statusbar 
function status_build() {
    this.token_load = new status_server();
    this.mm = new MM();
};

status_build.prototype = {
    //vars
    mm: null, //buildmode 실행하기 위한 
    status_usermode: null,

    tutorial_num: null,
    page_num: 1, //실제 값으로 저장된 page_num
    bubble_num: 1, //실제 값으로 저장된 bubble_num

    bubblecount: 1, //버블의 개수  
    pagecount: 1, //페이지의 개수

    bubble_buffer: null, //클릭했던 버블 
    imCurrent_bubble : null,
    Current_bubble: null, //현재선택된 bubble
    Current_bubblecnt: 0, //현재 status의 버블 갯수 
    Current_bubblenext: null, //현재 버블의 next값 

    //dragoverflag : false,
    is_nextclick : true,
    is_clicked : false, //전에가 클릭인지 체크해주는거 
    is_seleted : false, //중간에 추가 할떄 필요한 변
    is_save :false,
    is_centerbubble : false,
    is_first_bubble : true,
    is_adddumpage : false,

    page_width: -15, //page너비 

    token_load: null, //token 객체 

    //id지정해줄 page,bubble 변수
    page_feedid : 1,
    bubble_feedid : 1,

    statustrigger : true,
    canceltrigger : true,
    clickEventSaved : false,
    /*---------------------------------------------------------------------------
    // 버블 & 페이지 만들기 
    ---------------------------------------------------------------------------*/
    //methods
    letToggleMode: function(isPageMoved, doc) {

        var self = this;
        
        if(isPageMoved){

            this.mm = null;
            this.mm = new MM();
        }


        this.mm.toggleMode(doc, function(isbubble, type) { //추가 
            if (isbubble)
                self.add_document();
            else {
                //type //click 인지 next
                if (type == 'next')
                    self.select_triggerevent(true);
                else {
                    // // console.log('here');
                    self.select_triggerevent(false);
                }
            }
        }, function(isFirstSave, bubbleInfo) { //저장e

            
            self.clickEventSaved = true;
            chrome.runtime.sendMessage({type: "trigger_event", data: bubbleInfo.trigger}, function(response) {}); 

            self.on_save(isFirstSave, bubbleInfo);


        } 
        , function(){
            self.cancel_document();
            // 버블 취소시 행할 액션을 여기에 정의합니다. // 140916 by LyuGGang

        });
    },

    createPageAsHtml: function(pagecount, page_width, flag) {
        
        if (flag) { //진짜
            return [
                '<div id="pagebar' + pagecount + '"  style="float:left" >',
                '<div  id="pagebar_up' + pagecount + '" style="width: ' + page_width + 'px; height :20px;" align="center">Page' + this.pagecount + '</div>',
                '<div  id="pagebar_down' + pagecount + '"style="width: ' + page_width + 'px; height :30px; text-overflow:ellipsis;overflow:hidden;" align="center">' + document.location.href + '</div>',
                '</div>',
                '<div id="black_bar' + pagecount + '" style="float:left; width:5px; height:100%; background-color:black;" ></div>',
                '<div id="dummy_bar' + pagecount + '" style="float:left; width:10px; height:100%;" ></div>',
            ].join('\n');
        } else { //가짜
            this.is_adddumpage = true;
            return [
                '<div id="impagebar' + pagecount + '"  style="float:left" >',
                '<div  id="impagebar_up' + pagecount + '" style="width: ' + page_width + 'px; height :20px;" align="center">Page' + this.pagecount + '</div>',
                '<div  id="impagebar_down' + pagecount + '"style="width: ' + page_width + 'px; height :30px; text-overflow:ellipsis;overflow:hidden;" align="center">' + document.location.href + '</div>',
                '</div>',
                '<div id="imblack_bar' + pagecount + '" style="float:left; width:5px; height:100%; background-color:black;" ></div>',
                '<div id="imdummy_bar' + pagecount + '" style="float:left; width:10px; height:100%;" ></div>',
            ].join('\n');

        }
    },

    add_document: function() {
        this.is_adddumpage = false;
        this.Current_bubblecnt++; //현재 stataus의 버블 갯수 추가 
        var self = this;
        // add page 
        this.page_width += 130;
        this.canceltrigger = this.is_nextclick;
        
        if (this.is_nextclick) { //Next 일때 
            if (this.is_first_bubble) {
                var pageCreator = self.createPageAsHtml(this.pagecount, this.page_width, false); //add page
                $(pageCreator).appendTo('#myStatus_up');
                //$('#impagebar_up' + this.pagecount).css('width',this.page_width);
                //$('#impagebar_down' + this.pagecount).css('width',this.page_width);
            } else {
                $('#pagebar_up' + this.page_num).css('width', this.page_width + 'px');
                $('#pagebar_down' + this.page_num).css('width', this.page_width + 'px');
            }
        } else { //click일때 
            // Click 일 때에는 새로운 페이지를 생성한다.
            if (this.is_seleted) { ///중간에 추가 되어지는데 click인경우 뒤에 추가가 된다.
                alert('don add');
                return;
            } else {
                this.pagecount++;
                this.is_nextclick = true;
                this.is_clicked = true;
                this.page_width = 115;
                var pageCreator = self.createPageAsHtml(this.pagecount, this.page_width, false); //add page
                $(pageCreator).appendTo('#myStatus_up');
            }
        }



        //add Bubble
        var bubbleCreator = [
            //버블 
            '<div id="imbigbubble' + this.bubblecount + '"style="float:left">',
            '<div  style="width: 80px; height :10px;"></div>',
            //'<div  id="m" style="float:left; border:5px solid black; width:70px;height:70px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 60px;" align = "center" >1</div>',
            '<div  id="immyBubble' + this.bubblecount + '" style="border:5px solid black; width:60px;height:60px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 50px;" align = "center"    draggable="true" tag="' + this.pagecount + '">' + this.bubblecount + '</div>',
            '<div  style="width: 80px; height :10px;"></div>',
            '</div>',
            //이밴트 + 화살표 
            '<div id="imeventallow' + this.bubblecount + '"style="float:left;">',
            '<div id="immyEvent_button' + this.bubblecount + '" style = "width:50px; height:20px; background-size: 50px 20px; "></div>',
            '<div id="imarrow' + this.bubblecount + '" style = "width:50px; height:60px; background-size: 50px 60px; "></div>',
            '<div style = "width:50px; height:20px;"></div>',
            '</div>',
            //추가할 버블 
            '<div id="imaddbubble' + this.bubblecount + '" style="float:left;"></div>',
        ].join('\n');


        if (this.is_seleted) { //선택하고 추가 (중간에 버블추가)
            
            $(bubbleCreator).appendTo('#addbubble' + this.bubble_num);
            if (this.Current_bubblenext) {
                this.is_centerbubble = true;

            } else //중간에 버블 추가하는데 다음버블이 없을 경우 
                this.is_centerbubble = false;
        } else //그냥 추가 
            $(bubbleCreator).appendTo('#myStatus_down');

        //이미지 변경 
        $('#immyEvent_button' + this.bubblecount).css("background-image", "url('" + chrome.extension.getURL('static/img/next.png').toString() + "')");
        $('#imarrow' + this.bubblecount).css("background-image", "url('" + chrome.extension.getURL('static/img/arrow.png').toString() + "')");


        this.imCurrent_bubble = document.getElementById('immyBubble' + this.bubblecount);

        this.is_save = false;
    },

    cancel_document : function(){
        //page 처리 
        //next일때 


        if(this.canceltrigger){
            if (this.is_first_bubble) {
                $("#imblack_bar" + this.pagecount).remove();
                $("#imdummy_bar" + this.pagecount).remove();
                $("#impagebar" + this.pagecount).remove();
            }
            else{
                $('#pagebar_up' + this.page_num).css('width', this.page_width - 130 + 'px');
                $('#pagebar_down' + this.page_num).css('width', this.page_width - 130 + 'px');
                
            }
        }
        //click일때
        else{
            $("#imblack_bar" + this.pagecount).remove();
            $("#imdummy_bar" + this.pagecount).remove();
            $("#impagebar" + this.pagecount).remove();
        } 
        
        this.page_width -= 130;
        this.is_nextclick = this.canceltrigger;
        //bubble 처리 
        $('#imbigbubble' + this.bubblecount).remove();
        $('#imeventallow' + this.bubblecount).remove();
    },
    
    select_triggerevent: function(is_nextclick) {
        var self = this;
        
        var currentcount = this.imCurrent_bubble.id.replace(/[^0-9]/g, '');
        if (is_nextclick) { //next일때 
            if (this.is_save)
                $('#myEvent_button' + currentcount).css('background-image', 'url("' + chrome.extension.getURL('static/img/next.png') + '")');
            else
                $('#immyEvent_button' + currentcount).css('background-image', 'url("' + chrome.extension.getURL('static/img/next.png') + '")');
        } else { //click일때 
            $('#immyEvent_button' + currentcount).css('background-image', 'url("' + chrome.extension.getURL('static/img/click.png') + '")');
            /*
            //아예 트리거 수정은 trigger잠글지 생각 
            if (this.is_save) { //저장된 상태에서 click로 바꿀 떄 alert로 모두 삭제할건지 / 아니면 바꾸지 않을건지 물어본다. 
                
                var answer = confirm('remove? ');
                // console.log('num ');
                if (answer) {
                    //다지워 준다 

                    
                    //bubble  다지우는거 예외처리 
                    $.getJSON("http://175.126.232.145:8000/api-list/tutorials/" + self.tutorial_num, {})
                        .done(function(tutorials) {
                            bubbles_list = tutorials.bubbles;


                            //처음 버블 넘겨주기  
                            for (var list in bubbles_list) {
                                if (bubbles_list[list].id == currentcount) {
                                    self.delete_backbubble(bubbles_list[list], bubbles_list); //모든 버블 다 만들어주고 
                                    break;
                                }
                            }
                        })
                        .fail(function(jqxhr, textStatus, error) {
                            // do something...
                        });
                    //page
                }
            } 
            else {
                $('#immyEvent_button' + currentcount).css('background-image', 'url("' + chrome.extension.getURL('static/img/click.png') + '")');
            }
            */
        }
        this.is_nextclick = is_nextclick;
    },

    delete_backbubble: function(selectlist, bubbles_list) {
        var self = this;
        if (selectlist.next) {
            
            self.delete_bubble(selectlist.id); //delete
            for (var list in bubbles_list) {
                
                if (bubbles_list[list].id == selectlist.next) {

                    self.delete_backbubble(bubbles_list[list], bubbles_list);
                    break;
                }
            }

        } else {
            //delete
            self.delete_bubble(selectlist.id); //delete
            return;
        }
    },


    /*---------------------------------------------------------------------------
    // 발생되는 이벤트들 
    ---------------------------------------------------------------------------*/
    bubble_click: function(e) { //버블 선택시 
        //저장안하고 선택하면 저장하라고 alert띄어주기 
        var self = this;
        
        if (this.is_save) {
            this.is_seleted = true;
            
            if (this.bubble_buffer) { //이전 누른 bubble 되돌리기 
                $('#' + this.bubble_buffer).css('background-color', 'white');
            }

            this.Current_bubble = e.target;
            $('#' + this.Current_bubble.id).css('background-color', 'red'); //현재 bubble 색 바꾸기 
            this.bubble_buffer = this.Current_bubble.id;
            
            //page를 추가하는것을 대비하여 맞춰서 초기화 
            var tag = $('#' + e.target.id).attr('tag');
            var string_current_width = $('#pagebar_up' + tag).css('width');
            this.page_width = Number(string_current_width.replace(/[^0-9]/g, ''));

            this.page_num = tag;
            this.bubble_num = e.target.id.replace(/[^0-9]/g, '');

            this.is_nextclick = true;




            chrome.storage.local.get("tutorials", function(data){
                var parse_tutorials = JSON.parse(data.tutorials);
                
                var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);
                

                for(var list in parse_bubbles){
                    if(parse_bubbles[list].id == self.bubble_num){
                        
                        self.Current_bubblenext = parse_bubbles[list].next;
                        if (parse_bubbles[list].trigger == "C")
                            self.is_nextclick = false;
                        parse_bubbles[list].dompath = JSON.parse(parse_bubbles[list].dompath);
                        parse_bubbles[list].etc_val = JSON.parse(parse_bubbles[list].etc_val);
                        
                        //self.mm.hideSpeechBubble();
                        self.mm.setSpeechBubbleOnTarget(parse_bubbles[list]); //원경이 호출 
                        self.mm.toggleLockTrigger("lock");

                        break;
                    }
                }
                
            });

        }
        else {
            alert('save');
        }
    },

    bubble_delete: function(e) { //더블클릭 삭제 
        var self = this;
        var answer = confirm("Delete data?")
        this.is_seleted = true;
        if (answer) {

            if (this.is_nextclick) { //NEXT일때만 삭제 가능 
                this.Current_bubblecnt--; //현재 stataus의 버블 갯수 감소
                if (!this.Current_bubblecnt)
                    this.is_first_bubble = true;

                //page remove
                var tag = $('#' + e.target.id).attr('tag');
                var string_current_width = $('#pagebar_up' + tag).css('width');
                
                var current_width = string_current_width.replace(/[^0-9]/g, '');
                if (current_width < 130) {
                    $("#black_bar" + tag).remove();
                    $("#dummy_bar" + tag).remove();
                    $("#pagebar" + tag).remove();
                } else {
                    $('#pagebar_up' + tag).css('width', current_width - 130 + 'px');
                    $('#pagebar_down' + tag).css('width', current_width - 130 + 'px');
                    this.page_width -= 130;
                }

                //bubble remove
                var num = e.target.id.replace(/[^0-9]/g, '');
                
                $('#bigbubble' + num).remove();
                $('#eventallow' + num).remove();

                //server remove
                self.delete_bubble(num);
            } 
            else { //click 이면 삭제 안됨 
                alert('dont delete');
            }
        }
    },

    dropped: function(e) { //버블 변경 

        var self = this;
        e.preventDefault();
        //흔들기 취소 
        $('#' + e.target.id).stop(true, true);

        //링크형태 / 텍스트형태 / 이미지 형태
        var dragTargetId = this.Current_bubble.id;
        var dropTargetId = e.target.id;
        var drop_numid = dropTargetId.replace(/[^0-9]/g, '');

        $('#' + dropTargetId).css('background-color', 'red');
        if (this.bubble_buffer) { //이전 누른 bubble 되돌리기 
            $('#' + this.bubble_buffer).css('background-color', 'white');
        }


        var currentpagecount = $('#' + this.Current_bubble.id).attr('tag');
        var droppagecount = $('#' + dropTargetId).attr('tag');

        var dragTargeturl = $('#pagebar_down' + currentpagecount).text();
        var dropTargeturl = $('#pagebar_down' + droppagecount).text();


        chrome.storage.local.get("tutorials", function(data){
            //바꾸기 
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == drop_numid){
                    if (dragTargeturl == dropTargeturl && self.is_nextclick && parse_bubbles[list].trigger == 'N' && self.page_num == parse_bubbles[list].documents) { //url이 같고/ drag-drop모두 next이고/ 같은 페이지 일때 바꿔줘라 
                        //dragTargetId랑  dropTargetId 보내주기 !!
                        var dragnum = dragTargetId.replace(/[^0-9]/g, '');
                        var dropnum = dropTargetId.replace(/[^0-9]/g, '');
                        //UI적으로 바꿔주고 0        
                        dragText = $('#' + dragTargetId).text();
                        dropText = $('#' + dropTargetId).text();
                        $('#' + dragTargetId).text(dropText);
                        $('#' + dropTargetId).text(dragText);

                        //id바꾸고     
                        $('#' + dropTargetId).attr('id', 'x');
                        $('#' + dragTargetId).attr('id', dropTargetId);
                        $('#x').attr('id', dragTargetId);

                        //레이아웃도 바꿔줘야 한다.
                        $('#bigbubble' + dropnum).attr('id', 'x');
                        $('#bigbubble' + dragnum).attr('id', 'bigbubble' + dropnum);
                        $('#x').attr('id', 'bigbubble' + dragnum);

                        $('#eventallow' + dropnum).attr('id', 'x');
                        $('#eventallow' + dragnum).attr('id', 'eventallow' + dropnum);
                        $('#x').attr('id', 'eventallow' + dragnum);

                        self.bubble_buffer = e.target.id;

                        //server change
                        self.change_bubble(dragnum, dropnum);
                    } 
                    else {
                        alert("don't move.");
                        $('#' + dropTargetId).css('background-color', 'white');
                    }
                    break;
                }
            }

        });
    },

    dragovered: function(e) { //효과 흔들기 효과 
        e.preventDefault();
        
        //$('#' + e.target.id).effect( "shake", { direction: "up", times: 50, distance: 2}, 100 );
        /*
        if(e.target.id == bubbles_list[list].id){
            if(dragoverflag){
                $('#' + e.target.id).effect( "shake", { direction: "up", times: 50, distance: 2}, 100 );
                dragoverflag = false;
            }
        }
        else{
            // console.log('hello');
             $('#'+bubbles_list[list].id).stop(true,true);
             dragoverflag = true;
        }*/
    },

    status_trigger: function(){
        if(this.statustrigger){
            $('#leftScroll').css('display', 'none');
            $('#rightScroll').css('display', 'none');
            $('#myStatus').css('display', 'none');
            this.statustrigger =false;
        }
        else{
            $('#leftScroll').css('display', 'block');
            $('#rightScroll').css('display', 'block');
            $('#myStatus').css('display', 'block');
            this.statustrigger=true;
        }
    },


    /*---------------------------------------------------------------------------
    // refresh 수정하기 위한 함수
    ---------------------------------------------------------------------------*/
    on_refresh: function() {
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
        this.Current_bubblecnt++; //현재 stataus의 버블 갯수 초기화 
        this.is_save = true;
        this.is_nextclick = true;

        self.add_editdocument(); //add_page , add_bubble
    },

    add_editdocument: function() {
        var self = this;

         chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            
            var parse_pages = JSON.parse(parse_tutorials.documents);//documents
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles); //bubbles
            
            var page_count =0;
            for(var list_p in parse_pages){ //make page
                for(var list_b in parse_bubbles){ 
                    if(parse_pages[list_p].id == parse_bubbles[list_b].documents){
                        page_count ++;
                    }
                }
                self.addbuild_page(page_count, parse_pages[list_p].id);
                page_count=0;
            }

            for(var list in parse_bubbles){ //make bubble
                if (!parse_bubbles[list].prev) {
                    self.createbuild_bubble(parse_bubbles[list], parse_bubbles); //모든 버블 다 만들어주고 
                    break;
                }
            }

            self.page_width += 130;
        });
    },

    addbuild_page: function(bubble_cnt, pageid) { //페이지 add 
        
        var self = this;
        this.page_width = 115;
        this.page_width += 130 * (bubble_cnt - 1);
        
        this.pagecount++;
        this.page_feedid++;
        var pageCreator = self.createPageAsHtml(pageid, this.page_width, true); //add page 

        $(pageCreator).appendTo('#myStatus_up');

        //$('#pagebar_up' + pageid).css('width',this.page_width);
        //$('#pagebar_down'+ pageid).css('width',this.page_width);
    },

    createbuild_bubble: function(selectlist, bubbles_list) {
        var self = this;
        
        if (selectlist.next) {
            self.addbuild_bubble(selectlist.id, selectlist.documents); //현재에 대한 버블 만들어 주

            for (var list in bubbles_list) {
                if (bubbles_list[list].id == selectlist.next) {
                    self.createbuild_bubble(bubbles_list[list], bubbles_list);
                    break;
                }
            }
        } else {
            self.addbuild_bubble(selectlist.id, selectlist.documents); //마지막 버블 만들어주기 
            return;
        }
    },

    addbuild_bubble: function(bubbleid, pageid) { //버블 add
        var self = this;

        var bubbleCreator = [
            //버블 
            '<div id="bigbubble' + bubbleid + '"style="float:left">',
            '<div  style="width: 80px; height :10px;"></div>',
            //'<div  id="m" style="float:left; border:5px solid black; width:70px;height:70px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 60px;" align = "center" >1</div>',
            '<div  id="myBubble' + bubbleid + '" style="border:5px solid black; width:60px;height:60px;-webkit-border-radius:100px;-moz-border-radius:100px;font-size: 50px;" align = "center" tag="' + pageid + '" draggable="true">' + this.bubblecount + '</div>',
            '<div  style="width: 80px; height :10px;"></div>',
            '</div>',

            //이밴트 + 화살표 
            '<div id="eventallow' + bubbleid + '"style="float:left;">',
            '<div id="myEvent_button' + bubbleid + '" style = "width:50px; height:20px; background-size: 50px 20px; "></div>',
            '<div id="arrow' + bubbleid + '" style = "width:50px; height:60px; background-size: 50px 60px; "></div>',
            '<div style = "width:50px; height:20px;"></div>',
            '</div>',
            //추가할 버블 
            '<div id="addbubble' + bubbleid + '" style="float:left;"></div>',
        ].join('\n');

        $(bubbleCreator).appendTo('#myStatus_down');

        //이미지 변경 
        $('#myEvent_button' + bubbleid).css("background-image", "url('" + chrome.extension.getURL('static/img/next.png').toString() + "')");
        $('#arrow' + bubbleid).css("background-image", "url('" + chrome.extension.getURL('static/img/arrow.png').toString() + "')");

        //NEXT / CLICK 인지 판단하여 바꿔준다. 
        chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == bubbleid){
                    if (parse_bubbles[list].trigger == 'C'){
                        $('#myEvent_button' + bubbleid).css('background-image', 'url("' + chrome.extension.getURL('static/img/click.png').toString() + '")');
                        break;
                    }
                }
            }
        });

        this.page_num = pageid;
        this.bubble_num = bubbleid;

        //드&드 설정 
        $('#myBubble' + this.bubble_num).bind('drag', function() {
            event.preventDefault();
        });
        $('#myBubble' + this.bubble_num).bind('drop', function() {
            self.dropped(event);
        });
        $('#myBubble' + this.bubble_num).bind('dragover', function() {
            self.dragovered(event);
        });
        this.Current_bubble = document.getElementById('myBubble' + this.bubble_num);

        //이벤트 넣기 
        $('#myBubble' + bubbleid).mousedown(function() {
            self.bubble_click(event);
        });
        $('#myBubble' + bubbleid).dblclick(function() {
            self.bubble_delete(event);
        });

        self.is_first_bubble = false;
        this.bubblecount++;
        this.bubble_feedid++;
        this.Current_bubblecnt++; //현재 stataus의 버블 갯수 추가 
    },


    /*---------------------------------------------------------------------------
    // preview 모드를 실행하기 위한 함수
    ---------------------------------------------------------------------------*/
    see_preview: function() {
        //this.mm.hideSpeechBubble(); //숨기기 

        this.mm.toggleSwitchOnOff(); // 원
        this.status_usermode = new status_user();
        //모든 값 다 지워주기 
        $('#myStatus_all').remove();
        //값 다 지워주기 초기화 
        var dum_div = [
            '<div id="myStatus_all"></div>'
        ].join('\n');
        $(dum_div).appendTo('#myStatus_user');

        //빌더모드 가려주고  
        $('#leftScroll').css('display', 'none');
        $('#rightScroll').css('display', 'none');
        $('#myStatus').css('display', 'none');
        $('#controlbar').css('display', 'none');

        $('#leftScroll_user').css('display', 'block');
        $('#rightScroll_user').css('display', 'block');
        $('#myStatus_user').css('display', 'block');
        $('#controlbar_user').css('display', 'block');

        $('#leftScroll_user').css("background-image", "url('" + chrome.extension.getURL('static/img/left.png').toString() + "')");
        $('#rightScroll_user').css("background-image", "url('" + chrome.extension.getURL('static/img/right.png').toString() + "')");


        this.status_usermode.add_bubble_user(); //모든 버블 만들어준다. 
    },


    do_cancel: function() { //미리보기 취소 
        this.mm.toggleSwitchOnOff();
        this.status_usermode.do_cancel();
    },
    /*---------------------------------------------------------------------------
    // 서버에 저장 &&&& 게시하기 
    ---------------------------------------------------------------------------*/
    direct_save: function() { //서버에 저장 
        var self = this;
        this.token_load.get_auth_token("admin", "admin");
        chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            
            $.ajax({ 
                url: "http://175.126.232.145:8000/api-list/tutorials/" + self.tutorial_num + "/",
                type: "PATCH",
                data: {
                    "contents": data.tutorials,
                    // "auth_token": get_saved_token()
                },
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
                },
            })
            .done(function() {
            })
            .fail(function() {
            });
            
        });
    },
    add_publish: function() { //게시하기 
        //is_finish true
    },



    /*---------------------------------------------------------------------------
    // 저장 
    ---------------------------------------------------------------------------*/
    push_realid: function() { //실제값으로 변경 
        var self = this;


        if (this.is_adddumpage) {
            //page id 실제로 서버에 있는 id로 교체 
            $('#impagebar' + this.pagecount).attr('id', 'pagebar' + this.page_num);
            $('#impagebar_up' + this.pagecount).attr('id', 'pagebar_up' + this.page_num);
            $('#impagebar_down' + this.pagecount).attr('id', 'pagebar_down' + this.page_num);
            $('#imblack_bar' + this.pagecount).attr('id', 'black_bar' + this.page_num);
            $('#imdummy_bar' + this.pagecount).attr('id', 'dummy_bar' + this.page_num);
        }
        //bubble id 실제로 서버에 있는 id로 교체 
        $('#imbigbubble' + this.bubblecount).attr('id', 'bigbubble' + this.bubble_num);
        $('#immyBubble' + this.bubblecount).attr('tag', this.page_num);
        $('#immyBubble' + this.bubblecount).attr('id', 'myBubble' + this.bubble_num);
        $('#imeventallow' + this.bubblecount).attr('id', 'eventallow' + this.bubble_num);
        $('#immyEvent_button' + this.bubblecount).attr('id', 'myEvent_button' + this.bubble_num);
        $('#imaddbubble' + this.bubblecount).attr('id', 'addbubble' + this.bubble_num);



        //드&드 설정 
        $('#myBubble' + this.bubble_num).bind('drag', function() {
            event.preventDefault();
        });
        $('#myBubble' + this.bubble_num).bind('drop', function() {
            self.dropped(event);
        });
        $('#myBubble' + this.bubble_num).bind('dragover', function() {
            self.dragovered(event);
        });
        this.Current_bubble = document.getElementById('myBubble' + this.bubble_num);

        //이벤트 넣기 
        $('#myBubble' + this.bubble_num).mousedown(function() {
            self.bubble_click(event);
        });
        $('#myBubble' + this.bubble_num).dblclick(function() {
            self.bubble_delete(event);
        });
    },

    on_save: function(isFirstSave, bubbleInfo) {
        var self = this;
        //bubble원경이에게 받은거 넣어주기 
        

        for (var i in bubbleInfo.dompath) {
            bubbleInfo.dompath[i].Element = null;

        }
        
        stringdompath = JSON.stringify(bubbleInfo.dompath);
        stringetc_val = JSON.stringify(bubbleInfo.etc_val);

        if (this.is_centerbubble) { //중간에 추가 모드 
            self.make_centerbubble(bubbleInfo.title, bubbleInfo.description, stringdompath,stringetc_val);
            /*
            if (this.is_nextclick)
                self.post_new_centerbubble(bubbleInfo.title, bubbleInfo.description, stringdompath,stringetc_val, "N", false, this.page_num, self.success_on_save);
            else
                self.post_new_centerbubble(bubbleInfo.title, bubbleInfo.description, stringdompath,stringetc_val, "C", false, this.page_num, self.success_on_save);
            */
            this.is_centerbubble = false;
        } 

        else { //기본 모드 
            if (isFirstSave) { //처음 추가모드 
                if (this.is_first_bubble) {//처음일때 
                    self.make_page('test', 'test', document.location.href, true, '1', bubbleInfo, stringdompath,stringetc_val); //제대로된 튜토리얼 넘 넣기 
                    this.is_first_bubble = false;
                } 
                else { 
                    if (this.is_clicked) {//전에가 클릭 일떄 
                        self.make_page('test', 'test', document.location.href, false, '1', bubbleInfo,stringdompath,stringetc_val);
                        this.is_clicked = false;
                    } 
                    else {
                        if (this.is_nextclick) {
                            self.make_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath,stringetc_val, "N", false, this.bubble_num, null, this.page_num);
                        } else {
                            self.make_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath,stringetc_val, "C", false, this.bubble_num, null, this.page_num);
                        }
                    }

                }
                

            } 

            else { //수정모드 
                if (this.is_nextclick)
                    self.putch_bubble(this.bubble_num, bubbleInfo.title, bubbleInfo.description,  "N");
                else
                    self.putch_bubble(this.bubble_num, bubbleInfo.title, bubbleInfo.description, "C");
            }
        }
    },

    on_load: function() {
        // // console.log("load 기능은 구현되어 있지 않음");

        // 서버에서 성공적으로 정보를 가져왔고 만약 bubble 정보가 있다면,
        // is_first_bubble = false;
    },


    /*---------------------------------------------------------------------------
    // 실제 추가된 내용 저장 
    ---------------------------------------------------------------------------*/
    make_page : function(title, description, address, is_init_tutorial, tutorial, bubbleInfo, stringdompath, stringetc_val){
        var self = this;
        var jsontext = {
            "id": this.page_feedid, 
            "title": title, 
            "description": description, 
            "address": address, 
            "is_init_tutorial": is_init_tutorial, 
            "tutorial": tutorial, 
            "initial_bubble": 1 //?
        };
        
        //추가한 페이지 넣어주기 
        chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            

            if(is_init_tutorial){//처음
                parse_tutorials.documents =  '[' + JSON.stringify(jsontext) + ']';
                
                //넣어주기 
                var contact = JSON.stringify(parse_tutorials);
                chrome.storage.local.set({tutorials:contact});
                if(self.is_nextclick)
                    self.make_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val,"N", true, null, null, self.page_num);
                else
                    self.make_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val,"C", true, null, null, self.page_num);
            }
            else{
                var data_page = parse_tutorials.documents.toString();
                data_page = data_page.slice(0, -1);
                data_page = data_page.replace("[", "");
                
                var parse_page = '[' + data_page + ','+ JSON.stringify(jsontext) +']';
                parse_tutorials.documents = parse_page;

                //넣어주기 
                var contact = JSON.stringify(parse_tutorials);
                chrome.storage.local.set({tutorials:contact});

                if(self.is_nextclick)
                    self.make_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val,"N", false, self.bubble_num, null, self.page_num);
                else
                    self.make_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val,"C", false, self.bubble_num, null, self.page_num);
            }

            
        });

        this.page_num = this.page_feedid;

        this.page_feedid++;
    },

    make_bubble : function(title, description, dompath, etc_val, trigger, is_init_document, prev, next, documents) {
        var self = this;
        var jsontext = {
            "id" : this.bubble_feedid,
            "title": title,
            "description": description,
            "dompath": dompath,
            "etc_val" : etc_val,
            "trigger": trigger,
            "is_init_document": is_init_document,
            "prev": prev,
            "next": next,
            "page_url": document.location.href,
            "documents": documents
        };


        //추가한 버블 넣어주기 
        chrome.storage.local.get("tutorials", function(data){
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);
            
            //next값 지정 
            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == prev){
                    parse_bubbles[list].next = JSON.stringify(self.bubble_feedid);
                    break;
                }
            }

            //값넣어주기 
            if(!prev){
                parse_tutorials.bubbles = '[' + JSON.stringify(jsontext) + ']';        
            }
            else{
                var data_bubble = JSON.stringify(parse_bubbles);
                data_bubble = data_bubble.slice(0, -1);
                data_bubble = data_bubble.replace("[", "");
                
                var parse_bubble = '[' + data_bubble + ','+ JSON.stringify(jsontext) +']';
                parse_tutorials.bubbles = parse_bubble;
            }
            
            
            

            //넣어주기 
            var contact = JSON.stringify(parse_tutorials);
            chrome.storage.local.set({tutorials:contact});

            self.Current_bubble = document.getElementById('myBubble' + self.bubble_feedid);
            self.bubble_feedid ++;

            

        });

        this.bubble_num = this.bubble_feedid;

        this.push_realid();
        this.bubblecount++;

        this.is_save = true;
    },

    /*---------------------------------------------------------------------------
    // 발생되는 이벤트들 내용 추가 저장 
    ---------------------------------------------------------------------------*/
    //수정 
    putch_bubble: function(id, title, description, trigger) { 
        chrome.storage.local.get("tutorials", function(data){
            //수정하기
            var parse_tutorials = JSON.parse(data.tutorials);
            
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);
            

            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == id){
                    parse_bubbles[list].title = title;
                    parse_bubbles[list].description = description;
                    parse_bubbles[list].trigger = trigger;
                    break;
                }
            }
            
            parse_tutorials.bubbles = JSON.stringify(parse_bubbles);


            //넣어주기 
            var contact = JSON.stringify(parse_tutorials);
            chrome.storage.local.set({tutorials:contact});
        });
    },

    //삭제 
    delete_bubble: function(bubbleid) {
        var self= this;
        //1. 이전버블 next에 next id 넣기  2. next버블 pre에 이전버블 id 넣기  3. 현재 버블 삭제 
        chrome.storage.local.get("tutorials", function(data){
            var current_previd;
            var current_nextid;
            
            //삭제하기 
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

            //현재버블 pre,next값 넣어주기 
            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == bubbleid){
                    current_previd = parse_bubbles[list].prev; //이전버블 id
                    current_nextid = parse_bubbles[list].next;
                    break;
                }
            }
           
            


            //현재버블 삭제 
            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == bubbleid){
                    //parse_bubbles.remove(list);
                    parse_bubbles.splice (list, 1);
                    break;
                }
            }
            

            //이전버블next <- nextid 넣고 다음버블prev <- previd 넣기 
            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == current_previd){
                    parse_bubbles[list].next = current_nextid;
                }
                if(parse_bubbles[list].id == current_nextid){
                    parse_bubbles[list].prev = current_previd;
                }
            }
            


            parse_tutorials.bubbles = JSON.stringify(parse_bubbles);

            //넣어주기 
            var contact = JSON.stringify(parse_tutorials);
            chrome.storage.local.set({tutorials:contact});

            

            //현재버블 넣어주
            if(current_previd)
                self.Current_bubble = document.getElementById('myBubble' + current_previd);
            else{
                self.Current_bubble = document.getElementById('myBubble'  + current_nextid);
            }
        });
    },

    //바꾸기
    change_bubble: function(dragid, dropid) { 
        chrome.storage.local.get("tutorials", function(data){
            //바꾸기 
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);

            var draglist_prev, draglist_next;
            var droplist_prev, droplist_next;

            //drag,drop list 구하기 
            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == dragid){
                    draglist_prev = parse_bubbles[list].prev;
                    draglist_next = parse_bubbles[list].next;
                }
                else if(parse_bubbles[list].id == dropid){
                    droplist_prev = parse_bubbles[list].prev;
                    droplist_next = parse_bubbles[list].next;
                }
            }

            //1 ( 2개)
            if(draglist_next == dropid || draglist_prev == dropid){
                var dragtarget;
                if(draglist_next == dropid) 
                    dragtarget = "front";
                else
                    dragtarget = "back";

                for(var list in parse_bubbles){
                    //drag drop 앞 뒤 
                    if(dragtarget == "front"){// (drag가 앞일때 )
                        if(parse_bubbles[list].id == draglist_prev)
                            parse_bubbles[list].next = dropid;
                        else if(parse_bubbles[list].id == droplist_next)
                            parse_bubbles[list].prev = dragid;

                        else if(parse_bubbles[list].id == dragid){ //drag
                            parse_bubbles[list].prev = dropid;
                            parse_bubbles[list].next = droplist_next;
                        }
                        else if(parse_bubbles[list].id == dropid){ //drop
                            parse_bubbles[list].prev = draglist_prev;
                            parse_bubbles[list].next = dragid;
                        }
                    }

                    else if(dragtarget == "back"){// (drag가 뒤일때 )
                        if(parse_bubbles[list].id == droplist_prev){
                            parse_bubbles[list].next = dragid;
                        }
                        else if(parse_bubbles[list].id == draglist_next){
                            parse_bubbles[list].prev = dropid;
                        }

                        else if(parse_bubbles[list].id == dragid){ //drag
                            parse_bubbles[list].prev = droplist_prev;
                            parse_bubbles[list].next = dropid;
                        }
                        else if(parse_bubbles[list].id == dropid){ //drop
                            parse_bubbles[list].prev = dragid;
                            parse_bubbles[list].next = draglist_next;
                        }
                    }

                    
                } 
            }
            // 2 (3개)
            else if(draglist_next == droplist_prev || draglist_prev == droplist_next){
                var temp;
                var dragtarget;
                if(draglist_next == droplist_prev)
                    dragtarget = "front";
                else
                    dragtarget = "back";

                for(var list in parse_bubbles){ 
                    //drag drop 앞 뒤 / center 
                    if(dragtarget == "front"){// (drag가 앞일때 )
                        if(parse_bubbles[list].id == draglist_prev){//center_front
                            parse_bubbles[list].next = dropid;
                        }
                        else if(parse_bubbles[list].id == draglist_next){//center
                            temp = parse_bubbles[list].prev;
                            parse_bubbles[list].prev = parse_bubbles[list].next;
                            parse_bubbles[list].next = temp;
                        }
                        else if(parse_bubbles[list].id == droplist_next){//center_back
                            parse_bubbles[list].prev = dragid;
                        }
                    }
                    else if(dragtarget == "back"){ //(drag가 뒤일때 )
                        if(parse_bubbles[list].id == droplist_prev){//center_front
                            parse_bubbles[list].next = dragid;
                        }
                        else if(parse_bubbles[list].id == draglist_prev){//center
                            temp = parse_bubbles[list].prev;
                            parse_bubbles[list].prev = parse_bubbles[list].next;
                            parse_bubbles[list].next = temp;
                        }
                        else if(parse_bubbles[list].id == draglist_next){//center_back
                            parse_bubbles[list].prev = dropid;
                        }
                    }

                    if(parse_bubbles[list].id == dragid){ //drag
                        parse_bubbles[list].prev = droplist_prev;
                        parse_bubbles[list].next = droplist_next;
                    }
                    else if(parse_bubbles[list].id == dropid){//drop
                        parse_bubbles[list].prev = draglist_prev;
                        parse_bubbles[list].next = draglist_next;
                    }
                }   
            }

            //3 (4개 이상)
            else{
                for(var list in parse_bubbles){
                    if(parse_bubbles[list].id == dragid){ //drag
                        parse_bubbles[list].prev = droplist_prev;
                        parse_bubbles[list].next = droplist_next;
                    }

                    else if(parse_bubbles[list].id == draglist_prev){//center_front_1
                        parse_bubbles[list].next = dropid;
                    }
                    else if(parse_bubbles[list].id == draglist_next){//center_back_1
                        parse_bubbles[list].prev = dropid;
                    }

                    else if(parse_bubbles[list].id == droplist_prev){//center_front_2
                        parse_bubbles[list].next = dragid;
                    }
                    else if(parse_bubbles[list].id == droplist_next){//center_back_2
                        parse_bubbles[list].prev = dragid;
                    }
                    
                    else if(parse_bubbles[list].id == dropid){//drop
                        parse_bubbles[list].prev = draglist_prev;
                        parse_bubbles[list].next = draglist_next;
                    }
                }   
            }


            
            parse_tutorials.bubbles = JSON.stringify(parse_bubbles);

            //넣어주기 
            var contact = JSON.stringify(parse_tutorials);
            chrome.storage.local.set({tutorials:contact});
        });
    },
    
    // 중간에 추가 
    make_centerbubble: function(title, description, dompath, etc_val, trigger) { //make bubbles 중간에 버블 추가 
       var self = this;
       var bubble_num = this.Current_bubble.id.replace(/[^0-9]/g, '');
       chrome.storage.local.get("tutorials", function(data){
            //클릭한 버블 앞/뒤 버블 next값 pre값 바꿔주기 
            var parse_tutorials = JSON.parse(data.tutorials);
            var parse_bubbles =  JSON.parse(parse_tutorials.bubbles);
            

            for(var list in parse_bubbles){
                if(parse_bubbles[list].id == bubble_num){
                    parse_bubbles[list].next = self.bubble_feedid;
                }
                else if(parse_bubbles[list].id == self.Current_bubblenext){
                    parse_bubbles[list].prev = self.bubble_feedid;
                }
            }

            
            parse_tutorials.bubbles = JSON.stringify(parse_bubbles);

            //넣어주기 
            var contact = JSON.stringify(parse_tutorials);
            chrome.storage.local.set({tutorials:contact});

            //추가하기 
            self.make_bubble(title, description, dompath, etc_val, "N", false, bubble_num, self.Current_bubblenext, self.page_num);
        });
    }

};
