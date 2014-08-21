// content_firer.js는 content_scripts 중 하나로 chrome tab이 새롭게 loading되면 다른 content_script들과 함께
// 자동으로 그 페이지에 삽입됩니다.
// content_firer.js는 처음으로 제작모드 시작하기를 눌렀을 때나, 제작모드 상에서 click event가 발생해서 다른 창으로 넘어갔을 경우 status_build() constructor를 통해 
// 객체를 빌딩합니다. 
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.initial_build == "initial_build"){
      var tutorial_id;
    	var sb = new status_build(); 
    	sb.add_Statusbar();
      if(sb.tutorial_num){
        tutorial_id = sb.tutorial_num;
      } else {
        console.log("tutorial_num doesn't exist. something's wrong with this variable!")
      }
    	sendResponse({initial_build: tutorial_id});
    } else if (request.refresh_build == "refresh_build"){
      var tutorial_id = request.tutorial_id;
      var sb = new status_build(); 
      sb.add_Statusbar();
      sb.tutorial_num = tutorial_id;
      sb.on_refresh();
    }
});