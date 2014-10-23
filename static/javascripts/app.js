var extensionToBackground = chrome.extension.connect({name: "extensionToBackground"});

var app = angular.module("Popup", ['ngRoute', 'ngAnimate']);

// 라우트를 조정하는 부분
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/list', {
            templateUrl: 'static/pages/list.html',
            controller: 'listController'
        }).otherwise({
            redirectTo: '/list'
        });
    }
]);

app.controller("listController", ["$scope", function($scope) {
    this.tab = 1;

    this.setTab = function(tabNumber) {
        this.tab = tabNumber;
    }

    this.checkTab = function(tabNumber) {
        return tabNumber === this.tab;
    }
}]);

app.controller("themesController", ["$http", "$scope", function($http, $scope) {
    $http.get('http://175.126.232.145:8000/api-list/categorys/').success(function(data){
        $scope.themes = data;
    });
}]);

app.controller("tutorialsController", ["$http", "$scope", function($http, $scope) {
    $http.get('http://175.126.232.145:8000/api-list/tutorials/').success(function(data){
        $scope.tutorials = data;
    });


	// 화면에서 보여지는 select의 자식 option
    $scope.orders = [{
        name: "도움수 순",
        value: "amount_stars"
    }, {
        name: "조회수 순",
        value: "amount_views"
    }, {
        name: "리뷰수 순",
        value: "amount_stars"
    }];

    $scope.currentIndex = undefined;

    $scope.searchInput = {};
    // 초기 화면에서 selected되어 있는 옵션의 지정
    $scope.searchInput.sortingQuery = $scope.orders[0];
    
    $scope.filter = {};

    // form을 받아서 그것에 따라서 결과를 filtering 할 수 있도록 해주는 
    $scope.executeSearch = function() {
        $scope.filter.sortingQuery = $scope.searchInput.sortingQuery.value;
    }

    $scope.mouseEnter = function(index){
        $scope.currentIndex = index;
    }

    $scope.mouseLeave = function(index){
        $scope.currentIndex = undefined;
    }

    $scope.mouseCheck = function(index){
        return $scope.currentIndex === index;
    }

    $scope.startTutorial = function(id){
        $http.get('http://175.126.232.145:8000/api-list/tutorials/' + id).success(function(data){
            console.log("DATA RECEIVED ===> ", data);
            var tutorial = data.contents;
            chrome.storage.local.set({tutorials:tutorial}); 

            var parsed_tutorials = JSON.parse(tutorial);
            var parsed_bubbles = JSON.parse(parsed_tutorials.bubbles);

            var current_tab;
            var moving_url;
            var req_login = data.req_login;
            var signin_url = data.url_login;
            var current_tutorial_id = id;
            for(var list in parsed_bubbles){
                if(!parsed_bubbles[list].prev){
                    moving_url = parsed_bubbles[list].page_url;
                }
            }
            
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                current_tab = tabs[0].id;
            });

            extensionToBackground.postMessage({type: "initialize_user_mode", data_1: current_tab, data_2: current_tutorial_id, data_3: moving_url, data_4: req_login, data_5:signin_url});
        });
    }
}]);

//***** 제이쿼리 ***** //
//***** 제이쿼리 ***** //
