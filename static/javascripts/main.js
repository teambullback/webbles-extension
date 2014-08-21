// manifest.json에서 background로 등록되어 있음. 상시적으로 멈추지 않고 돌아가며,
// chrome://extensions에서 백그라운드를 누르면 developer console을 볼 수 있음
chrome.tabs.onActivated.addListener(function(activeInfo){
	//tab 이동 시 새롭게 객체를 생성해주고, on_refresh로 서버에서 받아옴
	console.log("active tab이 바뀌었습니다.");
	// var sb = new status_build(); 
 	// sb.add_Statusbar();
	// sb.on_refresh();
	console.log(activeInfo.)
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
		  // 보안 취약점을 회피하기 위해 JSON.parse를 사용합니다. (사전에 약속한 script만 실행시키기 위해)
		  var resp = JSON.parse(response.farewell);
		});
	});
});
