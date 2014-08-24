// manifest.json에서 background로 등록되어 있음. 상시적으로 멈추지 않고 돌아가며,
// chrome://extensions에서 백그라운드를 누르면 developer console을 볼 수 있음




// =====<SECTION 1>=====
var myTutorialId; 
// =====<SECTION 1>=====








// =====<SECTION 2>=====
var builderModeActiviated = false;
// =====<SECTION 2>=====







// =====<SECTION 1>=====
// content_scripts단의 status_bar_build.js에서 tutorial_num에 data.id가 대입되면
// 그 tutorial_num값을 받아와서 tutorial_id에 저장하는 부분
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	var myRequest = request;
    if (myRequest.tutorial_id_established === "tutorial_id_established"){
    	console.log("tutorial id has been established");
    	console.log(myRequest.tutorial_id);
    	myTutorialId = myRequest.tutorial_id;
    	chrome.storage.local.set({tutorial_id:myRequest.tutorial_id});
    	sendResponse({success:"success receiving tutorial_id"});
    }
});

// <=== 조건을 추가해야하는데, 
chrome.storage.local.get("twoWaySetter", function(data){
	if(data.twoWaySetter===1){
		var refresh_build_message = {
			"refresh_build": "refresh_build",
			"tutorial_id": myTutorialId
		};
	};
	// <=== 여기에 빌더모드에서 click 이벤트를 "저장"하였을 경우 새롭게 간 페이지에서 refresh가 되도록 만들어야 합니다. 
});
// =====<SECTION 1>=====





// =====<SECTION 2>=====
// content_scripts단에 있는 content_firer.js로부터 사용자가 beforeunload 이벤트를 
// 촉발시켰음을 듣고, 만약 background단에서도 똑같은 이벤트가 관측될 경우, popup.html을 제어하는 controllers.js에서
// 제작모드가 종료된 상황의 아이콘 등을 불러와서 popup.html을 꾸미도록 하는 부분 
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.builderModeActiviated == "builderModeActiviated"){
    	builderModeActiviated = true;
    }
});

chrome.tabs.onUpdated.addListener(function(){
	if(builderModeActiviated === true){
		builderModeActiviated = false;
		chrome.storage.local.set({"twoWaySetter": 0});
	}
});

chrome.tabs.onRemoved.addListener(function(){
	if(builderModeActiviated === true){
		builderModeActiviated = false;
		chrome.storage.local.set({"twoWaySetter": 0});
	}
});
// =====<SECTION 2>=====





// =====<SECTION 3>=====
// 탭이 이동 시 현재 활성화되어있고, 사용자가 보고 있는 그 탭의 고유한 값인 id값을 알려줌
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	console.log("current tab id =>", tabs[0].id)
});
// =====<SECTION 3>=====
