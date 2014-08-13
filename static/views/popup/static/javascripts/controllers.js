var extensionControllers = angular.module('extensionPopup', []);

extensionControllers.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.when('/searchPage', {
			templateUrl: 'pages/searchPage.html',
			controller: 'searchPageController'
		}).when('/settingPage', {
			templateUrl: 'pages/settingPage.html',
			controller: 'settingPageController'
		}).when('/signinPage', {
			templateUrl: 'pages/signinPage.html',
			controller: 'signinPageController'
		}).when('/signoutPage', {
			templateUrl: 'pages/signoutPage.html',
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
}])

extensionControllers.factory('functionFactory', ['$http', function($http){
	var baseUrl = "http://175.126.232.145:8000/api-token-auth/";
	var functionFactory = {};

	functionFactory.get_auth_token = function(id, pw){
		var data = {
			"username": id.toString(),
		    "password": pw.toString()
		};
		$http.post(baseUrl, data).success(function(data){
			//console.log(data);
			functionFactory["token"] = data;
			$("#loginForm").hide();
			$("#loginCtrl").append("<p>You've logged-in successfully!</p>")
			$("#signIcons").children().hide();
			$("#signIcons").append("<a href='#searchPage' id='signoutIcon' data-toggle='tooltip' data-placement='bottom' title='signout'><i class='fa fa-sign-out'></i></a>");
		})
	}
	return functionFactory;
}]);

$("#signoutIcon").click(function(){alert("you logged-out successfully")});