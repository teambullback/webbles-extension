var contentScriptsPort = chrome.runtime.connect({
    name: "contentScripts"
});

// contentScripts.postMessage({
//     type: "hello"
// });

// content_firer.js는 content_scripts 중 하나로 chrome tab이 새롭게 loading되면 
// 다른 content_script들과 함께 자동으로 그 페이지에 삽입됩니다.
var builderModeActiviated = false;
var sb;

chrome.runtime.sendMessage({
    type: "content_script_started"
}, function(response) {});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.initial_build == "initial_build") {
            //builderModeActiviated를 true로 만들어줘서 이후 beforeunload 이벤트가 발생했을 경우, 
            //이 값이 true인 content_scripts를 가진 페이지에서만 confirm 메시지가 뜨게 합니다. 
            sb = new status_build();
            sb.add_Statusbar();
            sb.createNewTutorial();
            builderModeActiviated = true;
        } else if (request.refresh_build == "refresh_build") {
            if (sb === undefined) {
                var current_tutorial_id;
                sb = new status_build();
                sb.add_Statusbar();
                sb.tutorial_num = request.tutorial_id;
                sb.on_refresh();
                builderModeActiviated = true;
            } else {
                $(document).ready(function() {
                    // $("#controlbar").load(function() {
                    var currentDocument = $(document);
                    // var currentDocument = this;
                    sb.letToggleMode(true, currentDocument);

                    // console.log('doc ready 완료', document); // for debug


                });

            }

        } else if (request.type === "initialize_user_mode") {
            sb = new status_build();
            sb.tutorial_num = request.data;
            sb.add_Statusbar();
            sb.see_preview();
        } else if (request.type === "reload_user_mode") {
            sb = new status_build();
            sb.tutorial_num = request.data_1;
            sb.add_Statusbar();
            sb.see_newpreview(request.data_2);
        } else if (request.type === "try_finding_element_path") {
            sb.status_usermode.select_focusing(request.data_1, request.data_2);
        }

        // else if (request.type == "initial_user") {
        //     // 해당 튜토리얼로 TAB의 주소가 이동하는 것이 구현 필요
        //     // chrome.tabs.update(tabId,{"url":addr});
        //     // alert("INITIAL USER **********************************************************************");
        //     sb = new status_build();
        //     sb.tutorial_num = request.data;
        //     sb.add_Statusbar();
        //     sb.see_preview();
        // } else if (request.type == "refresh_user") {
        //     var myRequest = request;
        //     if (sb !== undefined) {
        //         // $(document).ajaxComplete(function () {
        //         // $(document).ready(function() {
        //         console.log("THIS IS THE DOCUMENT! =======>", document);

        //         //setTimeout(function() {sb.status_usermode.select_focusing(request.data_1, request.data_2);}, 5000);


        //         sb.status_usermode.select_focusing(request.data_1, request.data_2);

        //         //alert('여기서부터 불려지는 내용은 나중에 동적으로 부르는 애들임~~~~~~~~~~');
        //         // });
        //     } else {
        //         sb = new status_build();
        //         sb.tutorial_num = myRequest.data;
        //         console.log("TURORIAL NUM!!!!!!!!=>", sb.tutorial_num);
        //         sb.add_Statusbar();
        //         sb.see_newpreview(request.currentSelectList);
        //     }
        /*
			$('#content_user' + selectlist.id).css('background-color', 'blue');

			console.log('2' + selectlist.dompath);
			if (selectlist.next) {
				for (var list in bubbles_list) {
					if (bubbles_list[list].id == selectlist.next) {
						self.select_focusing(bubbles_list[list], bubbles_list);
						break;
					}
				}
			} else {
				return;
			}*/

    });

// beforeunload 이벤트가 발생 시 감지하는 jQuery 부분 
$(window).on('beforeunload', function(event) {
    if (builderModeActiviated === true) {
        if (sb.clickEventSaved === true) {
            builderModeActiviated = false;
            sb.clickEventSaved = false;
            // <=== 여기에 창연이쪽 save하는 함수를 집어넣어야 함
            chrome.runtime.sendMessage({
                builderModeActiviated: "builderModeActiviated"
            }, function(response) {});
            return "가장 최근에 저장하지 않으신 작업이 소실됩니다."
        }
    }
});