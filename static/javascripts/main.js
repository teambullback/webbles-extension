// manifest.json에서 background로 등록되어 있음. 상시적으로 멈추지 않고 돌아가며,
// chrome://extensions에서 백그라운드를 누르면 developer console을 볼 수 있음
// 1. initialize_builder_mode
// 2. reload_builder_mode
// 3. initialize_user_mode
// 4. reload_user_mode

// User Mode: Click을 했을 시 
// 1. (화면 상) 아무것도 안변하는 것
// 2. (CSS) display: none => display: block
// 3. (크롬 API를 활용 시) chrome.tabs.onUpdated 이벤트가 호출되는 상황 (MVC모델 등에서 발생)
// 4. (Extension 상에서) Content Script 자체가 다시 재삽입(초기화)되는 상황
// 5. 페이지가 다 로딩되고 난 이후에도 ajax콜로 특정 정보가 홈페이지에 동적으로 삽입되는 상황
// 5 => 3 => 4 => 1,2 (element path)

// Content Script가 새롭게 만들어질 때마다 준비 (그러나 첫 번째 유저모드 구현과 재구현은 command_handler.js에서 처리하는 방식이 다름)
// Element path 못 찾으면 0.1초 후에 계속 메시지 발화 (그러나 첫 번째 유저모드 구현 시에는 다른 메시지)


// TODO:
// 1. ELEMENT PATH가 계속 올라갈 때 VALIDATION하는 부분 추가 구현 (이 부분도 튜토리얼이 종료된 것과 같은 것으로 간주하여 각종 스위치 초기화)
// 2. main.js를 초기화하는 부분이 필요: 만약 에러 메시지가 어떤 부분에서 발행했으면, 에러 메시지르 띄워주고 유저 모드의 스위치들을 초기화해줘야 함


var isUserMode = false
var userModeReloadedNumber = 0;
var currentUserModeTab;
var currentUserModeTutorialNum;


var isBuilderMode = false;


var isUserModeInitialized = false;





// =====<SECTION 1>=====
var myTutorialId;
// =====<SECTION 1>=====


// =====<SECTION 2>=====
var builderModeActiviated = false;
// =====<SECTION 2>=====






// =====<SECTION 3>=====
var clickEventAdded = false;
var isBuilderTab = false;
var selectList;
var bubbleList;
var builder_tab;
var current_tab;
var trigger_list = [];
// =====<SECTION 3>=====





// =====<SECTION 4>=====
var currentSelectList;
var current_tutorial_id;
// =====<SECTION 4>=====







// =====<SECTION 1>=====
// content_scripts단의 status_bar_build.js에서 tutorial_num에 data.id가 대입되면
// 그 tutorial_num값을 받아와서 tutorial_id에 저장하는 부분
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var request = request;
        if (request.tutorial_id_established === "tutorial_id_established") {
            myTutorialId = request.tutorial_id;
            chrome.storage.local.set({
                tutorial_id: request.tutorial_id
            });
            sendResponse({
                success: "success receiving tutorial_id"
            });
        }
    });
// =====<SECTION 1>=====








// =====<SECTION 2>=====
// content_scripts단에 있는 content_firer.js로부터 사용자가 beforeunload 이벤트를 
// 촉발시켰음을 듣고, 만약 background단에서도 똑같은 이벤트가 관측될 경우, popup.html을 제어하는 controllers.js에서
// 제작모드가 종료된 상황의 아이콘 등을 불러와서 popup.html을 꾸미도록 하는 부분 
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.builderModeActiviated === "builderModeActiviated") {
            builderModeActiviated = true;
        }
    });

chrome.tabs.onUpdated.addListener(function() {
    if (builderModeActiviated === true) {
        builderModeActiviated = false;
        chrome.storage.local.set({
            "twoWaySetter": 0
        });
    }
});

chrome.tabs.onRemoved.addListener(function() {
    if (builderModeActiviated === true) {
        builderModeActiviated = false;
        chrome.storage.local.set({
            "twoWaySetter": 0
        });
    }
});
// =====<SECTION 2>=====






