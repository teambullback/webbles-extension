// content_firer.js는 content_scripts 중 하나로 chrome tab이 새롭게 loading되면 
// 다른 content_script들과 함께 자동으로 그 페이지에 삽입됩니다.
var builderModeActiviated = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.initial_build == "initial_build") {
        //builderModeActiviated를 true로 만들어줘서 이후 beforeunload 이벤트가 발생했을 경우, 
        //이 값이 true인 content_scripts를 가진 페이지에서만 confirm 메시지가 뜨게 합니다. 
        var sb = new status_build();
        sb.add_Statusbar();
        sb.createNewTutorial();
        builderModeActiviated = true;
      } 
      else if (request.refresh_build == "refresh_build") {
        // sb.tutorial_num = request.tutorial_id;
        // sb.createNewTutorial();
        // sb.on_refresh();
        // chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
        //   var current_tab = tabs[0].id;
        //   chrome.tabs.reload(current_tab);
        // });
        console.log('!!!!!!!!!!!&&&&&&&&&&&***************************########################################################');
      }
      else if (request.type == "initial_user") {
        sb.tutorial_num = request.data;
        console.log("Tutorial ID: " + request.data);
        sb.see_preview();
      }
});

// beforeunload 이벤트가 발생 시 감지하는 jQuery 부분 
$(window).on('beforeunload', function(event){
  if(builderModeActiviated === true){
    if(sb.clickEventSaved === true) 
    {
      builderModeActiviated = false;
      sb.clickEventSaved = false;
      // <=== 여기에 창연이쪽 save하는 함수를 집어넣어야 함
      chrome.runtime.sendMessage({builderModeActiviated: "builderModeActiviated"}, function(response) {});
      return "가장 최근에 저장하지 않으신 작업이 소실됩니다."
    }
  } 
});