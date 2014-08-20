// 1. login 상태 체크 함수
// 2. Builder mode 상태 체크 함수 
// 위의 2개 함수를 구현하여서 chrome.storage api와 관련된 flow를 말끔하게 정리할 것!
// 또한 controllers를 구성하는 object를 만들어서 controller들을 통합할 것! 

var starCount = function(ratings){
	var starImgs = "";
	for(var i = 0; i <5; i += 1){
		if(ratings >= 1){
			starImgs = starImgs + "<img src='static/img/yellostar_small.png' alt=''>"
			ratings -= 1;
		}
		else {starImgs = starImgs + "<img src='static/img/whitestar_small.png' alt=''>"}
	}
	return starImgs;
}

var $signout = $("<a href='#searchPage' id='signoutIcon' data-toggle='tooltip' data-placement='bottom' title='signout' ng-click='signoutClick()'><i class='fa fa-sign-out'></i></a>")
var $signinMessage = $("<div id='signinMessage'><p style='display:inline'>Hi! Please </p><a href='#signinPage' style='text-decoration:underline'>sign-in</a></div>");
var $signoutMessage = $("<p id='signoutMessage'>Hello {{user}}</p>");

$("#signIcons").append($signout);
$("#signingMessage").append($signinMessage);
$("#signingMessage").append($signoutMessage);

chrome.storage.local.get("token", function(data){
	secretToken = data.token;
	console.log(secretToken);
	if(typeof secretToken === "undefined"){
		console.log("fist view secretToken doesn't exist");
		$("#signinIcon").show();
		$("#signoutIcon").hide();
		$("#settingIcon").hide();
		$("#signinMessage").show();
		$("#signoutMessage").hide();
	} else if(typeof secretToken === "object") {
		console.log("fist view secretToken exists");
		$("#signinIcon").hide();
		$("#signoutIcon").show();
		$("#settingIcon").show();
		$("#signinMessage").hide();
		$("#signoutMessage").show();
	}
});

var extensionControllers = angular.module('extensionPopup', ['ngRoute']);

extensionControllers.controller('signingController', ['$scope', 'functionFactory', function($scope, functionFactory){
	$scope.user = functionFactory.username;
}])


// <div ng-view></div>에 static/pages에 있는 html 문서들을 라우팅해주고, 나아가 각각의 페이지에 대해 controller를 연결해주는 부분
extensionControllers.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.when('/searchPage', {
			templateUrl: 'static/pages/searchPage.html',
			controller: 'searchPageController'
		}).when('/settingPage', {
			templateUrl: 'static/pages/settingPage.html',
			controller: 'settingPageController'
		}).when('/signinPage', {
			templateUrl: 'static/pages/signinPage.html',
			controller: 'signinPageController'
		}).when('/signoutPage', {
			templateUrl: 'static/pages/signoutPage.html',
			controller: 'signoutPageController'
		}).otherwise({
			redirectTo: '/searchPage'
		});
	}]);

