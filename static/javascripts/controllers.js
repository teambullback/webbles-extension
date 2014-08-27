// controllers.js는 popup.html을 구성하는 가장 핵심 논리들을 AngularJS로 구현한 부분입니다.

var port = chrome.extension.connect({name: "Sample Communication"});

var signOutChange = function(){
	$("#signOutModal").modal("show");
	$("#signinRequestMessage").show();
	$("#executeBuilder").hide();
	$("#exitBuilder").hide();
}

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
var $signinMessage = $("<span id='signinMessage'>Hi! Please <a href='#signinPage' style='text-decoration:underline'>sign-in</a></span>");
var $signoutMessage = $("<span id='signoutMessage'>Hello {{user}}</span>");

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
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
					port.postMessage({type: "initial_build", data: tabs[0].id});
					chrome.tabs.sendMessage(tabs[0].id, {initial_build: "initial_build"}, function(response) {});
				})
				// 현재 사용자가 보고 있는 탭의 content_scripts 중 content_firer에 스테이터스바 객체를 구축하라고 메시지를 보내는 부분
				// chrome.storage.local.get('current_tab_temp', function(data){
				// 	console.log(data.current_tab_temp)
				// 	//chrome.storage.local.set({current_tab_real:data.current_tab_temp});
				// 	//chrome.tabs.sendMessage(data.current_tab_temp, {initial_build: "initial_build"}, function(response) {});
				// });
				chrome.storage.local.set({"twoWaySetter": 1});
			} else if(data.twoWaySetter===1){
				$("#exitBuilderModal").modal("show");
			};			
		});
	};

	// for filters
	$scope.predicate = "id";
	$scope.reverse = true;
	
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
		signOutChange();
		// $("#signOutModal").modal("show");
		// $("#signinRequestMessage").show();
		// $("#executeBuilder").hide();
		// $("#exitBuilder").hide();
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
		$("#executeBuilder").removeClass("btn-danger").addClass("btn-default");
		$("#executeBuilder").html("<i class='fa fa-edit'></i> 튜토리얼 제작하기")				
		chrome.storage.local.set({"twoWaySetter": 0});
		chrome.storage.local.get("current_tab_real", function(data){
			var builder_tab = data.current_tab_real;
			if(getCurrentTab()===builder_tab){
				chrome.tabs.reload(getCurrentTab());
			} else {
				chrome.tabs.reload(builder_tab);
			}
		});
		// 주의를 요하며, 이후 다시 살펴볼 필요가 있음
		chrome.storage.local.remove('current_tab_real', function(data){console.log(data)});
		$("#exitBuilderModal").modal("hide");
	}
	$scope.listItemClick = function($event, tutorial_id){
		var target = $event.target;
		chrome.storage.local.set({current_tutorial_id: tutorial_id});
		$("#startTutorialModal").modal("show")
		console.log("current target is ===>", target);
		console.log("selected target's tutorial id is ===>", tutorial_id);
	}
	$scope.startTutorialClick = function(){
		chrome.storage.local.get("current_tutorial_id", function(data){
			chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
				chrome.tabs.sendMessage(tabs[0].id, {type: "initial_user", data: data.current_tutorial_id}, function(response){});
			});
		});
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
		// 주의를 요하며, 이후 다시 살펴볼 필요가 있음
		chrome.storage.local.remove('current_tab_real', function(data){console.log(data)});
		$rootScope.$emit("signOutEvent");
	};
}]);

function getCurrentTab(){
	chrome.tabs.query({active:true, currentWindow:true},function(tabs){
		return tabs[0].id});
}

$(document).ready(function(){
	$(".panel-heading a").tooltip();   
});

