"use strict";

(function () {
    angular
        .module("piadinamia")
        .factory("sharedCartService", sharedCartService);

    sharedCartService.$inject = [];

    function sharedCartService() {
        var cartByUser = {},
            cartByItem = {},
            service = {
                init: init,
                getCartByItem: getCartByItem,
                getCartByUser: getCartByUser
            };

        return service;

        function calcCartByUser(user, cart) {
            var myCart = [],
                total = 0;

            angular.forEach(cart, function (item) {
                myCart.push(item);
                total += item.qty * item.price;
            });

            cartByUser[user.id] = {
                name: user.name,
                total: total,
                cart: myCart
            };
        }

        function calcCartByItem() {
            cartByItem = {};

            angular.forEach(cartByUser, function (user) {
                user.cart.forEach(function (item) {
                    var counter = 0;

                    if (cartByItem[item.item]) {
                        counter = cartByItem[item.item].total + item.qty;
                    } else {
                        counter = item.qty;
                    }

                    cartByItem[item.item] = {
                        total: counter
                    };
                });
            });
        }

        function subscribeCarts(catalogName, subscribers) {
            subscribers.forEach(function (user) {
                var ref = firebase.database().ref("/users/" + user.id +
                            "/catalogs/" + catalogName + "/cart"),
                    cartSync = ref;

                cartSync.$watch(function () {
                    cartSync.$loaded().then(function (cart) {
                        calcCartByUser(user, cart);
                        calcCartByItem();
                    });
                });
            });
        }

        function init(userId, catalogName) {
            var ref = firebase.database().ref("/users/" + userId +
                        "/catalogs/" + catalogName + "/subscribers"),
                subscribersSync = ref;

            subscribersSync.$loaded().then(function (subscribers) {
                subscribeCarts(catalogName, subscribers);
            });
        }

        function getCartByItem() {
            return cartByItem;
        }

        function getCartByUser() {
            return cartByUser;
        }

    }

}());