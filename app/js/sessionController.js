"use strict";

angular.module("piadinamia").controller("SessionCtrl", [
    "$scope",
    "sessionService",
    "catalogService",
    "cartService",
    "sharedCartService",
    "$location",
    "$firebase",
    "Firebase",
    "FBURL",
    function ($scope,
              sessionService,
              catalogService,
              cartService,
              sharedCartService,
              $location,
              $firebase,
              Firebase,
              FBURL) {

        $scope.session = {
            err: null,
            email: null,
            pass: null,
            name: null,
            isLogging: false
        };

        if ($scope.auth) {
            $location.path("/");
        }

        $scope.$on("$firebaseSimpleLogin:login", function (e, user) {
            var ref = new Firebase(FBURL + "/users/" + user.id),
                sync = $firebase(ref),
                userSync = sync.$asObject();

            $location.path("/");

            userSync.$loaded().then(function () {
                $scope.session.name = userSync.name;
            });

            catalogService.load(user.id, function (catalog, catalogName) {
                $scope.catalog = catalog;

                cartService.init(user.id, catalogName);
                $scope.cart = cartService;

                sharedCartService.init(user.id, catalogName);
                $scope.sharedCart = sharedCartService;

                $scope.master = catalogService;
            });
        });

        $scope.logout = function () {
            sessionService.logout("/signin");
        };

        $scope.login = function (callback) {
            $scope.session.err = null;
            $scope.session.isLogging = true;

            sessionService.login($scope.session.email, $scope.session.pass, "/",
                function (err, user) {
                    $scope.session.err = err && err.message || null;
                    if (typeof(callback) === "function") {
                        callback(err, user);
                    }
                    $scope.session.isLogging = false;
                });
        };

        $scope.createAccount = function () {
            $scope.session.err = null;

            if (!$scope.session.email) {
                $scope.session.err = "Please enter a valid email address";
            } else if (!$scope.session.pass) {
                $scope.session.err = "Please enter a password";
            } else {
                sessionService.createAccount($scope.session.name,
                    $scope.session.email, $scope.session.pass,
                    function (err, user) {
                    if (err) {
                        $scope.session.err = err.message;
                    } else {
                        $scope.login(function (err) {
                            if (!err) {
                                sessionService.createProfile(user.id,
                                    $scope.session.name, user.email);
                            }
                        });
                    }
                });
            }
        };

    }
]);
