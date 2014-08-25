// manifest.json에서 background로 등록되어 있음. 상시적으로 멈추지 않고 돌아가며,
// chrome://extensions에서 백그라운드를 누르면 developer console을 볼 수 있음




// =====<SECTION 1>=====
var myTutorialId; 
// =====<SECTION 1>=====








// =====<SECTION 2>=====
var builderModeActiviated = false;
// =====<SECTION 2>=====






// =====<SECTION 3>=====
var clickEventAdded = false;
var isBuilderTab = false;
var builder_tab;
var current_tab;
var trigger_list = [];
// =====<SECTION 3>=====







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
// =====<SECTION 1>=====








// =====<SECTION 2>=====
// content_scripts단에 있는 content_firer.js로부터 사용자가 beforeunload 이벤트를 
// 촉발시켰음을 듣고, 만약 background단에서도 똑같은 이벤트가 관측될 경우, popup.html을 제어하는 controllers.js에서
// 제작모드가 종료된 상황의 아이콘 등을 불러와서 popup.html을 꾸미도록 하는 부분 
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.builderModeActiviated === "builderModeActiviated"){
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






// =====<SECTION 4>=====
chrome.tabs.onActivated.addListener(function(activeInfo){
	current_tab = activeInfo.tabId;
	console.log("current tab id from main.js =>", current_tab);
	chrome.storage.local.get('current_tab_real', function(data){
		if(data.current_tab_real){builder_tab = data.current_tab_real;}
	});
	if (current_tab === builder_tab) {
		isBuilderTab = true;
		console.log("current_tab is a builder_tab");
	} else {
		isBuilderTab = false;
		console.log("current_tab is NOT a builder_tab");
	}
})

chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		if (msg.type === "initial_build")
		{
			chrome.storage.local.set({current_tab_real:current_tab});
			isBuilderTab = true;
		}
	});
  //port.postMessage("Hi Popup.js");
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	myRequest = request;
    if (myRequest.type === "trigger_event"){
    	if(myRequest.data === "C"){
    		clickEventAdded = true;
    		trigger_list.push("C");
    		console.log("CLICK EVENT saved");
    	} else {
    		clickEventAdded = false;
    		trigger_list.push("N");
    		console.log("NEXT EVENT saved");
    	}
    }
});

chrome.tabs.onUpdated.addListener(function(tabs){
	var updatedTabId = tabs;
	if (clickEventAdded === true && isBuilderTab === true){
		chrome.storage.local.get("twoWaySetter", function(data){
			if(data.twoWaySetter===1){
				var refresh_build_message = {
					"refresh_build": "refresh_build",
					"tutorial_id": myTutorialId
				};
				chrome.tabs.sendMessage(current_tab, refresh_build_message, function(response) {});
			};
		});
	}
});
// =====<SECTION 4>=====


