let app = angular.module('rapp', []);
app.controller('restaurantController', function ($scope, $http, $location) {
    console.log("NG App Initiated")
    $scope.cart_products = [];
    $scope.delivery_charge = 0;
    $scope.coupon_code = "";
    $scope.size = "";
    $scope.color = "";
    $scope.coupon_value = 0;
    $scope.quantity = 1;
    $scope.customer_address_type = "Home";
    $scope.is_home_delivery = "1";
    $scope.picked_up_time = "";
    $scope.delivery_area_id = "";
    $scope.is_dine_in = 0;
    $scope.table_id = "";
    $scope.area_id = "";
    $scope.addToCart = function (item) {

        console.log("Add To cart")
        let flag = false;
        let tempProduct = {
            "product_id": item.id,
            "product_name": item.name,
            "selling_price": item.selling_price + "",
            "featured_image": "/uploads/products/" + item.image,
            "shop_id": item.restaurant_id,
            "quantity": $scope.quantity,
            "qr_code": "",
            "size": "",
            "color": "",
        };

        let cartProductList = localStorage.getItem('cart_product');
        if (cartProductList !== null && cartProductList !== undefined) {
            cartProductList = JSON.parse(cartProductList);

            if (cartProductList.length <= 0) {
                //Nothing
            } else {
                for (var cartProduct of cartProductList) {
                    if (cartProduct['product_id'] === item.id) {
                        cartProduct['quantity'] += 1;
                        flag = true;
                        break;
                    }
                }
            }
        } else {
            cartProductList = [];
        }

        if (!flag) {
            cartProductList.push(tempProduct);
            messageSuccess("Product added to cart")
        } else {
            messageSuccess("Product added to cart")
        }
        localStorage.setItem('cart_product', JSON.stringify(cartProductList));
        $scope.getTotalPrice();
        $scope.getList();
    }


    $scope.getTotalPrice = function () {
        let cartProductList = localStorage.getItem('cart_product');
        let totalPrice = 0;

        if (cartProductList !== null && cartProductList !== undefined) {
            cartProductList = JSON.parse(cartProductList);
            for (var cartProduct of cartProductList) {
                totalPrice = totalPrice + parseInt(cartProduct['selling_price']) * parseInt(cartProduct['quantity']);
            }
        }
        $scope.totalPriceCountAll = totalPrice;

    };

    $scope.getList = function () {
        //localStorage.clear()
        let cartProductList = localStorage.getItem('cart_product');
        if (cartProductList !== null && cartProductList !== undefined) {
            cartProductList = JSON.parse(cartProductList);
            $scope.cart_products = cartProductList;
            $scope.cartActive = true;
            $scope.total_item = cartProductList.length;
            if ($scope.total_item <= 0) {
                //document.getElementById("total_item").style.display = "none";
            } else {
                //document.getElementById("total_item").style.display="block";
            }
        }
    };

    $scope.deleteItem = function (item) {
        let cartProductList = localStorage.getItem('cart_product');
        if (cartProductList != null && cartProductList !== undefined) {
            cartProductList = JSON.parse(cartProductList);
            for (let i = 0; i < cartProductList.length; i++) {
                if (cartProductList[i].product_id === item.product_id) {
                    cartProductList.splice(i, 1);
                    break;
                }
            }
            localStorage.setItem('cart_product', JSON.stringify(cartProductList));
        }
        $scope.getTotalPrice();
        $scope.getList();
    };

    $scope.dIncQty = function () {
        $scope.quantity = $scope.quantity + 1;
    }
    $scope.dDecQty = function () {
        if ($scope.quantity > 1) {
            $scope.quantity = $scope.quantity - 1;
        }

    }

    $scope.incQty = function (item) {
        let cartProductList = localStorage.getItem('cart_product');
        if (cartProductList != null && cartProductList !== undefined) {
            cartProductList = JSON.parse(cartProductList);
            for (let i = 0; i < cartProductList.length; i++) {
                if (cartProductList[i].product_id === item.product_id) {
                    cartProductList[i].quantity += 1;
                    break;
                }
            }
            localStorage.setItem('cart_product', JSON.stringify(cartProductList));
        }
        $scope.getTotalPrice();
        $scope.getList();
    };

    $scope.decQty = function (item) {

        let cartProductList = localStorage.getItem('cart_product');
        if (cartProductList != null && cartProductList !== undefined) {
            cartProductList = JSON.parse(cartProductList);
            for (let i = 0; i < cartProductList.length; i++) {
                if (cartProductList[i].product_id === item.product_id) {
                    if (cartProductList[i].quantity <= 1) {
                        messageError("Cant remove items", 'error');
                        break;
                    } else {
                        cartProductList[i].quantity -= 1;
                    }
                    break;
                }
            }
            localStorage.setItem('cart_product', JSON.stringify(cartProductList));
        }

        $scope.cartRemove = function () {
            localStorage.clear();
            $scope.getTotalPrice();
            $scope.getList();
        }
        $scope.getTotalPrice();
        $scope.getList();

    };

    $scope.couponApply = function () {
        if ($scope.coupon_code != null) {
            $http.post('/web-api/promo-code', {coupon_code: $scope.coupon_code}).then(function (response) {
                console.log(response.data);
                if (response.data.status_code == 200) {
                    $scope.coupon_value = response.data.results.value;
                    messageSuccess("Coupon is Applied");
                } else {
                    messageError("Coupon is expired or Invalid");
                }
            }, function (response) {

                console.log(response);
            });
        } else {
            messageError("Please input a coupon code");
        }
    };
    $scope.loginCheck = function () {
        $http.post('/web-api/login', {
            phone: $scope.phone,
            password: $scope.password,
        }).then(function (response) {
            if (response.data.status_code == 200) {
                messageSuccess(response.data.message);
                window.location.href = '/customer/profile';
            } else {
                messageError(response.data.message);
            }
        }, function (response) {
            //error
            console.log(response);
        });
    };
    $scope.subscribe = function () {
        $http.post('/web-api/subscribe', {
            email: $scope.email,
        }).then(function (response) {
            if (response.data.status_code == 200) {
                $scope.email = "";
                messageSuccess(response.data.message);
            } else {
                messageError(response.data.message);
            }
        }, function (response) {
            //error
            console.log(response);
        });
    };

    $scope.diningOrderSave = function () {

        if (!$scope.area_id) {
            messageError("Please Select Area")
            return;
        }
        if (!$scope.table_id) {
            messageError("Please Select Table")
            return;
        }


        let cartProductList = localStorage.getItem('cart_product');
        cartProductList = JSON.parse(cartProductList);
        console.log(cartProductList.length);
        if (cartProductList.length <= 0) {
            messageError("Add an Item to Continue")
            return;
        } else {
            $scope.cart_products = cartProductList;
        }

        $http.post('/web-api/order-save', {
            products: $scope.cart_products,
            sub_total: $scope.totalPriceCountAll,
            area_id: $scope.area_id,
            table_id: $scope.table_id,
            total: ($scope.totalPriceCountAll),

        }).then(function (response) {
            if (response.data.status_code == 200) {
                messageSuccess("Successfully Order Saved");

                localStorage.clear();
                window.location.href = '/success/' + response.data.order_invoice;

            } else {
                messageError(response.data.message)
            }
        }, function (response) {

            messageError(response)
        });


    };
    $scope.tableReservationOrder = function () {

        if (!$scope.name) {
            messageError("Please Enter Name")
            return;
        }
        if (!$scope.phone_number) {
            messageError("Please Enter Phone Number")
            return;
        }
        if (!$scope.email) {
            messageError("Please Enter Email")
            return;
        }
        if (!$scope.no_of_persons) {
            messageError("Please Enter Person No")
            return;
        }
        if (!$scope.date) {
            messageError("Please Enter Date")
            return;
        }
        if (!$scope.time) {
            messageError("Please Enter Time")
            return;
        }


        let cartProductList = localStorage.getItem('cart_product');
        cartProductList = JSON.parse(cartProductList);
        console.log(cartProductList.length);
        if (cartProductList.length <= 0) {
            messageError("Add an Item to Continue")
            return;
        } else {
            $scope.cart_products = cartProductList;
        }
        console.log($scope.date);

        $http.post('/web-api/table-reservation/order-save', {

            products: $scope.cart_products,
            name: $scope.name,
            phone_number: $scope.phone_number,
            no_of_persons: $scope.no_of_persons,
            email: $scope.email,
            date: $scope.date,
            time: $scope.time,
            sub_total: $scope.totalPriceCountAll,

        }).then(function (response) {
            if (response.data.status_code == 200) {
                console.log('success');
                messageSuccess("Successfully Order Saved");
                localStorage.clear();
                window.location.href = '/table-reservation/success';

            } else {
                console.log('Error');
                console.log(response.data.message)
                console.log(response.data.orders)
                console.log(response.data.results)
                messageError(response.data.results)
            }
        }, function (response) {

            messageError(response)
        });


    };

    $scope.placeOrder = function () {

        let empty_status = false;
        if (!$scope.customer_phone) {
            messageError("Please fill all the fields")
            return;
        }
        if (!$scope.customer_email) {
            messageError("Please fill all the fields")
            return;
        }

        if (!$scope.customer_name) {
            messageError("Please fill all the fields")
            return;
        }
        if ($scope.is_home_delivery == 1) {
            if (!$scope.delivery_area_id) {
                messageError("Please Select Area")
                return;
            }
        }

        let cartProductList = localStorage.getItem('cart_product');
        cartProductList = JSON.parse(cartProductList);
        if (!cartProductList) {
            messageError("Add an Item")
            return;
        } else {
            $scope.cart_products = cartProductList;
        }

        $http.post('/web-api/order-save', {
            customer_name: $scope.customer_name,
            customer_phone: $scope.customer_phone,
            customer_email: $scope.customer_email,
            customer_password: "123456",
            customer_address: $scope.customer_address,
            delivery_charge: $scope.delivery_charge,
            coupon_value: $scope.coupon_value,
            coupon_code: $scope.coupon_code,
            products: $scope.cart_products,
            is_home_delivery: $scope.is_home_delivery,
            picked_up_time: $scope.picked_up_time,
            sub_total: $scope.totalPriceCountAll,
            table_id: $scope.table_id,
            is_dine_in: $scope.is_dine_in,
            delivery_area_id: $scope.delivery_area_id,
            total: ($scope.totalPriceCountAll + $scope.delivery_charge) - $scope.coupon_value,

        }).then(function (response) {

            if (response.data.status_code == 200) {
                messageSuccess("Successfully Order Saved");
                localStorage.clear();
                window.location.href = '/success/' + response.data.order_invoice;

            } else {
                messageSuccess(response.data.message)
            }
        }, function (response) {

            messageError(response)
        });
    };

    function messageError(message) {
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: message,
            showConfirmButton: false,
            timer: 1500
        })

        //toastr.warning(message, 'Failed')
    }

    function messageSuccess(message) {
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: message,
            showConfirmButton: false,
            timer: 1500
        })

        // toastr.success(message, 'Success')
    }


    $scope.getTotalPrice();
    $scope.getList();

    $scope.getCustomer = function () {
        $http.post('/web-api/customer-info', {}).then(function (response) {
            if (response.data.status_code == 200) {
                $scope.customer_name = response.data.customer_name;
                $scope.customer_phone = response.data.customer_phone;
                $scope.customer_email = response.data.customer_email;
            }
        }, function (response) {

        });
    }
    $scope.insideDhaka = function () {
        $scope.delivery_charge = 80;
    }
    $scope.outsideDhaka = function () {
        $scope.delivery_charge = 120;
    }
    $scope.signIn = function () {

        console.log("lollll");
    }

    $scope.colorChange = function () {
        console.log($scope.color);
    }
    $scope.ok = function () {
        console.log("Ok");
    }
    $scope.deliveryTypeChange = function () {
        if ($scope.is_home_delivery == 1) {
            document.getElementById("customer_address").style.display = 'block';
            document.getElementById("area_section").style.display = 'block';
            document.getElementById("time").style.display = 'none';
            $scope.delivery_charge = 80;
        } else {
            document.getElementById("customer_address").style.display = 'none';
            document.getElementById("area_section").style.display = 'none';
            document.getElementById("time").style.display = 'block';
            $scope.delivery_charge = 0;
        }
    }
    $scope.areaChange = function () {

        if (!$scope.delivery_area_id) {
            $scope.delivery_charge = 0;
            return;
        }
        $http.get("/web-api/delivery-charge/" + $scope.delivery_area_id)
            .then(function (response) {
                console.log(response.data.delivery_charge);

                $scope.delivery_charge = response.data.delivery_charge;

            })
    }
    $scope.changeTable = function (area_id) {

        console.log(area_id);

        $http.get("/restaurant/find/table/" + area_id)
            .then(function (response) {
                console.log(response.data.list);
                $scope.datas = response.data.list;

            })
    }


    pickUpClick = function () {
        document.getElementById("delivery_address").style.display = "none";
        document.getElementById("pick_up_date").style.display = "block";
        document.getElementById("delivery_area").style.display = "none";
        $scope.delivery_charge = 0;
    }
    deliveryClick = function () {
        document.getElementById("delivery_address").style.display = "block";
        document.getElementById("pick_up_date").style.display = "none";
        document.getElementById("delivery_area").style.display = "block";
        $scope.areaChange();
    }
});


