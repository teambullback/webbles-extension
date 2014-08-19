var $signout = $("<a href='#searchPage' id='signoutIcon' data-toggle='tooltip' data-placement='bottom' title='signout' ng-click='signoutClick()'><i class='fa fa-sign-out'></i></a>")
var $signinMessage = $("<div id='signinMessage'><p style='display:inline'>Hi! Please </p><a href='#signinPage' style='text-decoration:underline'>sign-in</a></div>");
var $signoutMessage = $("<p id='signoutMessage'>Hello {{user}}</p>");

$("#signIcons").append($signout);
// $("#signinIcon").show();
// $("#signoutIcon").hide();
// $("#settingIcon").hide();

$("#signingMessage").append($signinMessage);
$("#signingMessage").append($signoutMessage);
// $("#signinMessage").show();
// $("#signoutMessage").hide();

chrome.storage.local.get("token", function(data){
	secretToken = data.token;
	if(typeof secretToken === "undefined"){
		$("#signinIcon").show();
		$("#signoutIcon").hide();
		$("#settingIcon").hide();
		$("#signinMessage").show();
		$("#signoutMessage").hide();
	} else if(typeof secretToken === "object") {
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

extensionControllers.controller('searchPageController', ['$scope', '$rootScope', function($scope, $rootScope){
	$rootScope.$on("signInEvent", function(event, message){
		$("#signInModal").modal("show")});
	$rootScope.$on("signOutEvent", function(event, message){
		$("#signOutModal").modal("show")});
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

extensionControllers.controller('settingPageController', ['$scope', function($scope){
}]);


extensionControllers.controller('signoutPageController', ['$scope', function($scope){
}]);

extensionControllers.controller('signinPageController', ['$scope', 'functionFactory', '$rootScope', function($scope, functionFactory, $rootScope){
	$scope.login = function(){
		if ($scope.username && $scope.password){
			functionFactory.get_auth_token(this.username, this.password);
		};	
	};
}]);

extensionControllers.controller('mainController', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope){
	$http.get('http://175.126.232.145:8000/api-list/tutorials/').success(function(data){
		$scope.tutorials = data;
		chrome.storage.local.set({"twoWaySetter": 0});
	});
	
	$scope.ngClick = function(){
		var twoWaySetter;
		chrome.storage.local.get("twoWaySetter", function(data){
			console.log(data.twoWaySetter);
			if (data.twoWaySetter===0){
				$("#executeBuilder").attr("id", "exitBuilder");
				$("#exitBuilder").removeClass("btn-primary").addClass("btn-danger");
				$("#exitBuilder").html("<i class='fa fa-external-link'></i> 튜토리얼 제작모드 종료하기");
				//chrome.tabs.executeScript({code:"var sb = new status_build(); sb.add_Statusbar();"});
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
	$scope.predicate = "title";
	$scope.reverse = false;
}])

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
			chrome.storage.local.set({"token":data});
			$rootScope.$emit("signInEvent");
			console.log("You've logged-in successfully!");
			$("#loginForm").hide();
			$("#loginCtrl").append("<p>You've logged-in successfully!</p>")
			$("#signinIcon").hide();
			$("#settingIcon").show();
			$("#signoutIcon").show();
			$("#signinMessage").hide();
			$("#signoutMessage").show();
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
		console.log("You've logged-out successfully!");
		$rootScope.$emit("signOutEvent");
		chrome.storage.local.remove('token', function(data){console.log(data)});
		//chrome.storage.local.clear();
		$("#signoutIcon").hide();
		$("#settingIcon").hide();
		$("#signinIcon").show();
		$("#signinMessage").show();
		$("#signoutMessage").hide();
	};
}]);

function getCurrentTab(){
	chrome.tabs.query({"active":true},function(tabs){
		return tabs[0].id});
}

$(document).ready(function(){
	$(".panel-heading a").tooltip();   
});

