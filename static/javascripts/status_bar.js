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
        console.log('come');
        this.token_load.get_auth_token("admin", "admin");

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

        //클릭 이벤트 Build mode 
        $('#preview').bind('click', function() {
            self.sb.see_preview();
        });
        //$('#cancel').bind('click', function() { 
        //   self.sb.do_cancel();
        //});
        $('#save').bind('click', function() {
            self.sb.direct_save();
        });
        $('#publish').bind('click', function() {
            self.sb.add_publish();
        });
        $('#status_trigger').bind('click', function() {
            self.sb.status_trigger();
        });
        $('#on_refresh').bind('click', function() { //지울거  
            self.sb.on_refresh();
        });

        ///User mode
        $('#statususer_trigger').bind('click', function() { //지울거  
            self.su.statususer_trigger();
        });
        $('#go_first').bind('click', function() { //지울거  
            self.su.go_first();
        });
        $('#exit').bind('click', function() { //지울거  
            self.su.exit();
        });
    },

    createNewTutorial: function() { //빌드모드
        //post로 튜토리얼 생성 
        var self = this;
        $.ajax({
            url: "http://175.126.232.145:8000/api-list/tutorials/",
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
                console.log(data.id);
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
                    console.log(response.success)
                });
            })
            .fail(function() {
                // do something...
            });
    },

    user_refresh: function(selectList) { //유저모드 
        //튜토리얼 내용 서버에서 받아와서 넣어주기
        //추가로 로컬 튜토리얼을 사용할지 서버 튜토리얼을 사용할지 물어보는것도 추가할 수 있다. 


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

        $('#leftScroll_user').css('display', 'none');
        $('#rightScroll_user').css('display', 'none');
        $('#myStatus_user').css('display', 'none');
        $('#controlbar_user').css('display', 'block');

        $('#leftScroll_user').css("background-image", "url('" + chrome.extension.getURL('static/img/left.png').toString() + "')");
        $('#rightScroll_user').css("background-image", "url('" + chrome.extension.getURL('static/img/right.png').toString() + "')");


        this.su.add_bubble_user(selectList);
    }
};