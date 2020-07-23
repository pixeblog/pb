//canvas grid logic --start
var pixelSize = 25;
var ppp = 5; // price per pixel
function drawGrid(context) {
    for (var x = 0.5; x < 10001; x += pixelSize) {
        context.moveTo(x, 0);
        context.lineTo(x, 10000);
    }

    for (var y = 0.5; y < 10001; y += pixelSize) {
        context.moveTo(0, y);
        context.lineTo(10000, y);
    }

    context.strokeStyle = "#ddd";
    context.stroke();
    context.closePath();
}

var canvasGrid = document.getElementById('canvasgrid');
var ctxgrid = canvasGrid.getContext('2d');
ctxgrid.globalAlpha = 0.3;
ctxgrid.fillStyle = "blue";
//drawGrid(ctxgrid);

var canvasGridServer = document.getElementById('canvasgridServer');
var ctxgridServer = canvasGridServer.getContext('2d');
ctxgridServer.font = "sans-serif";


ctxgridServer.globalAlpha = 0.3;
ctxgridServer.fillStyle = "blue";

drawGrid(ctxgridServer);

//Variables
var canvasx = $(canvasGrid).offset().left;
var canvasy = $(canvasGrid).offset().top;
var last_mousex = last_mousey = 0;
var mousex = mousey = 0;
var mousedown = false;

//Mousedown
var isAlreadySoldSelected = false;
$(canvasGrid).on('mousedown', function (e) {
    isAlreadySoldSelected = false;
    last_mousex = parseInt(e.pageX - canvasx);
    last_mousey = parseInt(e.pageY - canvasy);
    mousedown = true;
});

//Mouseup
$(canvasGrid).on('mouseup', function (e) {
    mousedown = false;
    if (localStorage.getItem("selectedPixels") &&
        JSON.parse(localStorage.getItem("selectedPixels")).w &&
        JSON.parse(localStorage.getItem("selectedPixels")).h) {
        $("#select-pixels").hide();
        //updateTotal();
        // $("#user-detail").show();
    } else {
        $("#select-pixels").show();
        //$("#user-detail").hide();
    }
    if (isAlreadySoldSelected) {
        ctxgrid.clearRect(0, 0, canvasGrid.width, canvasGrid.height);
    }
});

//firebase--starts
var sitesJSON;


$(function () {
// Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyD6rERCynFYx_thhCTYeBvmOe2IibBoT_0",
        authDomain: "blog-pixels.firebaseapp.com",
        databaseURL: "https://blog-pixels.firebaseio.com",
        projectId: "blog-pixels",
        storageBucket: "blog-pixels.appspot.com",
        messagingSenderId: "504850275272",
        appId: "1:504850275272:web:1fa1bfd27dcfea4d42fefd",
        measurementId: "G-6HFVG0K2R4"
    };
// Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    firebase.database().ref('/users').once('value').then(function (snapshot) {
        sitesJSON = snapshot.val();

        //if uid already exists in database
        if (sitesJSON && sitesJSON.hasOwnProperty(uid)) {
            // hide details and payment and steps
            //$("#user-detail").hide();
            var sp = JSON.parse(sitesJSON[uid].selectedPixels);
            drawBorder(sp.x, sp.y, sp.w, sp.h);
            $("#select-pixels").hide();
            checkSelPixels();
        } else {
            //$("#user-detail").show();
        }

        for (var key in sitesJSON) {
            if (sitesJSON.hasOwnProperty(key)) {
                var user = sitesJSON[key];
                populateSitePixels(user, ctxgridServer);
            }
        }
    });


    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            onSuccess(user);
        }
    });


});

//firebase-ends

function round(n) {
    return Math.floor((n + 1) / pixelSize) * pixelSize;
}

$(canvasGrid).on('click', on_click);