// =====<SECTION 3>=====
chrome.tabs.onActivated.addListener(function(activeInfo) {
    current_tab = activeInfo.tabId;
    //console.log("current tab id from main.js =>", current_tab);
    chrome.storage.local.get('current_tab_real', function(data) {
        if (data.current_tab_real) {
            builder_tab = data.current_tab_real;
        }
    });
    if (current_tab === builder_tab) {
        isBuilderTab = true;
        //console.log("current_tab is a builder_tab");
    } else {
        isBuilderTab = false;
        //console.log("current_tab is NOT a builder_tab");
    }
})

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg.type === "initial_build") {
            chrome.storage.local.set({
                current_tab_real: current_tab
            });
            isBuilderTab = true;
        } else if (msg.type === "current_tutorial_id") {
            current_tutorial_id = msg.data;
        }
    });
    //port.postMessage("Hi Popup.js");
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var request = request;
        if (request.type === "trigger_event") {
            if (request.data === "C") {
                clickEventAdded = true;
                trigger_list.push("C");
                //console.log("CLICK EVENT saved");
            } else if (request.data === "N") {
                clickEventAdded = false;
                trigger_list.push("N");
                //console.log("NEXT EVENT saved");
            }
        } else if (request.type === "content_script_started") {
            // 유저모드에서 클릭 액션 이후, 다른 새로운 탭이 열리지 않았다는 전제 아래
            // content_script가 다시 시작했다는 것은 다시 
            console.log("CONTENT SCRIPT STARTED");
            if (isUserMode === true) {
                console.log("isUserMode is TRUE => RELOAD USER MODE");
                chrome.tabs.sendMessage(currentUserModeTab, {
                    type: "reload_user_mode",
                    data_1: currentUserModeTutorialNum,
                    data_2: currentSelectList
                }, function(response) {});
                userModeReloadedNumber++;
            } else if (isUserModeInitialized === true) {
                console.log("isUserModeInitialized is TRUE => INITIALIZE USER MODE");
                chrome.tabs.sendMessage(currentUserModeTab, {
                    type: "initialize_user_mode",
                    data: currentUserModeTutorialNum
                }, function(response) {});
                isUserModeInitialized = false;
                isUserMode = true;
            }
        }

        // 만약 element path가 작동하지 않아서 element를 못 찾으면 여기로 메시지가 전달됨
        else if (request.type === "element_not_found") {
            console.log("ELEMENT NOT FOUND");
            if (userModeReloadedNumber === 0) {
                window.setTimeout(function() {
                    chrome.tabs.sendMessage(currentUserModeTab, {
                        type: "try_finding_element_path",
                        data_1: selectList,
                        data_2: bubbleList
                    }, function(response) {});
                }, 100);
            } else {
                chrome.tabs.sendMessage(currentUserModeTab, {
                    type: "user_mode_initialize_failed"
                }, function(response) {});
            }
        }

        // 유저모드가 끝날 시 (status_bar_user 183번째 줄) 메시지가 이쪽으로 전달되서
        // isUserMode 스위치를 false로 만들어줌
        else if (request.type === "user_mode_end_of_tutorial") {
            console.log("USER MODE END OF TUTORIAL")
            isUserMode = false;
            userModeReloadedNumber = 0;
        }
    });

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg.type === "clickButtonClicked") {
            selectList = msg.data_1;
            bubbleList = msg.data_2;
            chrome.tabs.sendMessage(currentUserModeTab, {
                type: "try_finding_element_path",
                data_1: selectList,
                data_2: bubbleList
            }, function(response) {});
        } else if (msg.type === "selectlist") {
            currentSelectList = msg.data;
        } else if (msg.type === "initialize_user_mode") {
            console.log("INITIALIZE USER FROM EXTENSION");
            isUserModeInitialized = true;
            currentUserModeTab = msg.data_1;
            currentUserModeTutorialNum = msg.data_2;
        }
    });
});

chrome.tabs.onUpdated.addListener(function(tabs, changeInfo, tab) {
    var updatedTabId = tabs;
    var changeStatus = changeInfo.status;
    var changedTab = tab;
    if (clickEventAdded === true && isBuilderTab === true) {
        var refresh_build_message = {
            "refresh_build": "refresh_build",
            "tutorial_id": myTutorialId
        };
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, refresh_build_message, function(response) {});
        });
        // chrome.storage.local.get("twoWaySetter", function(data){
        // 	if(data.twoWaySetter===1){
        // 		var refresh_build_message = {
        // 			"refresh_build": "refresh_build",
        // 			"tutorial_id": myTutorialId
        // 		};
        // 		chrome.tabs.sendMessage(current_tab, refresh_build_message, function(response) {});
        // 	};
        // });
    }
    // chrome.storage.local.get("current_user_tab", function(data){
    // 	var current_user_tab = data.current_user_tab;
    // 	// var current_tutorial_id;
    // 	// chrome.storage.local.get("current_tutorial_id", function(data){
    // 	// 	current_tutorial_id = data.current_tutorial_id;
    // 	// 	console.log("Current Tutorial ID!!!!!!!!!!!", current_tutorial_id)
    // 	// });
    // 	if(updatedTabId === current_user_tab) {
    // 		if(clickButtonClicked === true){
    // 			if(changeStatus === "complete"){
    // 				window.setTimeout(function(){
    // 					if(onBeforeCount === 0){
    // 						chrome.tabs.sendMessage(current_user_tab, {type: "refresh_user", data_1: selectList, data_2: bubbleList, data: current_tutorial_id, currentSelectList: currentSelectList}, function(response){});
    // 						clickButtonClicked = false;
    // 						onBeforeCount = 0;
    // 						onCompletedCount = 0;
    // 					} else {
    // 						return;
    // 					}
    // 				}, 200);
    // 				console.log("TAB UPDATED!!!!!!!!!!!!!!!!!!!!!!!!!!! ANYWAYS");
    // 			}
    // 		}
    // 	}
    // })
});
// =====<SECTION 3>=====


