chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "hello"){
    	var sb = new status_build(); 
    	sb.add_Statusbar();
    	sendResponse({farewell: "goodbye"});
    }
});