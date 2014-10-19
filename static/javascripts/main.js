// ****** main.js 설명 ****** //
// manifest.json에서 background로 등록되어 있음. 상시적으로 멈추지 않고 돌아가며,
// chrome://extensions에서 백그라운드를 누르면 developer console을 볼 수 있음

// ****** 유저모드 로직 설명 ****** //
// Content Script가 새롭게 만들어질 때마다 메시지 보내서 status_build, status_user 객체 등 생성하여 버블을 포커싱할 준비를 마침
// 원래 순서대로 계속 나가되, Element path 못 찾으면 0.1초 후에 계속 메시지 발화 (그러나 첫 번째 유저모드 구현 시에는 다른 메시지)

// ****** 유저모드 스위치 ****** //
// 유저모드를 처음 실행 할 시 삽입되는 Content Script를 따로 식별하기 위한 스위치
// 이 스위치와 isUserMode는 서로 상반된 값을 가지고 켜지게 되며, 만약 isUserModeInitialized가 true일 경우에는
// "initialize_user_mode" 메시지가 command_handler.js로 보내지게 됩니다. 
var isUserModeInitialized = false;
// 유저모드 첫 실행 후 클릭 액션으로 인하여 재삽입된 Content Script를 식별하기 위한 스위치
var isUserMode = false
var nowIsUserTab = false;
// 유저모드를 처음으로 시작한 tab의 id값
var initial_user_tab;
// 유저모드를 시작하였을 시 참조한 튜토리얼의 고유한 서버 저장 id값
var currentUserModeTutorialNum;
// element path를 찾지 못해서 발생한 에러의 누적 횟수로
// content script가 reload된 것을 기준으로 해서 초기화된다. 
var elementPathErrorNumber = 0;
// nextSelectList와 nextBubblesList는 status_bar_user.js에서 다음 버블 객체와 전체 버블들을 다 보내주는 부분
// 이를 저장해놨다가 다시 command_handler.js로 "reload_user_mode"로 보내서 see_newpreview의 파라미터로 넣어준다.
// 방금 실행한 객체 다음에 실행되어야 할 버블 객체
var nextSelectList;
// 전체 버블 객체들이 모여있는 객체
var nextBubblesList;
// 지금 현재 버블이 만들어진 url에 대한 정보, 매번 버블이 실행될 때마다 업데이트 되며, 현재 빌더모드에는 구현되어있지 않다. 
var currentBubbleURL;
// 유저모드가 실행되는 탭들의 array 
var userModeTabs = [];

function initializeUserMode(moving_url) {
    if (initial_user_tab === undefined) {
        chrome.tabs.create({
            active: true,
            url: moving_url
        }, function(tab) {
            initial_user_tab = tab.id;
            isUserModeInitialized = true;
            isUserMode = false;
        });
    } else {
        chrome.tabs.update(initial_user_tab, {
            active: true,
            url: moving_url
        }, function(tab) {
            initial_user_tab = tab.id;
            isUserModeInitialized = true;
            isUserMode = false;
        });
    }
}
// 처음에 모달을 띄워줄 시 로그인이 되는 사이트인지 안되도 되는 사이트인지 구분하기 위한 스위치값
var reqlogin;
// 처음에 모달을 띄워줬을 시 로그인을 선택할 경우 그 url로 이동시키기 위한 url
var signinURL;

// ****** 빌더모드 스위치 ****** //
var isBuilderMode = false;
var myTutorialId;
var builderModeActiviated = false;
// 현재 보고 있는 탭이 빌더모드를 처음으로 시작한 탭인지를 알려주는 스위치
var nowIsBuilderTab = false;
var initial_builder_tab;

var current_tab;

var isModalClosed;

