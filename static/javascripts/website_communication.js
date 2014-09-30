// ****** 웹과의 통신(웹 => contentScript => main.js(background page)) ****** //
// 웹사이트 상에서 특정 메시지가 공유된 DOM을 통해 내려올 경우 인지하여
// 다시 main.js로 실행해야 할 튜토리얼 id가 담긴 메시지를 보내준다. 
window.addEventListener("message", function(event) {
    // accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "initialize_user_mode_from_web")) {
        console.log("Content script received!");
        // send tutorial id to the main.js
        contentScriptsPort.postMessage({
            type: "user_mode_initialized_from_web",
            data: event.data.data
        });
    }
}, false);

// ****** 웹과의 통신(contentScript => 웹) ****** //
// contentScript가 페이지가 삽입 될 때마다, 각 페이지에 이 메시지를 보내며
// 이 메시지를 받는 것이 우리의 웹사이트라면 익스텐션이 깔려있다는 것을 인지할 수 있다.
(function() {
    window.postMessage({
        type: "bullback_extension_exists",
    }, "*");
})();