// static/pages 중 "/searchPage"를 관리해주는 controller
extensionControllers.controller('searchPageController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
	$http.get('http://175.126.232.145:8000/api-list/tutorials/').success(function(data){
		// 테스트를 위하여 임의로 ratings를 4.3으로 초기화하는 부분, 이후에 API연동을 통해 제거할 예정
		$(data).each(function(index, eachdata){
			eachdata.ratings = 4.3;
			eachdata.starImgs = starCount(4.3)
		})
		$scope.tutorials = data;
		chrome.storage.local.get("twoWaySetter", function(data){
			if(data.twoWaySetter === 1){
				return;
			} else {
				chrome.storage.local.set({"twoWaySetter": 0});
			}
		});
	});
	
	$scope.ngClick = function(){
		var twoWaySetter;
		chrome.storage.local.get("twoWaySetter", function(data){
			if (data.twoWaySetter===0){
				$("#executeBuilder").attr("id", "exitBuilder");
				$("#exitBuilder").removeClass("btn-primary").addClass("btn-danger");
				$("#exitBuilder").html("<i class='fa fa-external-link'></i> 튜토리얼 제작모드 종료하기");
				chrome.storage.local.set({"twoWaySetter": 1});
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
				    console.log(response.farewell);
				  });
				});
			} else if(data.twoWaySetter===1){
				$("#exitBuilderModal").modal("show");
			};			
		});
	};

	// for filters
	$scope.predicate = "title";
	$scope.reverse = false;
	
	chrome.storage.local.get("twoWaySetter", function(data){
		if(data.twoWaySetter===1){
			$("#executeBuilder").attr("id", "exitBuilder");
			$("#exitBuilder").removeClass("btn-primary").addClass("btn-danger");
			$("#exitBuilder").html("<i class='fa fa-external-link'></i> 튜토리얼 제작모드 종료하기");
		}
	});

	chrome.storage.local.get("token", function(data){
		secretToken = data.token;
		console.log(secretToken);
		if(typeof secretToken === "undefined"){
			$("#signinRequestMessage").show();
			$("#executeBuilder").hide();
			$("#exitBuilder").hide();
		} else if(typeof secretToken === "object") {
			$("#signinRequestMessage").hide();
			$("#executeBuilder").show();
			$("#exitBuilder").show();
		}
	});
	$rootScope.$on("signInEvent", function(event, message){
		$("#signInModal").modal("show");
		$("#signinRequestMessage").hide();
		$("#executeBuilder").show();
		$("#exitBuilder").show();
	});
	$rootScope.$on("signOutEvent", function(event, message){
		chrome.storage.local.remove('token', function(data){console.log(data)});
		$("#signOutModal").modal("show");
		$("#signinRequestMessage").show();
		$("#executeBuilder").hide();
		$("#exitBuilder").hide();
	});
	$scope.tabClick = function($event){
		var target = $event.target;
		$(".nav-tabs li").removeClass("active");
		$($event.target).addClass("active");
		$(".tab-content>div").removeClass("active");
		$($(target).children().attr("href").toString()).addClass("in active");
	}
	$scope.quitClick = function(){
		$("#exitBuilder").attr("id", "executeBuilder");
		$("#executeBuilder").removeClass("btn-danger").addClass("btn-primary");
		$("#executeBuilder").html("<i class='fa fa-edit'></i> 튜토리얼 제작하기")				
		chrome.storage.local.set({"twoWaySetter": 0});
		chrome.tabs.reload(getCurrentTab());
		$("#exitBuilderModal").modal("hide");
	}
}]);

// 현재는 사용하지 않으나, 향후 시스템이 복잡해질 경우 settingPageController를 통해서 특정 user의 setting을 관리할 예정
extensionControllers.controller('settingPageController', ['$scope', function($scope){
}]);

// 현재는 사용하지 않으나, 향후 시스템이 복잡해질 경우 signoutPageController를 통해서 각종 데이터를 처리할 예정 
extensionControllers.controller('signoutPageController', ['$scope', function($scope){
}]);

extensionControllers.controller('signinPageController', ['$scope', 'functionFactory', '$rootScope', function($scope, functionFactory, $rootScope){
	$scope.login = function(){
		if ($scope.username && $scope.password){
			functionFactory.get_auth_token(this.username, this.password);
		};	
	};
}]);

extensionControllers.factory('functionFactory', ['$http', '$location', '$rootScope', function($http, $location, $rootScope){
	var baseUrl = "http://175.126.232.145:8000/api-token-auth/";
	var functionFactory = {};

	functionFactory.get_auth_token = function(id, pw){
		var data = {
			"username": id.toString(),
		    "password": pw.toString()
		};
		functionFactory.username = id.toString();
		$http.post(baseUrl, data).success(function(data){
			functionFactory["token"] = data;
			$("#loginForm").hide();
			//$("#loginCtrl").append("<p>You've logged-in successfully!</p>")
			$("#signinIcon").hide();
			$("#settingIcon").show();
			$("#signoutIcon").show();
			$("#signinMessage").hide();
			$("#signoutMessage").show();
			chrome.storage.local.set({"token":data});
			$rootScope.$emit("signInEvent");
			$location.path('/searchPage');		
		}).error(function(data){
			$("#signErrorModal").modal("show")
			$location.path('/signinPage');
			$(".form-control").val("");
		})
	}
	return functionFactory;
}]);

extensionControllers.controller('singoutIconController', ['$scope', '$rootScope', function($scope, $rootScope){
	$scope.signoutClick = function(){
		$("#signoutIcon").hide();
		$("#settingIcon").hide();
		$("#signinIcon").show();
		$("#signinMessage").show();
		$("#signoutMessage").hide();
		chrome.storage.local.remove('token', function(data){console.log(data)});
		$rootScope.$emit("signOutEvent");
	};
}]);

function getCurrentTab(){
	chrome.tabs.query({"active":true},function(tabs){
		return tabs[0].id});
}

$(document).ready(function(){
	$(".panel-heading a").tooltip();   
});

