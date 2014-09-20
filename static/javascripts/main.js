// manifest.json에서 background로 등록되어 있음. 상시적으로 멈추지 않고 돌아가며,
// chrome://extensions에서 백그라운드를 누르면 developer console을 볼 수 있음
// 1. initialize_builder_mode
// 2. reload_builder_mode
// 3. initialize_user_mode: 처음 특정 탭에서 유저모드로 진입할 시 메시지 전송
// 4. reload_user_mode: 유저모드일 때 새로운 콘텐츠 스크립트가 생성되면 메시지 전송
// 5. user_mode_initialize_failed: 유저모드를 처음으로 실행할 시(initialize_user_mode) element path를 못 찾게 되면 메시지 전송
// 6. try_finding_element_path: 유저모드를 실행하고 첫 클릭 이후는, 관련 객체가 메시지를 통해 전달된 이후이므로 이 메시지를 전송함

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


// ****** 유저모드 스위치 ****** //
var isUserModeInitialized = false;
var isUserMode = false
var userModeReloadedNumber = 0;
// 유저모드를 처음으로 시작한 tab의 id값
var currentUserModeTab;
// 유저모드를 시작하였을 시 참조한 튜토리얼의 고유한 서버 저장  id값
var currentUserModeTutorialNum;
// 현재 유저모드를 처음으로 시작한 tab의 id값인 currentUserModeTab의 값과 현재
// 유저가 보고 있는 tab의 id값이 같으면 true로 나오고, 아니면 false로 나오는 스위치
var isAtUserTab = true;
// selectList, bubbleList, currentSelectlist는 "try_finding_element_path" 메시지를 보내기 전에
// status_bar_user.js에서 postMessage로 보내는 현재 진행되고 있는 튜토리얼 객체에 대한 정보 
var selectList;
var bubbleList;
var currentSelectList;
// element path를 찾지 못해서 발생한 에러의 누적 횟수로
// content script가 reload된 것을 기준으로 해서 초기화된다. 
var elementPathErrorNumber = 0;


// ****** 빌더모드 스위치 ****** //
var isBuilderMode = false;
var myTutorialId;
var builderModeActiviated = false;
var clickEventAdded = false;
var isBuilderTab = false;
// 빌더모드를 처음으로 시작한 tab의 id값
var builder_tab;
// 현재 사용자가 보고 있는 tab의 id값
var current_tab;
var trigger_list = [];






// ****** 빌더모드: 튜토리얼 생성되었을 시 튜토리얼id 받아오는 부분 ****** //
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
            currentUserModeTab = msg.data;
        }
    });
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
                elementPathErrorNumber = 0;
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
            elementPathErrorNumber++;
            // 어떤 저장된 element path를 0.3초 이후에도 찾지 못했을 경우(300번 동안 못찾은 경우)
            // 에러 메시지를 발생시키며 차후 미식별 원인을 분류하여 따로 처리할 필요가 있음 (서버와도 연동)
            if (elementPathErrorNumber > 100) {
                userModeReloadedNumber = 0;
                elementPathErrorNumber = 0;
                isUserMode = false;
                throw "ELEMENT CANNOT BE FOUND";
            }
            if (userModeReloadedNumber !== 0) {
                console.log("TRY FINDING ELEMENT PATH");
                window.setTimeout(function() {
                    chrome.tabs.sendMessage(currentUserModeTab, {
                        type: "try_finding_element_path",
                        data_1: selectList,
                        data_2: bubbleList
                    }, function(response) {});
                }, 100);
            } else {
                console.log("USER MODE INITIALIZED FAILED");
                if (typeof currentUserModeTab !== "undefined") {
                    chrome.tabs.sendMessage(currentUserModeTab, {
                        type: "user_mode_initialize_failed"
                    }, function(response) {});
                }
                userModeReloadedNumber++;
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
            isUserMode = false;
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
    }
});