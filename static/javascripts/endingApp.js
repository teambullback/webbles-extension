// $("body").append("<script type='text/javascript' src='" + chrome.extension.getURL('static/javascripts/vendor/angular.min.js') + "'></script>");
// $("body").append("<script type='text/javascript' src='" + chrome.extension.getURL('static/javascripts/endingApp.js') + "'></script>");
// $("body").append("<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular.min.js'></script>");
// $('html').attr("ng-app", 'endingApp');
// $('html').attr("ng-csp", '');
window.addEventListener("load", myMain, false);

function myMain(evt) {
    $.ajax({
        url: chrome.extension.getURL('static/pages/ratingModal.html'),
        async: false,
        success: function(data) {
            $(data).appendTo('body');
            $("#__goDumber__popover__modal__logo__").attr('src', chrome.extension.getURL('static/img/modal_logo.png'));
            $("#__goDumber__popover__modal__rewindBtn__").attr('src', chrome.extension.getURL('static/img/modal_rewind.png'));
            $("#__goDumber__popover__modal__movingArrow__").attr('src', chrome.extension.getURL('static/img/modal_movingArrow.png'));
            $("#__goDumber__popover__modal__itHelpedBtn__").css('background-image', "url(" + chrome.extension.getURL('static/img/modal_itWasHelpful.png') + ")");
            $("#__goDumber__popover__modal__previewLeftBtn__").attr('src', chrome.extension.getURL('static/img/modal_previewLeft.png'));
            $("#__goDumber__popover__modal__previewRightBtn__").attr('src', chrome.extension.getURL('static/img/modal_previewRight.png'));
            $("#__goDumber__popover__modal__fbBtn__").attr('src', chrome.extension.getURL('static/img/modal_fbBtn.png'));
            $("#__goDumber__popover__modal__twBtn__").attr('src', chrome.extension.getURL('static/img/modal_twBtn.png'));
            $("#__goDumber__popover__modal__linkBtn__").attr('src', chrome.extension.getURL('static/img/modal_linkBtn.png'));
            $("#__goDumber__popover__modal__reviewListBubble__").attr('src', chrome.extension.getURL('static/img/modal_reviewListBubble.png'));
            $("#__goDumber__popover__modal__reviewListBtn__").attr('src', chrome.extension.getURL('static/img/modal_reviewListBtn.png'));
            $("#__goDumber__popover__modal__close__").attr('src', chrome.extension.getURL('static/img/modal_close.png'));

            var app = angular.module("endingApp", ['ngAnimate']);

            app.config(['$compileProvider',
                function($compileProvider) {
                    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
                }
            ]);

            app.controller("modalController", ["$scope", "$http", "$animate",
                function($scope, $http, $animate) {
                    st.su.token_load.get_auth_token("guest", "guest");

                    $scope.viewsImage = chrome.extension.getURL('static/img/list_view_n.png');
                    $scope.reviewsImage = chrome.extension.getURL('static/img/list_review_n.png');
                    $scope.likesImage = chrome.extension.getURL('static/img/list_help_p.png');

                    $scope.originalTutorialId = st.su.tutorial_num;
                    $scope.originalAmountReviews = st.su.amountReviews;
                    $scope.originalAmountLikes = st.su.amountLikes;
                    $scope.originalAmountViews = st.su.amountViews;
                    $scope.curTutorialId = st.su.tutorial_num;
                    $scope.nextTutorialId = st.su.next_tutorial_num;
                    $scope.prevTutorialId = st.su.prev_tutorial_num;
                    $scope.curTutorialName = st.su.tutorialTitle;
                    $scope.curAmountReviews = st.su.amountReviews;
                    $scope.curAmountLikes = st.su.amountLikes;
                    $scope.curAmountViews = st.su.amountViews;
                    $scope.likeAdded = true;
                    $scope.reviewContent;
                    $scope.setNewTutorial = function(id) {
                        if (id !== null) {
                            $http.get('https://webbles.net/api-list/tutorials/' + id).success(function(data) {
                                $scope.curTutorialId = data.id;
                                $scope.nextTutorialId = data.next_tutorial_at_category;
                                $scope.prevTutorialId = data.prev_tutorial_at_category;
                                $scope.curTutorialName = data.title;
                                $scope.curAmountReviews = data.amount_reviews;
                                $scope.curAmountLikes = data.amount_likes;
                                $scope.curAmountViews = data.amount_views;
                            });
                        } else if (id === null) {
                            $scope.curTutorialId = st.su.tutorial_num;
                            $scope.nextTutorialId = st.su.next_tutorial_num;
                            $scope.prevTutorialId = st.su.prev_tutorial_num;
                            $scope.curTutorialName = st.su.tutorialTitle;
                            $scope.curAmountReviews = st.su.amountReviews;
                            $scope.curAmountLikes = st.su.amountLikes;
                            $scope.curAmountViews = st.su.amountViews;
                        }
                    }
                    $scope.openWebbles = function() {
                        contentScriptsPort.postMessage({
                            type: "open_webbles_from_ending_modal"
                        }, function(response) {});
                    }

                    $scope.addLikeNum = function() {
                        $scope.originalAmountLikes += 1;
                        $scope.likeAdded = false;
                        $.ajax({
                            url: "https://webbles.net/api-list/likes/",
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
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }

                    $scope.subtractLikeNum = function() {
                        $scope.originalAmountLikes -= 1;
                        $scope.likeAdded = true;
                        // 이후 IP 기반으로 바꾼 뒤에 다시 수정
                        $.ajax({
                            url: "https://webbles.net/api-list/likes/",
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
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }

                    $scope.replayTutorial = function() {
                        $.ajax({
                            url: 'https://webbles.net/api-list/tutorials/' + $scope.originalTutorialId,
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
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }

                    $scope.playTutorial = function() {
                        $.ajax({
                            url: 'https://webbles.net/api-list/tutorials/' + $scope.curTutorialId,
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
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }

                    $scope.submitReview = function() {
                        // console.log("REVIEW IS HERE ===> ", $scope.reviewContent);
                        var reviewContent = $scope.reviewContent;
                        $.ajax({
                            url: "https://webbles.net/api-list/reviews/",
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
                            // console.log("REVIEW SUBMITTED!");
                        }).fail(function() {
                            // console.log("NO REVIEW SUBMITTED!");
                        });
                        $scope.reviewContent = "";
                        $scope.originalAmountReviews += 1;
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
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

                            // console.log("THIS IS MOVING_URL ===>", moving_url);
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
                                return "url('https://webbles.net/static/images/icons/default.png')";
                            } else if (id !== null) {
                                return "url('https://webbles.net/static/images/snaps/" + id + ".png')";
                            }
                        }
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }

                    $scope.rightClick = function() {
                        if ($scope.nextTutorialId === null) {
                            alert("가장 마지막 튜토리얼입니다.");
                        } else if ($scope.nextTutorialId !== null) {
                            $scope.setNewTutorial($scope.nextTutorialId);
                        }
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }

                    $scope.leftClick = function() {
                        if ($scope.prevTutorialId === null) {
                            alert("가장 처음 튜토리얼입니다.");
                        } else if ($scope.prevTutorialId !== null) {
                            $scope.setNewTutorial($scope.prevTutorialId);
                        }
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }

                    $scope.moveToTutorialPage = function() {
                        contentScriptsPort.postMessage({
                            type: "open_tutorial_page_from_ending_modal",
                            data: $scope.curTutorialId
                        }, function(response) {});
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            ]);
        }
    });
}

(function() {
    // console.log("endingApp started!");




})();