// 클릭 이벤트가 저장되었을 때 사용자는 
// 1) 다른 탭으로 가서 딴짓을 한다. -> 식별 가능 
// 2) 그 타겟을 클릭한다. 
// 3) 종료한다. -> 문제 없음

// 그 타겟을 클릭하였을 경우
// 1) 탭이 업데이트 되거나
// -> 바로 그 탭인지를 확인 후 
// -> 새롭게 bar build
// 2) 새로운 탭이 생기면서 그쪽으로 이동된다.
// -> 새롭게 bar build 
// 3) 아무런 일도 생기지 않고 그 페이지 안에서 일이 처리된다.

// 아무런 일도 생기지 않고 그 페이지 안에서 일이 처리된다. 
// 1) 새롭게 클릭을 저장한다. 
// -> 기존에 true명 true로 놓고
// -> 기존에 false면 true로 놓는다. 
// 2) 새롭게 넥스트를 저장한다.
// -> 기존에 true면 false로 놓고
// -> 기존에 false면 false로 놓는다.
// 3) 다른 페이지로 이동할 경우
// -> trigger를 false로 설정한다.    


// 이 부분에서 뭔가 익셉션이 발생하면, 다른 코드가 정상적으로 작동하는 이슈가 있는데, 
// 좋다. 신난다! 그리고 위에서 뭔가 콜백이 쌓였따가 얘 때문에 안 작동하는 사이, 다른 애들이 치고 와서 되는 것 같다.
// chrome.webRequest.onResponseStarted.addListener(function(details){
// 	console.log("THIS IS SPARTA!!!!!!!!!!!!!!!!!!", details);
// });



// chrome.webRequest.onBeforeRequest.addListener(function(details) {
//     if (clickButtonClicked === true) {
//         onBeforeCount++;
//         webRequestList[webRequestList.length] = details.requestId;
//     }
// }, {
//     urls: ["<all_urls>"],
//     types: ["main_frame", "sub_frame", "xmlhttprequest"]
// });

// chrome.webRequest.onCompleted.addListener(function(details) {
//     if (clickButtonClicked === true) {
//         webRequestList.pop();
//         onCompletedCount++;
//         if (webRequestList.length === 0) {
//             chrome.tabs.query({
//                 active: true,
//                 currentWindow: true
//             }, function(tabs) {
//                 chrome.tabs.sendMessage(tabs[0].id, {
//                     type: "refresh_user",
//                     data_1: selectList,
//                     data_2: bubbleList,
//                     data: current_tutorial_id,
//                     currentSelectList: currentSelectList
//                 }, function(response) {});
//                 console.log("It worked!!!!!!!!!!! yahoo")
//             });
//             clickButtonClicked = false;
//             onBeforeCount = 0;
//             onCompletedCount = 0;
//         } else if (onCompletedCount === 3) {
//             chrome.tabs.query({
//                 active: true,
//                 currentWindow: true
//             }, function(tabs) {
//                 chrome.tabs.sendMessage(tabs[0].id, {
//                     type: "refresh_user",
//                     data_1: selectList,
//                     data_2: bubbleList,
//                     data: current_tutorial_id,
//                     currentSelectList: currentSelectList
//                 }, function(response) {});
//                 console.log("It worked!!!!!!!!!!! yahoo")
//             });
//             clickButtonClicked = false;
//             onBeforeCount = 0;
//             onCompletedCount = 0;
//         }
//     }

// }, {
//     urls: ["<all_urls>"],
//     types: ["main_frame", "sub_frame", "xmlhttprequest"]
// }); // <all_urls>