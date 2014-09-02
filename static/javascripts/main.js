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
var clickButtonClicked = false;
var selectList;
var bubbleList;
var builder_tab;
var current_tab;
var trigger_list = [];
// =====<SECTION 3>=====





// =====<SECTION 4>=====
var currentSelectList;
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	var myRequest = request;
    if (myRequest.type === "selectlist"){
    	currentSelectList = myRequest.data;
    }
});
var current_tutorial_id;
// =====<SECTION 4>=====







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






// =====<SECTION 3>=====
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
		} else if (msg.type === "current_tutorial_id") {
			current_tutorial_id = msg.data;
		}
	});
  //port.postMessage("Hi Popup.js");
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	myRequest = request;
    if (myRequest.type === "trigger_event")
    {
    	if(myRequest.data === "C"){
    		clickEventAdded = true;
    		trigger_list.push("C");
    		console.log("CLICK EVENT saved");
    	} 
    	else if (myRequest.data === "N") 
    	{
    		clickEventAdded = false;
    		trigger_list.push("N");
    		console.log("NEXT EVENT saved");
    	}
    }
	else if (myRequest.type === "clickButtonClicked") {
		console.log("THIS IS DATA_1!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", myRequest.data_1);
		clickButtonClicked = true;
		selectList = myRequest.data_1;
		bubbleList = myRequest.data_2;
	}
});

chrome.tabs.onUpdated.addListener(function(tabs, changeInfo){
	var updatedTabId = tabs;
	var changeStatus = changeInfo.status;
	if (clickEventAdded === true && isBuilderTab === true){
		var refresh_build_message = {
					"refresh_build": "refresh_build",
					"tutorial_id": myTutorialId
				};
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
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
	chrome.storage.local.get("current_user_tab", function(data){
		var current_user_tab = data.current_user_tab;
		// var current_tutorial_id;
		// chrome.storage.local.get("current_tutorial_id", function(data){
		// 	current_tutorial_id = data.current_tutorial_id;
		// 	console.log("Current Tutorial ID!!!!!!!!!!!", current_tutorial_id)
		// });
		if(updatedTabId === current_user_tab) {
			if(clickButtonClicked === true){
				if(changeStatus === "complete"){
					console.log("TAB UPDATED!!!!!!!!!!!!!!!!!!!!!!!!!!! ANYWAYS");
					chrome.tabs.sendMessage(current_user_tab, {type: "refresh_user", data_1: selectList, data_2: bubbleList, data: current_tutorial_id, currentSelectList: currentSelectList}, function(response){});
					clickButtonClicked = false;
				}
			}
		}
	})
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



chrome.webRequest.onResponseStarted.addListener(function(details){
	console.log("THIS IS SPARTA!!!!!!!!!!!!!!!!!!", details);
}, {urls: ["https://www.mcdelivery.co.kr/*"]}); 	// <all_urls>
