var $signout = $("<a href='#searchPage' id='signoutIcon' data-toggle='tooltip' data-placement='bottom' title='signout' ng-click='signoutClick()'><i class='fa fa-sign-out'></i></a>")
var $signinMessage = $("<a href='#signinPage' id='signinMessage' style='text-decoration:underline'>Please Log-in</a>");
var $signoutMessage = $("<p id='signoutMessage'>Hello {{user}}</p>");

var twoWaySetter = 0;

$("#signIcons").append($signout);
$("#signinIcon").show();
$("#signoutIcon").hide();
$("#settingIcon").hide();

$("#signingMessage").append($signinMessage);
$("#signingMessage").append($signoutMessage);
$("#signinMessage").show();
$("#signoutMessage").hide();

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

extensionControllers.controller('searchPageController', ['$scope', function($scope){
}]);

extensionControllers.controller('settingPageController', ['$scope', function($scope){
}]);


extensionControllers.controller('signoutPageController', ['$scope', function($scope){
}]);

extensionControllers.controller('signinPageController', ['$scope', 'functionFactory', function($scope, functionFactory){
	$scope.login = function(){
		if ($scope.username && $scope.password){
			functionFactory.get_auth_token(this.username, this.password);
		};	
	}
}]);

extensionControllers.controller('mainController', ['$scope', '$http', function($scope, $http){
	$http.get('http://175.126.232.145:8000/api-list/tutorials/').success(function(data){
		$scope.tutorials = data;
	});
	$scope.ngClick = function(){
		if(twoWaySetter===0){
			console.log("why!")
			chrome.tabs.executeScript({file:"static/views/bubbles/jquery.dom.path.js"});
			twoWaySetter = 1;
		} else if(twoWaySetter===1){
			console.log("do you?!~")
			chrome.tabs.reload(getCurrentTab());
			twoWaySetter = 0;
		}
	}
}])

extensionControllers.factory('functionFactory', ['$http', '$location', function($http, $location){
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
			alert("You've logged-in successfully!")
			$("#loginForm").hide();
			$("#loginCtrl").append("<p>You've logged-in successfully!</p>")
			$("#signinIcon").hide();
			$("#settingIcon").show();
			$("#signoutIcon").show();
			$("#signinMessage").hide();
			$("#signoutMessage").show();
			$location.path('/searchPage');		
		}).error(function(data){
			alert("Login error! Please try again!");
			$location.path('/signinPage');
			$(".form-control").val("");
		})
	}
	return functionFactory;
}]);

extensionControllers.controller('singoutIconController', ['$scope', function($scope){
	$scope.signoutClick = function(){
		alert("You've logged-out successfully!")
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

