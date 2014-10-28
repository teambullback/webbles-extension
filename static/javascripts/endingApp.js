// $("body").append("<script type='text/javascript' src='" + chrome.extension.getURL('static/javascripts/vendor/angular.min.js') + "'></script>");
// $("body").append("<script type='text/javascript' src='" + chrome.extension.getURL('static/javascripts/endingApp.js') + "'></script>");
// $("body").append("<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular.min.js'></script>");
// $('html').attr("ng-app", 'endingApp');
// $('html').attr("ng-csp", '');

(function(){
var app = angular.module("endingApp", ['ngAnimate']);

app.controller("modalController", ["$scope", "$http", "$animate",
    function($scope, $http, $animate) {
        st.su.token_load.get_auth_token("admin", "admin");

        $scope.originalTutorialId = st.su.tutorial_num;

        $scope.amountReviews = st.su.amountReviews;
        $scope.amountLikes = st.su.amountLikes;
        $scope.curTutorialId = st.su.tutorial_num;
        $scope.nextTutorialId = st.su.next_tutorial_num;
        $scope.prevTutorialId = st.su.prev_tutorial_num;
        $scope.curTutorialName = st.su.tutorialTitle;
        $scope.curTutorialIntro1 = '현재 선택된 튜토리얼은';
        $scope.curTutorialIntro2 = '"' + st.su.tutorialTitle + '"';

        $scope.likeAdded = true;

        $scope.setNewTutorial = function(id) {
            if (id !== null) {
                $http.get('http://175.126.232.145:8000/api-list/tutorials/' + id).success(function(data) {
                    $scope.curTutorialId = data.id;
                    $scope.nextTutorialId = data.next_tutorial_at_category;
                    $scope.prevTutorialId = data.prev_tutorial_at_category;
                    $scope.curTutorialName = data.title;
                    $scope.curTutorialIntro1 = '현재 선택된 튜토리얼은';
                    $scope.curTutorialIntro2 = '"' + data.title + '"';
                });
            } else if (id === null) {
                $scope.curTutorialId = st.su.tutorial_num;
                $scope.nextTutorialId = st.su.next_tutorial_num;
                $scope.prevTutorialId = st.su.prev_tutorial_num;
                $scope.curTutorialName = st.su.tutorialTitle;
                $scope.curTutorialName = "";
                $scope.curTutorialIntro1 = "방금 튜토리얼이 테마의 마지막 튜토리얼입니다!";
                $scope.curTutorialIntro2 = "다른 튜토리얼을 실행해주세요!";
            }
        }

        $scope.reviewContent;
        // $scope.setNewTutorial(st.su.next_tutorial_num);       

        $scope.openWebbles = function() {
            contentScriptsPort.postMessage({
                type: "open_webbles_from_ending_modal"
            }, function(response) {});
        }

        $scope.addLikeNum = function() {
            $scope.amountLikes += 1;
            $scope.likeAdded = false;
            $.ajax({
                url: "http://175.126.232.145:8000/api-list/likes/",
                type: "POST",
                data: {
                    "user": 1,
                    "tutorial": $scope.originalTutorialId,
                    "created_by": 1
                },
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "JWT " + st.su.token_load.get_saved_token().token);
                },
            }).done(function() {}).fail(function() {});
        }

        $scope.subtractLikeNum = function() {
            $scope.amountLikes -= 1;
            $scope.likeAdded = true;
            // 이후 IP 기반으로 바꾼 뒤에 다시 수정
            $.ajax({
                url: "http://175.126.232.145:8000/api-list/likes/",
                type: "DELETE",
                data: {
                    "user": 1,
                    "tutorial": $scope.originalTutorialId,
                    "created_by": 1
                },
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "JWT " + st.su.token_load.get_saved_token().token);
                },
            }).done(function() {}).fail(function() {});
        }

        $scope.replayTutorial = function() {
            $.ajax({
                url: 'http://175.126.232.145:8000/api-list/tutorials/' + $scope.originalTutorialId,
                type: "GET"
            }).done(function(data) {
                var tutorial = data.contents;
                chrome.storage.local.set({
                    tutorials: tutorial
                });

                var parsed_tutorials = JSON.parse(tutorial);
                var parsed_bubbles = JSON.parse(parsed_tutorials.bubbles);

                var current_tab;
                var moving_url;
                var req_login = data.req_login;
                var signin_url = data.url_login;
                var current_tutorial_id = $scope.originalTutorialId;
                for (var list in parsed_bubbles) {
                    if (!parsed_bubbles[list].prev) {
                        moving_url = parsed_bubbles[list].page_url;
                    }
                }

                contentScriptsPort.postMessage({
                    type: "initialize_user_mode",
                    data_1: null,
                    data_2: current_tutorial_id,
                    data_3: moving_url,
                    data_4: false,
                    data_5: signin_url
                });
            }).fail(function() {

            });
        }

        $scope.playTutorial = function() {
            $.ajax({
                url: 'http://175.126.232.145:8000/api-list/tutorials/' + $scope.curTutorialId,
                type: "GET"
            }).done(function(data) {
                var tutorial = data.contents;
                chrome.storage.local.set({
                    tutorials: tutorial
                });

                var parsed_tutorials = JSON.parse(tutorial);
                var parsed_bubbles = JSON.parse(parsed_tutorials.bubbles);

                var current_tab;
                var moving_url;
                var req_login = data.req_login;
                var signin_url = data.url_login;
                var current_tutorial_id = $scope.curTutorialId;
                for (var list in parsed_bubbles) {
                    if (!parsed_bubbles[list].prev) {
                        moving_url = parsed_bubbles[list].page_url;
                    }
                }

                contentScriptsPort.postMessage({
                    type: "initialize_user_mode",
                    data_1: null,
                    data_2: current_tutorial_id,
                    data_3: moving_url,
                    data_4: false,
                    data_5: signin_url
                });
            }).fail(function() {

            });
        }

        $scope.submitReview = function() {
            console.log("REVIEW IS HERE ===> ", $scope.reviewContent);
            var reviewContent = $scope.reviewContent;
            $.ajax({
                url: "http://175.126.232.145:8000/api-list/reviews/",
                type: "POST",
                data: {
                    "contents": reviewContent,
                    "tutorial": $scope.originalTutorialId,
                    "created_by": 1,
                    "updated_by": 1
                },
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "JWT " + st.su.token_load.get_saved_token().token);
                },
            }).done(function() {
                console.log("REVIEW SUBMITTED!");
            }).fail(function() {
                console.log("NO REVIEW SUBMITTED!");
            });
            $scope.reviewContent = "";
            $scope.amountReviews += 1;
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

        $scope.getImage = function(id) {
            if (id === undefined) {
                return;
            } else if (id !== undefined) {
                if (id === null) {
                    return "url('http://175.126.232.145:8000/static/images/icons/default.png')";
                } else if (id !== null) {
                    return "url('http://175.126.232.145:8000/static/images/snaps/" + id + ".png')";
                }
            }
        }

        $scope.rightClick = function() {
            if ($scope.nextTutorialId === null) {
                alert("가장 처음 튜토리얼입니다.");
            } else if ($scope.nextTutorialId !== null) {
                $scope.setNewTutorial($scope.nextTutorialId);
            }
        }

        $scope.leftClick = function() {
            if ($scope.prevTutorialId === null) {
                alert("가장 마지막 튜토리얼입니다.");
            } else if ($scope.prevTutorialId !== null) {
                $scope.setNewTutorial($scope.prevTutorialId);
            }
        }

        $scope.moveToTutorialPage = function() {
            contentScriptsPort.postMessage({
                type: "open_tutorial_page_from_ending_modal",
                data: $scope.curTutorialId
            }, function(response) {});
        }

    }
]);
})();