$(canvasGrid).on('mousemove', function (e) {
    mousex = parseInt(e.pageX - canvasx);
    mousey = parseInt(e.pageY - canvasy);
    if (!mousedown) {
        if (!isAlreadySoldSelected) {
            for (var key in sitesJSON) {
                if (sitesJSON.hasOwnProperty(key)) {
                    var rect = JSON.parse(sitesJSON[key].selectedPixels);
                    if (mousex >= rect.x && mousex <= rect.x + rect.w && mousey >= rect.y && mousey <= rect.y + rect.h) {
                        $('#already-sold').css({position: 'absolute', left: mousex, top: mousey});
                        $('#already-sold .ttip-in').html(sitesJSON[key].siteNote);
                        $('#already-sold').show();
                        $("canvas").css("cursor", "pointer");
                    } else {
                        $('#already-sold').hide();
                        $("canvas").css("cursor", "crosshair");
                    }
                }
            }
        }
    }

    if (mousedown) {
        ctxgrid.clearRect(0, 0, canvasGrid.width, canvasGrid.height); //clear canvas

        //drawGrid(ctxgrid);
        var width = mousex - last_mousex ? mousex - last_mousex : pixelSize;
        var height = mousey - last_mousey ? mousex - last_mousex : pixelSize;

        if (!isAlreadySoldSelected) {
            for (var key in sitesJSON) {
                if (sitesJSON.hasOwnProperty(key)) {
                    var rect = JSON.parse(sitesJSON[key].selectedPixels);
                    if (mousex >= rect.x && mousex <= rect.x + rect.w && mousey >= rect.y && mousey <= rect.y + rect.h) {
                        $('.toast').toast('show');
                        ctxgrid.clearRect(0, 0, canvasGrid.width, canvasGrid.height);
                        isAlreadySoldSelected = true;
                    }
                }
            }
        }
        //if (!isAlreadySoldSelected) {
        ctxgrid.fillRect(round(last_mousex), round(last_mousey), round(width), round(height));
        var numberOfSelectedPixels = (round(width) / pixelSize) * (round(height) / pixelSize);
        if (!isAlreadySoldSelected) {
            localStorage.setItem("numberOfSelectedPixels", numberOfSelectedPixels);
            localStorage.setItem("selectedPixels", JSON.stringify({
                x: round(last_mousex),
                y: round(last_mousey),
                w: round(width),
                h: round(height)
            }));
        } else {
            localStorage.removeItem("numberOfSelectedPixels");
            localStorage.removeItem("selectedPixels");
        }
    }
});

function drawBorder(xPos, yPos, width, height, thickness = 1) {
    ctxgridServer.strokeStyle = "#FF0000";
    ctxgridServer.globalAlpha = 1;
    ctxgridServer.strokeRect(xPos - (thickness), yPos - (thickness), width + thickness, height + thickness);
    ctxgridServer.globalAlpha = 0.3;
}

function checkSelPixels() {

    var selPixels = localStorage.getItem("selectedPixels");
    if (selPixels && JSON.parse(selPixels).w) {
        populateSitePixels({selectedPixels: selPixels}, ctxgrid);
        $("#select-pixels").hide();
        //$("#user-detail").show();
    } else {
        $("#select-pixels").show();
        //$("#user-detail").hide();
    }

}

checkSelPixels()

function on_click() {
    for (var key in sitesJSON) {
        if (sitesJSON.hasOwnProperty(key)) {
            var rect = JSON.parse(sitesJSON[key].selectedPixels);
            if (mousex >= rect.x && mousex <= rect.x + rect.w && mousey >= rect.y && mousey <= rect.y + rect.h) {
                window.location = sitesJSON[key].siteUrl.indexOf("http") !== -1 ? sitesJSON[key].siteUrl : "http://" + sitesJSON[key].siteUrl;
            }
        }
    }
}

function drawImageFill(img, selectedPixels) {
    ctxgridServer.globalAlpha = 1;
    ctxgridServer.drawImage(img, selectedPixels.x, selectedPixels.y, selectedPixels.w, selectedPixels.h);
    ctxgridServer.globalAlpha = 0.3;
}

