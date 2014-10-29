$("head").prepend("<style type='text/css'> @font-face { font-family: 'NanumGothic'; src: url('" + chrome.extension.getURL('static/fonts/NanumGothic.woff') + "') format('woff');");
$("head").prepend("<style type='text/css'> @font-face { font-family: 'NanumBarunGothic'; src: url('" + chrome.extension.getURL('static/fonts/NanumBarunGothic.woff') + "') format('woff');");
$("head").prepend("<style type='text/css'> @font-face { font-family: 'BM-JUA'; src: url('" + chrome.extension.getURL('static/fonts/BM-JUA.woff') + "') format('woff');");

var contentScriptsPort = chrome.runtime.connect({
    name: "contentScripts"
});

// content_firer.js는 content_scripts 중 하나로 chrome tab이 새롭게 loading되면 
// 다른 content_script들과 함께 자동으로 그 페이지에 삽입됩니다.
var builderModeActiviated = false;
var st = null;

//****** Helper Function ******//
function checkAndBuildStatusBar() {
    if (st === null) {
        st = new statusbar();
        st.add_statusbar();
    } else {
        return
    }
}
//****** Helper Function ******//

function loginModal(signin_url) {
    $.ajax({
        url: chrome.extension.getURL('static/pages/loginCheckModal.html'),
        success: function(data) {
            $(data).appendTo('body');

            $('#__goDumber__popover__myLoginModal').modal({
                backdrop: 'static',
                keyboard: false
            });

            var refreshIntervalId = setInterval(function() {
                $("#__goDumber__popover__myLoginModal .modal-header h4").effect("bounce", "slow");
            }, 4000);

            $('#__goDumber__popover__start').bind('click', function() {
                clearInterval(refreshIntervalId);
                chrome.runtime.sendMessage({
                    type: "initialize_user_mode_from_modal",
                    data: window.location.href
                }, function(response) {});
            });
            $('#__goDumber__popover__login').bind('click', function() {
                chrome.runtime.sendMessage({
                    type: "move_to_login_page",
                    data: signin_url
                }, function(response) {});
            })
            
          },
        fail: function() {
            throw "** COULD'T GET TEMPLATE FILE!";
        }
    });
};

function endingModal(id) {
    var currentTutorialId = id;
    var nextTutorialId;
    var prevTutorialId;
    $.getJSON("http://175.126.232.145:8000/api-list/tutorials/" + currentTutorialId, {})
        .done(function(data) {
            nextTutorialId = data.next_tutorial_at_category;
            prevTutorialId = data.prev_tutorial_at_category;
            if ($("#currentTutorialId").text() === undefined) {
                $("#currentTutorialId").text(currentTutorialId);
            } else {
                $("body").append("<div id='curTutorialId' style='width: 0'>" + currentTutorialId + "</div>");
            }
            if ($("#prevTutorialId").text() === undefined) {
                $("#prevTutorialId").text(prevTutorialId);
            } else {
                $("body").append("<div id='prevTutorialId' style='width: 0'>" + prevTutorialId + "</div>");
            }
            if ($("#nextTutorialId").text() === undefined) {
                $("#nextTutorialId").text(nextTutorialId);
            } else {
                $("body").append("<div id='nextTutorialId' style='width: 0'>" + nextTutorialId + "</div>");
            }
        })
        .fail(function(jqxhr, textStatus, error) {});
}

//****** Helper Function ******//

chrome.runtime.sendMessage({
    type: "content_script_started"
}, function(response) {});

chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
     if (request.type == "initialize_builder_mode") {
         //builderModeActiviated를 true로 만들어줘서 이후 beforeunload 이벤트가 발생했을 경우, 
         //이 값이 true인 content_scripts를 가진 페이지에서만 confirm 메시지가 뜨게 합니다. 
         console.log("INITIAL BUILD!");
         checkAndBuildStatusBar();
         st.createNewTutorial();
         builderModeActiviated = true;
     } else if (request.refresh_build == "refresh_build") {
         console.log("REFRESH BUILD!");
         checkAndBuildStatusBar();
         st.sb.tutorial_num = request.tutorial_id;
         st.sb.on_refresh();
         st.sb.letToggleMode(true, document);
         builderModeActiviated = true;
     } else if (request.type === "initialize_user_mode") {
        console.log("initialize_user_mode!!!");
        checkAndBuildStatusBar();
        st.su.tutorial_num = request.data_1;
        st.user_refresh(null);
        // endingModal(request.data_1);
     } else if (request.type === "reload_user_mode") {
        console.log("reload_user_mode!!!");
        checkAndBuildStatusBar();
        st.su.tutorial_num = request.data_1;
        st.su.statusTrigger = request.data_3;
        st.su.target_userbubbleid = request.data_2.id;
        st.user_refresh(request.data_2);
        //endingModal(request.data_1);
        } else if (request.type === "generate_login_modal") {
            console.log("generate_login_modal!!!");
            loginModal(request.data);
        } else if (request.type === "generate_ending_modal") {
            console.log("generate_ending_modal!!!");
            st = new statusbar();
            st.su.tutorial_num = request.data; 
            $.getJSON("http://175.126.232.145:8000/api-list/tutorials/" + st.su.tutorial_num, {})
            .done(function(tutorials) {
                self.amountLikes = tutorials.amount_likes;
                self.amountReviews = tutorials.amount_reviews;
                self.amountViews = tutorials.amount_views;
                self.tutorialTitle = tutorials.title;
                self.next_tutorial_num = tutorials.next_tutorial_at_category;
                self.prev_tutorial_num = tutorials.prev_tutorial_at_category;
            })
            .fail(function(jqxhr, textStatus, error) {
                // do something...
            });

            $('#__goDumber__popover__myModal').modal({
                backdrop: 'static',
                keyboard: false
            });
        } else if (request.type === "try_finding_element_path") {
            console.log("TRY FINDING ELEMENT PATH!");
            st.su.um.setSpeechBubbleOnTarget(st.su.current_selected_bubble, function() { //원경이 호출
                $('#content_user' + st.su.current_selected_bubble.id).css('background-color', 'blue');

                if (st.su.current_selected_bubble.next) {
                    for (var list in st.su.bubbles_list) {
                        if (st.su.bubbles_list[list].id == st.su.current_selected_bubble.next) {
                            if (st.su.current_selected_bubble.trigger == 'C') {
                                st.su.select_focusing(st.su.bubbles_list[list], st.su.bubbles_list);
                            } else {
                                st.su.select_focusing(st.su.bubbles_list[list], st.su.bubbles_list);
                            }
                            break;
                        }
                    }
                } else {
                    chrome.runtime.sendMessage({
                        type: "user_mode_end_of_tutorial"
                    }, function(response) {});
                    return;
                }
            });
        } else if (request.type === "isModalClosed") {
            var isModalClosed;
            if ($("#loginCheck").length === 0) {
                sendResponse({
                    type: "no_modal_generated"
                });
            } else if ($("#loginCheck").length > 0) {
                // bootstrap의 모달 창의 display가 평소에는 block인 것을 봐서
                // 만약 block이면 현재 떠있다는 것으로 간주
                if ($("#loginCheck").css("display") === "block") {
                    isModalClosed = false;
                }
                // 만약 none이면 닫힌 것으로 간주.  
                else {
                    isModalClosed = true;
                }
                // 현재 모달창이 닫혀있는지, 열려있는지를 봐서
                // 그 상태를 sendResponse 객체로 다시 전송 
                sendResponse({
                    type: "is_modal_closed",
                    data: isModalClosed
                });
            }
        }
    });

// beforeunload 이벤트가 발생 시 감지하는 jQuery 부분 
$(window).on('beforeunload', function(event) {
    if (builderModeActiviated === true) {
        if (st.sb.clickEventSaved === true) {
            builderModeActiviated = false;
            st.sb.clickEventSaved = false;
            // <=== 여기에 창연이쪽 save하는 함수를 집어넣어야 함
            chrome.runtime.sendMessage({
                builderModeActiviated: "builderModeActiviated"
            }, function(response) {});
            return "가장 최근에 저장하지 않으신 작업이 소실됩니다."
        }
    }
});