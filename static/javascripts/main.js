// manifest.json에서 background로 등록되어 있음. 상시적으로 멈추지 않고 돌아가며,
// chrome://extensions에서 백그라운드를 누르면 developer console을 볼 수 있음
chrome.tabs.onActivated.addListener(function(activeInfo){
	chrome.storage.local.get("twoWaySetter", function(data){
		if(data.twoWaySetter===1){
			//tab 이동 시 새롭게 객체를 생성해주고, on_refresh로 서버에서 받아옴
			console.log("active tab이 바뀌었습니다.");
			// var sb = new status_build(); 
		 	// sb.add_Statusbar();
			// sb.on_r		efresh();
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
				var current_tab = tabs[0].id;
				var refresh_build;
				chrome.storage.local.get("tutorial_id", function(data){
					refresh_build = {
						"refresh_build": "refresh_build",
						"tutorial_id": data.tutorial_id
					};
				});
				console.log("after tab id =>", current_tab);
				chrome.tabs.sendMessage(current_tab, refresh_build, function(response){});
			});
		};
	});
});