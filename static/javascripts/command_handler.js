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
            console.log("INITIALIZE USER MODE!");
            checkAndBuildStatusBar();
            st.sb.tutorial_num = request.data;
            st.user_refresh(null);
        } else if (request.type === "reload_user_mode") {
            console.log("RELOAD USER MODE!");
            checkAndBuildStatusBar();
            st.sb.tutorial_num = request.data_1;
            console.log("REQUEST DATA 2 ===> ", request.data_2);
            st.user_refresh(request.data_2);
        } else if (request.type === "try_finding_element_path") {
            console.log("TRY FINDING ELEMENT PATH!");
            console.log("CURRENT SELECTED BUBBLE ===>", st.sb.status_usermode.current_selected_bubble)
            st.sb.status_usermode.um.setSpeechBubbleOnTarget(st.sb.status_usermode.current_selected_bubble, function() { //원경이 호출
                $('#content_user' + st.sb.status_usermode.current_selected_bubble.id).css('background-color', 'blue');

                if (st.sb.status_usermode.current_selected_bubble.next) {
                    for (var list in st.sb.status_usermode.bubbles_list) {
                        if (st.sb.status_usermode.bubbles_list[list].id == st.sb.status_usermode.current_selected_bubble.next) {
                            if (st.sb.status_usermode.current_selected_bubble.trigger == 'C') {
                                st.sb.status_usermode.select_focusing(st.sb.status_usermode.bubbles_list[list], st.sb.status_usermode.bubbles_list);
                            } else {
                                st.sb.status_usermode.select_focusing(st.sb.status_usermode.bubbles_list[list], st.sb.status_usermode.bubbles_list);
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