//빌드모드 statusbar 
function status_build() {
    this.token_load = new status_server();
    this.mm = new MM();
};

status_build.prototype = {
    //vars
    bubblecount: 1, //버블의 개수 
    pagecount: 1, //페이지의 개수 

    dragTargetId: null,
    bubble_buffer: null,
    Current_bubble: null, //현재선택된 bubble
    Current_bubblecnt: 0, //현재 status의 버블 갯수 
    Current_bubblenext: null,

    dragoverflag : false,
    is_nextclick : true,
    is_clicked : false,
    is_seleted : false,
    is_save :false,
    is_centerbubble : false,
    is_first_bubble : true,
    is_adddumpage : false,
    clickEventSaved : false,

    page_width: -15, //page너비 

    tutorial_num: 80, //server에서 받아온 tutorial_num
    page_num: 1, //server에서 받아온 page_num
    bubble_num: 1, //server에서 받아온 bubble_num

    token_load: null, //token 객체 
    mm: null,
    status_usermode: null,



    //methods
    add_Statusbar: function() {
        var self = this;
        console.log('come');

        $.ajax({
            url: chrome.extension.getURL('static/pages/statusbar.html'),
            type: "GET",
            async: false,
        })
            .done(function(data) {
                $($.parseHTML(data)).appendTo('html');
            })
            .fail(function() {
                // do something...
            });

        //$(statusbarCreator).appendTo('html');
        $('#leftScroll').css('display', 'block');
        $('#rightScroll').css('display', 'block');
        $('#myStatus').css('display', 'block');
        $('#controlbar').css('display', 'block');

        $('#leftScroll').css("background-image", "url('" + chrome.extension.getURL('static/img/left.png').toString() + "')");
        $('#rightScroll').css("background-image", "url('" + chrome.extension.getURL('static/img/right.png').toString() + "')");

        //클릭 이벤트 
        $('#preview').bind('click', function() { //preview 
            self.see_preview();
        });
        
        $('#save').bind('click', function() { //preview 
            self.vitual_save();
        });
        $('#publish').bind('click', function() { //preview 
            self.add_publish();
        });

        $('#on_refresh').bind('click', function() { //지울거  
            self.on_refresh();
        });
        //site/tutorial 만들기 
        this.token_load.get_auth_token("admin", "admin");

        //원경이 togglemode 호출 
        // this.mm.toggleMode(document, function(isbubble, type) { //추가 
        //     if (isbubble)
        //         self.add_Document();
        //     else {
        //         //type //click 인지 next
        //         if (type == 'next')
        //             self.select_triggerevent(true);
        //         else {
        //             console.log('here');
        //             self.select_triggerevent(false);
        //         }
        //     }
        // }, function(isFirstSave, bubbleInfo) { //저장e

        //     console.log('here');
        //     //bubbleInfo.trigger ==> N or C
        //     chrome.runtime.sendMessage({
        //         type: "trigger_event",
        //         data: bubbleInfo.trigger
        //     }, function(response) {});

        //     self.on_save(isFirstSave, bubbleInfo);


        // });
        this.letToggleMode(false, document);
        //제작모드를 끝내고 싶으면 toggleSwitchOnOff 콜 

    },

    letToggleMode: function(isPageMoved, doc) {

        var self = this;
        console.log("DOC THAT CAME INSIDE THE TOGGLEMODE!!!!!!!!!!! ===> ", doc);

        if(isPageMoved){

            this.mm = null;
            this.mm = new MM();
        }


        this.mm.toggleMode(doc, function(isbubble, type) { //추가 
            if (isbubble)
                self.add_Document();
            else {
                //type //click 인지 next
                if (type == 'next')
                    self.select_triggerevent(true);
                else {
                    // console.log('here');
                    self.select_triggerevent(false);
                }
            }
        }, function(isFirstSave, bubbleInfo) { //저장e

            console.log('here');
            //bubbleInfo.trigger ==> N or C
            self.clickEventSaved = true;
            chrome.runtime.sendMessage({type: "trigger_event", data: bubbleInfo.trigger}, function(response) {}); 

            self.on_save(isFirstSave, bubbleInfo);


        }, function(){
            self.cancel_Document();
            // 버블 취소시 행할 액션을 여기에 정의합니다. // 140916 by LyuGGang

        });

    },

    createNewTutorial: function() {
        var self = this;
        self.post_new_tutorial('test title', 'test description', 1 /*site_num*/ ); //정보 넣어주기 사이트 정보 
    },

    createPageAsHtml: function(pagecount, page_width, flag) {
        console.log('pagecount ' + pagecount + ' page_width ' + page_width);
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

    cancel_Document : function(){
        //page 처리 
        //next일때 
        if(this.is_nextclick){
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
        
        //bubble 처리 
        $('#imbigbubble' + this.bubblecount).remove();
        $('#imeventallow' + this.bubblecount).remove();
    },

    add_Document: function() {
        this.is_adddumpage = false;
        this.Current_bubblecnt++; //현재 stataus의 버블 갯수 추가 
        var self = this;
        // add page 
        this.page_width += 130;
        console.log(self.page_num);
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
            console.log('lkk' + this.Current_bubblenext);
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


        this.Current_bubble = document.getElementById('immyBubble' + this.bubblecount);

        this.is_save = false;
    },

    select_triggerevent: function(is_nextclick) {
        var self = this;
        console.log('is_nextclick ' + is_nextclick);
        var currentcount = this.Current_bubble.id.replace(/[^0-9]/g, '');
        if (is_nextclick) { //next일때 
            if (this.is_save)
                $('#myEvent_button' + currentcount).css('background-image', 'url("' + chrome.extension.getURL('static/img/next.png') + '")');
            else
                $('#immyEvent_button' + currentcount).css('background-image', 'url("' + chrome.extension.getURL('static/img/next.png') + '")');
        } else { //click일때 
            //아예 트리거 수정은 trigger잠글지 생각 
            if (this.is_save) { //저장된 상태에서 click로 바꿀 떄 alert로 모두 삭제할건지 / 아니면 바꾸지 않을건지 물어본다. 
                var answer = confirm('remove? ');
                console.log('num ');
                if (answer) {
                    //다지워 준다 

                    //bubble
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
            } else {
                $('#immyEvent_button' + currentcount).css('background-image', 'url("' + chrome.extension.getURL('static/img/click.png') + '")');
            }
        }
        this.is_nextclick = is_nextclick;
    },

    delete_backbubble: function(selectlist, bubbles_list) {
        var self = this;
        if (selectlist.next) {
            console.log('delete ' + selectlist.id);
            self.delete_bubble(selectlist.id); //delete
            for (var list in bubbles_list) {
                console.log(list);
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
            self.Bubble_click(event);
        });
        $('#myBubble' + this.bubble_num).dblclick(function() {
            self.Bubble_delete(event);
        });


    },

    success_on_save: function() { // 서버에 페이지 정보가 저장되었을 때 호출되는 callback 함수
        this.is_save = true;
    },

    on_save: function(isFirstSave, bubbleInfo) {
        var self = this;
        //bubble원경이에게 받은거 넣어주기 
        console.log('save');

        for (var i in bubbleInfo.dompath) {
            bubbleInfo.dompath[i].Element = null;

        }

        stringdompath = JSON.stringify(bubbleInfo.dompath);
        stringetc_val = JSON.stringify(bubbleInfo.etc_val);

        if (this.is_centerbubble) { //중간에 추가 모드 
            if (this.is_nextclick)
                self.post_new_centerbubble(bubbleInfo.title, bubbleInfo.description, stringdompath,stringetc_val, "N", false, this.page_num, self.success_on_save);
            else
                self.post_new_centerbubble(bubbleInfo.title, bubbleInfo.description, stringdompath,stringetc_val, "C", false, this.page_num, self.success_on_save);

            this.is_centerbubble = false;
        } else { //기본 모드 
            if (isFirstSave) { //처음 추가모드 
                if (this.is_first_bubble) {
                    self.post_new_page('test', 'test', document.location.href, true, this.tutorial_num, self.success_on_save, bubbleInfo, stringdompath,stringetc_val);
                    this.is_first_bubble = false;

                } else {
                    if (this.is_clicked) {
                        self.post_new_page('test', 'test', document.location.href, false, this.tutorial_num, self.success_on_save, bubbleInfo, stringdompath,stringetc_val);
                        this.is_clicked = false;
                    } else {
                        if (this.is_nextclick) {
                            console.log('next');
                            self.post_new_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath,stringetc_val,  "N", false, this.bubble_num, this.page_num, self.success_on_save);
                        } else {
                            console.log('click');
                            self.post_new_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath,stringetc_val, "C", false, this.bubble_num, this.page_num, self.success_on_save);
                        }
                    }
                }
            } else { //수정모드 
                if (this.is_nextclick)
                    self.putch_new_bubble(this.bubble_num, bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val, "N");
                else
                    self.putch_new_bubble(this.bubble_num, bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val, "C");
            }
        }
    },

    on_load: function(tutorial_num) {
        console.log("load 기능은 구현되어 있지 않음");
        // tutorial_num 으로 서버에서 가져옴

        // 서버에서 성공적으로 정보를 가져왔고 만약 bubble 정보가 있다면,
        // is_first_bubble = false;
    },


    Bubble_click: function(e) { //버블 선택시 
        //저장안하고 선택하면 저장하라고 alert띄어주기 

        console.log(this.is_save);
        if (this.is_save) {
            var self = this;
            this.is_seleted = true;
            console.log('bubble_buffer' + this.bubble_buffer);
            if (this.bubble_buffer) { //이전 누른 bubble 되돌리기 
                $('#' + this.bubble_buffer).css('background-color', 'white');
            }

            this.Current_bubble = e.target;
            this.dragTargetId = this.Current_bubble.id;
            $('#' + this.dragTargetId).css('background-color', 'red'); //현재 bubble 색 바꾸기 
            this.bubble_buffer = this.dragTargetId;
            //page를 추가하는것을 대비하여 맞춰서 초기화 
            var tag = $('#' + e.target.id).attr('tag');
            var string_current_width = $('#pagebar_up' + tag).css('width');
            this.page_width = Number(string_current_width.replace(/[^0-9]/g, ''));

            this.page_num = tag;
            this.bubble_num = e.target.id.replace(/[^0-9]/g, '');

            this.is_nextclick = true;


            console.log('this.page_width ' + this.page_width);
            console.log('this.page_num  ' + this.page_num);
            console.log('this.bubble_num ' + this.bubble_num);
            //id값 비교하여 해당 페이지 수정할 수 있게 띄어주기 ! 



            $.getJSON("http://175.126.232.145:8000/api-list/bubbles/" + this.bubble_num, {})
                .done(function(bubbles) {
                    //console.log('bubbles' + bubbles.dompath);
                    self.Current_bubblenext = bubbles.next;
                    if (bubbles.trigger == "C")
                        self.is_nextclick = false;
                    bubbles.dompath = JSON.parse(bubbles.dompath);
                    //self.mm.hideSpeechBubble();
                    self.mm.setSpeechBubbleOnTarget(bubbles); //원경이 호출 
                    self.mm.toggleLockTrigger("lock");
                    

                })
                .fail(function(jqxhr, textStatus, error) {
                    // do something...
                });
        } else {
            alert('save');
        }
    },

    Bubble_delete: function(e) { //더블클릭 삭제 
        var answer = confirm("Delete data?")
        if (answer) {

            if (this.is_nextclick) { //NEXT일때만 삭제 가능 
                this.Current_bubblecnt--; //현재 stataus의 버블 갯수 추가 
                if (!this.Current_bubblecnt)
                    this.is_first_bubble = true;

                var self = this;
                //page remove
                var tag = $('#' + e.target.id).attr('tag');
                var string_current_width = $('#pagebar_up' + tag).css('width');
                console.log(tag);
                console.log(string_current_width);

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
                console.log(num);
                $('#bigbubble' + num).remove();
                $('#eventallow' + num).remove();


                //server remove
                self.delete_bubble(num);
            } else { //click 이면 삭제 안됨 
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



        $.getJSON("http://175.126.232.145:8000/api-list/bubbles/" + drop_numid, {})
            .done(function(bubbles) {
                console.log('self.is_nextclick ' + self.is_nextclick);
                console.log('bubbles.trigger ' + bubbles.trigger);

                if (dragTargeturl == dropTargeturl && self.is_nextclick && bubbles.trigger == 'N') { //next이고 url이 같다면 바꿔줘라 
                    //dragTargetId랑  dropTargetId 보내주기 !!
                    var dragnum = self.dragTargetId.replace(/[^0-9]/g, '');
                    var dropnum = dropTargetId.replace(/[^0-9]/g, '');
                    //UI적으로 바꿔주고 0        
                    dragText = $('#' + self.dragTargetId).text();
                    dropText = $('#' + dropTargetId).text();
                    $('#' + self.dragTargetId).text(dropText);
                    $('#' + dropTargetId).text(dragText);

                    //id바꾸고     
                    $('#' + dropTargetId).attr('id', 'x');
                    $('#' + self.dragTargetId).attr('id', dropTargetId);
                    $('#x').attr('id', self.dragTargetId);

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
                } else {
                    alert("don't move.");
                }
            })
            .fail(function(jqxhr, textStatus, error) {
                // do something...
            });
    },

    dragovered: function(e) { //효과 흔들기 효과 
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

        self.add_editdocument(this.tutorial_num); //add_page , add_bubble
    },

    add_editdocument: function(tutorialnum) {
        var self = this;
        $.getJSON("http://175.126.232.145:8000/api-list/tutorials/" + tutorialnum, {})
            .done(function(tutorials) {
                page_list = tutorials.documents;
                bubbles_list = tutorials.bubbles;

                for (var list in page_list) { //page 만들기 

                    $.getJSON("http://175.126.232.145:8000/api-list/documents/" + page_list[list].id, {})
                        .done(function(documents) {
                            console.log('page_list[list].id' + page_list[list].id);
                            console.log(documents.id);
                            self.addbuild_page(documents.bubbles.length, documents.id);

                        })
                        .fail(function(jqxhr, textStatus, error) {
                            // do something...
                        });
                }

                for (var list in bubbles_list) {
                    if (bubbles_list[list].is_init_document) {
                        self.createbuild_bubble(bubbles_list[list], bubbles_list); //모든 버블 다 만들어주고 
                        break;
                    }
                }
                self.page_width += 130;


            })
            .fail(function(jqxhr, textStatus, error) {
                // do something...
            });
    },

    addbuild_page: function(bubble_cnt, pageid) { //페이지 add 
        console.log('bubble_cnt' + bubble_cnt);
        var self = this;
        this.page_width = 115;
        this.page_width += 130 * (bubble_cnt - 1);
        console.log(this.page_width);
        this.pagecount++;
        var pageCreator = self.createPageAsHtml(pageid, this.page_width, true); //add page 

        $(pageCreator).appendTo('#myStatus_up');

        //$('#pagebar_up' + pageid).css('width',this.page_width);
        //$('#pagebar_down'+ pageid).css('width',this.page_width);
    },

    createbuild_bubble: function(selectlist, bubbles_list) {
        var self = this;
        console.log('selectlist.document' + selectlist.document);
        if (selectlist.next) {
            self.addbuild_bubble(selectlist.id, selectlist.document); //현재에 대한 버블 만들어 주

            for (var list in bubbles_list) {
                if (bubbles_list[list].id == selectlist.next) {
                    self.createbuild_bubble(bubbles_list[list], bubbles_list);
                    break;
                }
            }
        } else {
            self.addbuild_bubble(selectlist.id, selectlist.document); //마지막 버블 만들어주기 
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
        $.getJSON("http://175.126.232.145:8000/api-list/bubbles/" + bubbleid, {})
            .done(function(bubbles) {
                if (bubbles.trigger == 'C')
                    $('#myEvent_button' + bubbleid).css('background-image', 'url("' + chrome.extension.getURL('static/img/click.png').toString() + '")');

            })
            .fail(function(jqxhr, textStatus, error) {
                // do something...
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
            self.Bubble_click(event);
        });
        $('#myBubble' + bubbleid).dblclick(function() {
            self.Bubble_delete(event);
        });

        self.is_first_bubble = false;
        this.bubblecount++;
        this.Current_bubblecnt++; //현재 stataus의 버블 갯수 추가 
    },

    on_edit: function() { //다른곳에서 수정하기 위함 
        //성필이에게 어디어디 값 뭐 불러와야되는지 가져온다 .
        //refresh 참고 
    },
    see_preview: function() {
        //this.mm.hideSpeechBubble(); //숨기기 

        this.mm.toggleSwitchOnOff(); // 원
        // this.mm.hideSpeechBubble();

        
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


        this.status_usermode.add_bubble_user(this.tutorial_num); //모든 버블 만들어준다. 
    },

     see_newpreview: function(selectList) {
        this.mm.toggleSwitchOnOff(); // 원
        // this.mm.hideSpeechBubble();

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


        this.status_usermode.add_newbubble_user(this.tutorial_num,selectList); //모든 버블 만들어준다. 
    },

<<<<<<< HEAD
    do_cancel: function() { //미리보기 취소 
        //this.mm.hideSpeechBubble(); //숨기기 
        this.mm.toggleSwitchOnOff();
=======
>>>>>>> 924f031b54af129a94835421671a69e97b95aab1

    vitual_save: function() { //가상 저장 (모든 버블에 대해서 저장하기 ) 

    },
    add_publish: function() { //게시하기 
        //is_finish true
        //putch_publish_tutorials(tutorial_num);
    },

    /*
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
    },*/

    post_new_tutorial: function(title, description, site) { //make tutorials
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
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
            },
        })
            .done(function(data) {
                console.log(data.id);
                self.tutorial_num = data.id; //빌더모드에 넣어주기
                chrome.runtime.sendMessage({
                    tutorial_id_established: "tutorial_id_established",
                    tutorial_id: data.id
                }, function(response) {
                    console.log(response.success)
                });
            })
            .fail(function() {
                // do something...
            });
    },

    post_new_page: function(title, description, address, is_init_tutorial, tutorial, callback_success, bubbleInfo, stringdompath,stringetc_val) { //make pages
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
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
            },
        })
            .done(function(data) {
                console.log(data.id);
                self.page_num = data.id;
                console.log('1self go ' + self.page_num);
                if (is_init_tutorial) {
                    if (self.is_nextclick)
                        self.post_new_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val,"N", true, null, self.page_num, callback_success); //dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
                    else
                        self.post_new_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val,"C", true, null, self.page_num, callback_success); //dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
                } else {
                    if (self.is_nextclick)
                        self.post_new_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val,"N", false, self.bubble_num, self.page_num, callback_success); //dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
                    else
                        self.post_new_bubble(bubbleInfo.title, bubbleInfo.description, stringdompath, stringetc_val,"C", false, self.bubble_num, self.page_num, callback_success); //dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id

                }
                //callback_success();
            })
            .fail(function() {
                // do something...
            });
    },

    post_new_bubble: function(title, description, dompath, etc_val, trigger, is_init_document, prev, documents, callback_success) { //make bubbles 새로운 버블 추가 
        console.log('2slef go ' + documents);
        var self = this;
        $.ajax({
            url: "http://175.126.232.145:8000/api-list/bubbles/",
            type: "POST",
            data: {
                "title": title,
                "description": description,
                "dompath": dompath,
                "etc_val": etc_val,
                "trigger": trigger,
                "is_init_document": is_init_document,
                "prev": prev,
                "document": documents,
                //"auth_token": get_saved_token()
                //"testArgs": "test"    // 여기에 innerHTML 넣기

            },
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
            },
        })
            .done(function(data) {
                console.log('self.bubblecount');
                self.bubble_num = data.id;
                self.push_realid();
                self.bubblecount++;
                console.log(self.bubblecount);

                self.is_save = true;
                //callback_success();

            })
            .fail(function() {
                // do something...
            });
    },

    post_new_centerbubble: function(title, description, dompath, etc_val, trigger, is_init_document, documents, callback_success) { //make bubbles 중간에 버블 추가 
        console.log('center');
        var self = this;
        $.ajax({
            url: "http://175.126.232.145:8000/api-list/bubbles/" + self.Current_bubblenext + "/insert/",
            type: "POST",
            data: {
                "title": title,
                "description": description,
                "dompath": dompath,
                "etc_val":etc_val,
                "trigger": trigger,
                "is_init_document": is_init_document,
                "document": documents,
                //"auth_token": get_saved_token()

            },
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
            },
        })
            .done(function(data) {
                console.log('self.bubblecount');
                self.bubble_num = data.id;
                self.push_realid();
                self.bubblecount++;
                console.log(self.bubblecount);


                self.is_save = true;
                //callback_success();
            })
            .fail(function() {
                // do something...
            });
    },

    //delete
    delete_bubble: function(bubbleid) { //make tutorials
        var self = this;
        $.ajax({
            url: "http://175.126.232.145:8000/api-list/bubbles/" + bubbleid + "/remove/",
            type: "DELETE",
            data: {},
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
            },
        })
            .done(function(data) {
                //console.log(data);
                console.log('1');
            })
            .fail(function() {
                // do something...
            });
    },

    //change
    change_bubble: function(dragid, dropid) { //make tutorials
        var self = this;
        $.ajax({
            url: "http://175.126.232.145:8000/api-list/bubbles/" + dragid + "/change/",
            type: "POST",
            data: {
                "target": dropid,
            },
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
            },
        })
            .done(function(data) {
                console.log(data);

            })
            .fail(function() {
                // do something...
            });
    },



    //patch
    putch_publish_tutorials: function(id) {
        var self = this;
        $.ajax({
            url: "http://175.126.232.145:8000/api-list/tutorials/" + id.toString() + "/",
            type: "PATCH",
            data: {
                "is_finish": true,
                //"auth_token": get_saved_token()
            },
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
            },
        })
            .done(function() {
                // do something...
                //location.reload();
            })
            .fail(function() {
                // do something...
            });
    },

    putch_new_bubble: function(id, title, description, dompath,etc_val, trigger) { //bubble수정 
        var self = this;
        console.log('abc');
        $.ajax({
            url: "http://175.126.232.145:8000/api-list/bubbles/" + id + "/",
            type: "PATCH",
            data: {
                "title": title,
                "description": description,
                "etc_val":etc_val,
                "dompath": dompath,
                "trigger": trigger,
                // "auth_token": get_saved_token()
            },
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
            },
        })
            .done(function() {
                // do something...
                //location.reload();
            })
            .fail(function() {
                // do something...
            });
    }

};