// ****** 웹과의 통신(웹에서 바로 익스텐션 조작 부분) ****** //
// 현재 사용하지 않고, 차후 본래 유저모드와의 구조적 분리를 위하여 다시 살릴 가능성이 있음
// var tutorialIdFromWeb;

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
    }
);



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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var request = request;
        if (request.type === "content_script_started") {
            // 유저모드에서 클릭 액션 이후, 다른 새로운 탭이 열리지 않았다는 전제 아래
            // content_script가 다시 시작했다는 것은 다시 
            console.log("CONTENT SCRIPT STARTED");
            if (isUserMode === true) {
                console.log("isUserMode is TRUE => RELOAD USER MODE");
                chrome.tabs.sendMessage(initial_user_tab, {
                    type: "reload_user_mode",
                    data_1: currentUserModeTutorialNum,
                    data_2: nextSelectList
                }, function(response) {});
                elementPathErrorNumber = 0;
            } else if (isUserModeInitialized === true) {
                console.log("isUserModeInitialized is TRUE => INITIALIZE USER MODE");
                chrome.tabs.sendMessage(initial_user_tab, {
                    type: "initialize_user_mode",
                    data_1: currentUserModeTutorialNum,
                    data_2: reqlogin,
                    data_3: signinURL
                }, function(response) {});
                userModeTabs.push(current_tab);
                chrome.storage.local.set({
                    initial_user_tab: userModeTabs
                });
                isUserModeInitialized = false;
                isUserMode = true;
            }
            if (isBuilderMode === true && nowIsBuilderTab === true) {
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
        }

        // 만약 element path가 작동하지 않아서 element를 못 찾으면 여기로 메시지가 전달됨
        else if (request.type === "element_not_found") {
            elementPathErrorNumber++;
            // 어떤 저장된 element path를 0.5초 이후에도 찾지 못했을 경우(50번 동안 못찾은 경우)
            // 에러 메시지를 발생시키며 차후 미식별 원인을 분류하여 따로 처리할 필요가 있음 (서버와도 연동)
            if (elementPathErrorNumber > 50) {
                elementPathErrorNumber = 0;
                isUserMode = false;
                throw "ELEMENT CANNOT BE FOUND";
            }
            console.log("TRY FINDING ELEMENT PATH");
            window.setTimeout(function() {
                chrome.tabs.sendMessage(initial_user_tab, {
                    type: "try_finding_element_path",
                }, function(response) {});
            }, 100);
        }

        // 유저모드가 끝날 시 (status_bar_user 183번째 줄) 메시지가 이쪽으로 전달되서
        // isUserMode 스위치를 false로 만들어줌
        else if (request.type === "user_mode_end_of_tutorial") {
            console.log("USER MODE END OF TUTORIAL")
            isUserMode = false;
            nowIsBuilderTab = false;
            userModeReloadedNumber = 0;
        } else if (request.type === "isModalClosed") {
            isModalClosed = request.data;
        } else if (request.type === "move_to_login_page") {
            isUserMode = false;
            chrome.tabs.create({
                active: true,
                url: request.data
            }, function(tab) {
                isUserMode = true;
                alert("이 페이지에서 로그인 이후에 시작해주세요!");
            });
        }
    });

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg.type === "next_bubble") {
            nextSelectList = msg.data_1;
            nextBubblesList = msg.data_2;
        } else if (msg.type === "current_bubble_url") {
            currentBubbleURL = msg.data;
        } else if (msg.type === "change_focused_bubble") {
            var moving_url = msg.data_1;
            nextSelectList = msg.data_2;
            chrome.tabs.update({
                url: moving_url
            }, function() {});
        } else if (msg.type === "exit_user_mode") {
            var tabId = current_tab;
            chrome.tabs.update(tabId, {
                url: "http://www.naver.com"
            }, function(tab) {
                var changeStatus = tab.status;
                if (changeStatus === "loading") {
                    if (isUserMode === true) {
                        isUserMode = false;
                        alert("위블즈가 종료되었습니다! 사용에 감사드립니다.");
                    }
                }
            });
        }
        // controllers.js에서 유저모드가 곧 실행된다는 것을 알려준다.
        // 여기서 isUserModeInitialized 스위치를 true로 해줘서, Content Script가 로딩될 경우
        // 실제로 거기에 메시지를 보내게 해준다.  
        else if (msg.type === "initialize_user_mode") {
            console.log("INITIALIZE USER FROM EXTENSION");
            if (initial_user_tab !== undefined) {
                if (initial_user_tab !== initial_builder_tab) {
                    initializeUserMode(msg.data_3);
                    currentUserModeTutorialNum = msg.data_2;
                    reqlogin = msg.data_4;
                    signinURL = msg.data_5;
                } else {
                    alert("빌더모드와 유저모드는 같은 탭에서 실행될 수 없습니다.");
                    initial_user_tab = undefined;
                }
            } else {
                initializeUserMode(msg.data_3);
                currentUserModeTutorialNum = msg.data_2;
                reqlogin = msg.data_4;
                signinURL = msg.data_5;
            }
        } else if (msg.type === "initialize_builder_mode") {
            console.log("INITIALIZE BUILDER FROM EXTENSION");
            initial_builder_tab = current_tab;
            if (initial_builder_tab !== initial_user_tab) {
                chrome.tabs.sendMessage(msg.data, {
                    type: "initialize_builder_mode"
                }, function(response) {});
                chrome.storage.local.set({
                    initial_builder_tab: current_tab
                });
                nowIsBuilderTab = true;
                isBuilderMode = true;
            } else {
                alert("빌더모드와 유저모드는 같은 탭에서 실행될 수 없습니다.");
                initial_builder_tab = undefined;
            }
        } else if (msg.type === "terminate_builder") {
            isBuilderMode = false;
            nowIsBuilderTab = false;
        } else if (msg.type === "user_mode_initialized_from_web") {
            // ****** 웹과의 통신(웹에서 바로 익스텐션 조작 부분) ****** //
            // website_communication.js에서 웹사이트에서 가져온 데이터를 다시 main.js로 쏴주는 부분
            // 이 메시지를 받고 새로운 탭을 생성해주며, 이 탭에 해당 튜토리얼에 대한 유저모드가 바로 실행될 수 있도록 해줌
            currentUserModeTutorialNum = msg.data_1;
            initializeUserMode(msg.data_2);
        }
    });
});