function drawImageFillCenter(img, selectedPixels) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    //if( img.height / img.width * selectedPixels.w < selectedPixels.h)
    //{
    // center based on width
    var width = selectedPixels.w;
    var height = img.height / img.width * width;
    offset = (selectedPixels.h - height) / 2;
    ctxgridServer.globalAlpha = 1;
    ctxgridServer.drawImage(img, selectedPixels.x, selectedPixels.y + offset, width, height);
    ctxgridServer.globalAlpha = 0.3;
    // }
    /*else
    {
        // center based on height
        var height = canvas.height;
        var width = img.width / img.height * height;
        offset = (canvas.width - width) / 2;
        ctx.drawImage(img, offset , 0, width, height);
    }*/
}

function populateSitePixels(user, ctxG) {
    if (user) {
        var selPixelsJSON = JSON.parse(user.selectedPixels);
        ctxG.fillRect(selPixelsJSON.x, selPixelsJSON.y, selPixelsJSON.w, selPixelsJSON.h);
        if (user.siteUrl) {
            var img = new Image();
            img.src = user.siteLogo;
            img.onload = function () {
                img.width = this.width;
                img.height = this.height;
                drawImageFill(img, selPixelsJSON);
                //drawImageFillCenter(img, selPixelsJSON);
            }

        }
    }
}

//canvas grid logic --ends
//gsign-start

$("#google-signin").on('click', function (event) {
    event.preventDefault();
    googleSignIn();
});


function googleSignIn() {

    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    firebase.auth().useDeviceLanguage();
    firebase.auth().signInWithPopup(provider).then(function (result) {
        onSuccess(result.user);
    }).catch(function (error) {
        console.log(error);
    });
}


var gUserName;
var uid;

function onSuccess(googleUser) {

    gUserName = googleUser.displayName;
    uid = googleUser.uid;


    $("#google-signin").hide();

    $("#loggedin-user #hi-user").html("Hi,  " + gUserName + "!");
    $("#loggedin-user").show();

    $(".loginStep").removeClass("active").addClass("finish");


    if (!localStorage.getItem("siteUrl")) {
        $("#details-form").show();
        $(".detailsStep").addClass("active");
    } else {
        //paymentStep();
    }
}

function onFailure(error) {
    console.log(error);
}

/*$(function () {
    $(window).resize(function () {
        if ($("#paypal-button-container .paypal-buttons").width()) {
            $("#google-signin .abcRioButtonBlue").width($("#paypal-button-container .paypal-buttons").width());
        }
    });

});*/
//gsignin--ends
//paypal-start

/*$(function () {
    paypal.Buttons({
        createOrder: function (data, actions) {
            // This function sets up the details of the transaction, including the amount and line item details.
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        "currency_code": "USD",
                        "value": localStorage.getItem("numberOfSelectedPixels") * ppp
                    }
                }]
            });
        },
        onApprove: function (data, actions) {
            // This function captures the funds from the transaction.
            return actions.order.capture().then(function (details) {
                // This function shows a transaction success message to your buyer.
                alert('Transaction completed by ' + details.payer.name.given_name);

                var database = firebase.database();
                var rootRef = database.ref("users");
                if (details.status == "COMPLETED") {
                    rootRef.child(uid).set({
                        name: details.payer.name.given_name,
                        numberOfSelectedPixels: localStorage.getItem("numberOfSelectedPixels"),
                        siteUrl: localStorage.getItem("siteUrl"),
                        siteLogo: localStorage.getItem("siteLogo"),
                        siteNote: localStorage.getItem("siteNote"),
                        selectedPixels: localStorage.getItem("selectedPixels")
                    });

                    var rootRefPrivate = database.ref("private");
                    rootRefPrivate.child(uid).set({
                        name: details.payer.name.given_name,
                        email: details.payer.email_address,
                        payerId: details.payer.payer_id,
                        captureId: details.purchase_units[0].payments.captures[0].id,
                        amount: details.purchase_units[0].payments.captures[0].amount.value,
                        currency_code: details.purchase_units[0].payments.captures[0].amount.currency_code,
                        numberOfSelectedPixels: localStorage.getItem("numberOfSelectedPixels"),
                        siteUrl: localStorage.getItem("siteUrl"),
                        siteLogo: localStorage.getItem("siteLogo"),
                        siteNote: localStorage.getItem("siteNote"),
                        selectedPixels: localStorage.getItem("selectedPixels")
                    });

                    localStorage.setItem("captureId", details.purchase_units[0].payments.captures[0].id);
                    $('#paypal-button-container').hide();
                    $("#paypal-payment-status").html("Payment Id -  " + localStorage.getItem("captureId")).show();

                }

            });
        }
    }).render('#paypal-button-container');
});*/
//paypal-ends


