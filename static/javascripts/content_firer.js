chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "hello"){
    	var sb = new status_build(); 
    	sb.add_Statusbar();
    	sendResponse({farewell: "goodbye"});
    } 
});

// 페이지가 이동했을 때 계속 유지되도록 하는 것(빌더 모드, 유저 모드)
// 