chrome.tabs.onUpdated.addListener(function(tabs, changeInfo, tab) {
    var updatedTabId = tabs;
    var changeStatus = changeInfo.status;
    var changedURL = tab.url;

    // 새로운 탭이 열렸고, 그 탭이 빈 탭일 경우 기존의 최우측 탭과 id값을 공유함으로 인해
    // 발생하는 문제를 체크하기 위한 함수 
    function newTabCheck(changedURL) {
        var regex = /\/newtab/g;
        var firstMatch = regex.exec(changedURL);
        if (regex.lastIndex !== 0) {
            console.log("URL IS ===>!!! ", regex.lastIndex);
            return false;
        }
        return true;
    }

    function URLCheck(changedURL) {
        var currentBubbleURLRegex = parseUri(currentBubbleURL);
        var changedURLRegex = parseUri(changedURL);
        var keyVarificationSwitch = false;
        console.log("VERICIATION ===> ", currentBubbleURLRegex.host, changedURLRegex.host);
        if (currentBubbleURL !== changedURL) {
            if (currentBubbleURLRegex.host === changedURLRegex.host) {
                return false;
            } else {
                return true    
            }
            // Object.keys(currentBubbleURLRegex.queryKey).forEach(function(key) {
            // });
        } else {
            return false
        }
    }

    if (changeStatus === "complete") {
        chrome.tabs.sendMessage(updatedTabId, {
            type: "isModalClosed"
        }, function(response) {
            isModalClosed = response.data;
            if (!isModalClosed) {
                return;
            } else {
                if (updatedTabId === initial_user_tab && URLCheck(changedURL)) {
                    if (newTabCheck(changedURL)) {
                        if (isUserMode === true) {
                            isUserMode = false;
                            initial_user_tab = undefined;
                            chrome.tabs.reload(function() {
                                alert("예기치 못한 url변경으로 위블즈가 종료되었습니다!");
                            });
                        }
                    }
                }
            }
        });
    }
});

// 탭이 바뀔 때마다 원래 유저모드나 빌더모드가 처음 실행된 탭과 비교해주는 부분
chrome.tabs.onActivated.addListener(function(activeInfo) {
    current_tab = activeInfo.tabId;
    chrome.storage.local.get('initial_builder_tab', function(data) {
        if (data.initial_builder_tab) {
            initial_builder_tab = data.initial_builder_tab;
        }
    });
    if (initial_builder_tab !== undefined) {
        if (current_tab === initial_builder_tab) {
            nowIsBuilderTab = true;
            console.log("NOW IS A BUILDER TAB!");
        } else if (current_tab !== initial_builder_tab) {
            nowIsBuilderTab = false;
            console.log("NOW IS NOT A BUILDER TAB!");
        }
    }
    if (initial_user_tab !== undefined) {
        if (current_tab === initial_user_tab) {
            nowIsUserTab = true;
            console.log("NOW IS A USER TAB!");
        } else if (current_tab !== initial_user_tab) {
            nowIsUserTab = false;
            console.log("NOW IS NOT A USER TAB!");
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    if (tabId === initial_user_tab) {
        initial_user_tab = undefined;
        alert("위블즈 유저모드가 종료되었습니다.");
    }
});