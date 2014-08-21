// manifest.json에서 background로 등록되어 있음. 상시적으로 멈추지 않고 돌아가며,
// chrome://extensions에서 백그라운드를 누르면 developer console을 볼 수 있음
chrome.tabs.onActivated.addListener(function(activeInfo){
	chrome.storage.local.get("twoWaySetter", function(data){
		if(data.twoWaySetter===1){
			//tab 이동 시 새롭게 객체를 생성해주고, on_refresh로 서버에서 받아옴
			console.log("active tab이 바뀌었습니다.");
			// var sb = new status_build(); 
		 	// sb.add_Statusbar();
			// sb.on_refresh();
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				var refresh_build_message;
				chrome.storage.local.get("tutorial_id", function(data){
					refresh_build_message = {
						"refresh_build": "refresh_build",
						"tutorial_id": data.tutorial_id
					};
				});
				console.log("after tab id =>", tabs[0].id)
				chrome.tabs.sendMessage(tabs[0].id, refresh_build_message, function(){
					chrome.storage.local.get("before_tab_id", function(data){
						console.log("before_tab_id =>", data.before_tab_id);
						chrome.tabs.reload(data.before_tab_id);
					});
				});
			});
		};
	});
});