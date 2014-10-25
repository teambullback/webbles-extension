var app = angular.module("endingApp", []);

app.controller("modalController", ["$scope",
    function($scope) {
        $scope.openWebbles = function() {
            contentScriptsPort.postMessage({
                type: "open_webbles_from_ending_modal"
            }, function(response) {});
        }

        $scope.closeWebbles = function() {
            var moving_url;
            chrome.storage.local.get("tutorials", function(data) {
                var parse_tutorials = JSON.parse(data.tutorials);
                var parse_bubbles = JSON.parse(parse_tutorials.bubbles);

                for (var list in parse_bubbles) {
                    if (!parse_bubbles[list].prev) {
                        moving_url = parse_bubbles[list].page_url;
                    }
                }

                console.log("THIS IS MOVING_URL ===>", moving_url);
                contentScriptsPort.postMessage({
                    type: "exit_user_mode",
                    data: moving_url
                });
            });
        }
    }
]);