//formdetailsvaluessaved
$("#details-form").on("submit", function (event) {
    event.preventDefault();
    if ($(this).validate()) {
        $(this).hide();
        localStorage.setItem("siteUrl", $("#siteUrl").val());
        localStorage.setItem("siteLogo", $("#siteLogo").val());
        localStorage.setItem("siteNote", $("#siteNote").val());

        setFormData();

        var database = firebase.database();
        var rootRef = database.ref("users");

        rootRef.child(uid).set({
             name: gUserName,
            // numberOfSelectedPixels: localStorage.getItem("numberOfSelectedPixels"),
            siteUrl: localStorage.getItem("siteUrl"),
            siteLogo: localStorage.getItem("siteLogo"),
            siteNote: localStorage.getItem("siteNote"),
            selectedPixels: localStorage.getItem("selectedPixels")
        });

        var rootRefPrivate = database.ref("private");
        rootRefPrivate.child(uid).set({
            name: gUserName,
           //  email: details.payer.email_address,
           //  payerId: details.payer.payer_id,
           //  captureId: details.purchase_units[0].payments.captures[0].id,
           //  amount: details.purchase_units[0].payments.captures[0].amount.value,
           //  currency_code: details.purchase_units[0].payments.captures[0].amount.currency_code,
            numberOfSelectedPixels: localStorage.getItem("numberOfSelectedPixels"),
            siteUrl: localStorage.getItem("siteUrl"),
            siteLogo: localStorage.getItem("siteLogo"),
            siteNote: localStorage.getItem("siteNote"),
            selectedPixels: localStorage.getItem("selectedPixels")
        });


        $("#site-details").show();

    }
});

/*function paymentStep() {
    //$(".loginStep").removeClass("active").addClass("finish");
    //$(".detailsStep").removeClass("active").addClass("finish");
}*/

function setFormData() {
    $("#siteUrlLabel").html(localStorage.getItem("siteUrl"));
    $("#siteNoteLabel").html(localStorage.getItem("siteNote"));
}


$("#search").on("submit", function (event) {
    event.preventDefault();
    for (var key in sitesJSON) {
        if (sitesJSON.hasOwnProperty(key)) {
            var user = sitesJSON[key];
            var searchParam = $("#search-input").val();
            if (user.siteNote.indexOf(searchParam) !== -1 || user.siteUrl.indexOf(searchParam) !== -1) {
                var userPixels = JSON.parse(user.selectedPixels);
                var thickness = 1;
                var count = 0;
                var strokeStyles = ["#0022ff", "#FF0000", "#0022ff", "#FF0000", "#0022ff", "#FF0000"];

                window.setInterval(function () {
                    /// call your function here
                    ctxgridServer.strokeStyle = strokeStyles[count];
                    ctxgridServer.globalAlpha = 1;
                    ctxgridServer.strokeRect(userPixels.x - (thickness), userPixels.y - (thickness), userPixels.w + thickness, userPixels.h + thickness);
                    ctxgridServer.globalAlpha = 0.3;
                    count++;
                    if (count > 5)
                        clearInterval();
                }, 500);


            }
        }
    }

});

/*
$(function(){
    $("input[name=siteUrl]")[0].oninvalid = function () {
        this.setCustomValidity("Please use correct format e.g: http://www.example.com.");
    };
});*/
