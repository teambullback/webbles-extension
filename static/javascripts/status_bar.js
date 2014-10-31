//빌드모드 statusbar 
function statusbar() {
    this.token_load = new status_server();
    this.sb = new status_build();
    this.su = new status_user();
};

statusbar.prototype = {
    sb: null,
    su: null,
    //tutorial_num : null,
    token_load: null, //token 객체 

    //methods
    add_statusbar: function() {
        var self = this;
        
        this.token_load.get_auth_token("guest", "guest");

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



        ///User mode
        $('#bubblemap_trigger').bind('click', function() { 
            self.su.statususer_trigger();
        });

        $('#leftScroll_user').bind('click', function() { 
            self.su.leftScroll_user();
        });
        $('#rightScroll_user').bind('click', function() { 
            self.su.rightScroll_user();
        });

        $('#myStatus_user').bind('mouseover', function() { 
            self.su.statusContent_mouseover();
        });
         $('#myStatus_user').bind('mouseleave', function() { 
            self.su.statusContent_mouseleave();
        });

        



        $('#statususer_trigger').bind('click', function() { //지울거  
            self.su.statususer_trigger();
        });
        $('#go_first').bind('click', function() { //지울거  
            self.su.go_first();
        });
        $('#exit').bind('click', function() { //지울거  
            self.su.ale();
        });
    },

    createNewTutorial: function() { //빌드모드
        //post로 튜토리얼 생성 
        var self = this;
        $.ajax({
            url: "https://webbles.net/api-list/tutorials/",
            type: "POST",
            data: {
                "title": 'title',
                "description": 'description',
                "site": 1,
            },
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "JWT " + self.token_load.get_saved_token().token);
            },
        })
            .done(function(data) {
                
                self.tutorial_num = data.id
                self.sb.tutorial_num = self.tutorial_num; //빌더모드에 넣어주기
                var jsontext = {
                    "bubbles": null,
                    "documents": null,
                };
                var contact = JSON.stringify(jsontext);
                chrome.storage.local.set({
                    tutorials: contact
                });

                self.sb.letToggleMode(false, document); //빌드모드 시작하기 

                //tutorial_num 갖고있기위해 저장해주는 
                chrome.runtime.sendMessage({
                    tutorial_id_established: "tutorial_id_established",
                    tutorial_id: data.id
                }, function(response) {
                    
                });
            })
            .fail(function() {
                // do something...
            });
    },

    user_refresh: function(selectList) { //유저모드 
        //튜토리얼 내용 서버에서 받아와서 넣어주기
        //추가로 로컬 튜토리얼을 사용할지 서버 튜토리얼을 사용할지 물어보는것도 추가할 수 있다. 

        
/*
        //모든 값 다 지워주기 
        $('#myStatus_all').remove();
        //값 다 지워주기 초기화 
        var dum_div = [
            '<div id="myStatus_all"></div>'
        ].join('\n');
        $(dum_div).appendTo('#myStatus_user');*/

        $('#leftScroll_image').attr('src', chrome.extension.getURL('static/img/Btn_Arrow_left.png'));
        $('#rightScroll_image').attr('src', chrome.extension.getURL('static/img/Btn_Arrow_right.png'));
        //$('#leftScroll_image').css("background-image", "url('" + chrome.extension.getURL('static/img/Btn_Arrow_left.png').toString() + "')");
        //$('#rightScroll_image').css("background-image", "url('" + chrome.extension.getURL('static/img/Btn_Arrow_right.png').toString() + "')");

        $('#bubblemap_trigger').css("background-image", "url('" + chrome.extension.getURL('static/img/Btn_map.png').toString() + "')");


        
        this.su.add_bubble_user(selectList);
    },


/*
    loginModal: function(signin_url) {
        var self = this;
        $.ajax({
            url: chrome.extension.getURL('static/pages/loginCheckModal.html'),
            success: function(data) {
                $(data).appendTo('body');
                $('#__goDumber__popover__myLoginModal').modal('show');

                $('#__goDumber__popover__start').bind('click', function() {
                    location.reload();
                    self.add_statusbar();
                    self.user_refresh(null);
                });
                $('#__goDumber__popover__login').bind('click', function() {
                    chrome.runtime.sendMessage({
                        type: "move_to_login_page",
                        data: signin_url
                    }, function(response) {
                    });
                    //alert("로그인을 하신 후 다시 실행해 주세요! 불편을 드려 죄송합니다!")
                    //location.href = signin_url;
                });
            },
            fail: function() {
                throw "** COULD'T GET TEMPLATE FILE!";
            }
        });
    }
*/
};