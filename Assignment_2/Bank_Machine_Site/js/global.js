'use strict';

var accounts;
var currentAccount;

/***********************************************
* Load data / show messages initially 
***********************************************/
$(document).ready(function () {
    accounts = loadAccountsJson();
    if (localStorage.getItem("accountNumber") != "") {
        for (var i = 0; i < accounts.length; i++) {
            if (accounts[i].accountNumber == localStorage.getItem("accountNumber")) {
                currentAccount = accounts[i];
                break;
            }
        }
    }
    
    // enter account number
    if (window.location.href.indexOf("index.html") > -1) {
        if (window.location.href.indexOf("logout") > -1) {
            displayMessage("You have been successfully logged out.", false);
        } else if (window.location.href.indexOf("cancelPin") > -1) {
            displayMessage("Login successfully cancelled.", false);
        } else {
            return;
        }
        window.history.pushState('', document.title, window.location.href.substring(0, window.location.href.indexOf("?")));
    }
    
    // view accounts
    else if (window.location.href.indexOf("viewaccounts.html") > -1) {
        $(".account-number-label")[0].innerHTML = currentAccount.accountNumber;
        for (var i = 0; i < currentAccount.bankAccounts.length; i++) {
            var lineToAdd = $(".view-accounts-container")[0].innerHTML;
            lineToAdd += "<p class=\"account-name\">";
            lineToAdd += currentAccount.bankAccounts[i].name;
            lineToAdd += "</p>\n<p class=\"account-balance\">$";
            lineToAdd += currentAccount.bankAccounts[i].balance + "</p><br>";
            lineToAdd += (i == currentAccount.bankAccounts.length-1) ? "" : "<hr class=\"account-separator\"/>";
            $(".view-accounts-container")[0].innerHTML = lineToAdd;
        }
    }    
});

/***********************************************
* Logging in 
***********************************************/
function accountNumberEntered() {
    var accountNumber = $(".enter-number-input")[0].value;
    if (accountNumber == "") {
        return;
    }

    // check that account number in account
    var validAccountNumber = false;
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].accountNumber == accountNumber) {
            validAccountNumber = true;
            break;
        }
    }
    
    if (!validAccountNumber) {
        displayMessage("Account number could not be found. Please try entering it again.", true);
    } else {
        localStorage.setItem("accountNumber", accountNumber);
        window.location.href = "enterpin.html";
    }
}

/***********************************************
* entering pin number 
***********************************************/
function pinNumberEntered() {
    var pinNumber = $(".enter-number-input")[0].value;
    if (pinNumber == "")
        return;
    
    // check that account number in account
    var validPinNumber = false;
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].accountPin == pinNumber 
         && accounts[i].accountNumber == localStorage.getItem("accountNumber")) {
            validPinNumber = true;
            break;
        }
    }
 
    if (!validPinNumber) {
        displayMessage("Pin number incorrect. Please try again.", true);
    } else {
        window.location.href = "mainmenu.html";
    }
}

/***********************************************
* loads accounts from json file 
***********************************************/
function loadAccountsJson() {
    var accountsJson = [];
    $.ajax({
        type: 'GET',
        url: 'accounts.json',
        dataType: 'json',
        success: function (data) { accountsJson = data; },
        async: false
    });
    return accountsJson.accounts;
}

/***********************************************
* Show alert message 
***********************************************/
var fadingOut = false;
var timer;
function displayMessage(message, isError) {
    var messageBox = $(".message-box")[0];
    if (fadingOut) {
        clearInterval(timer);
    }
    
    // set background colour
    if (isError) {
        messageBox.style.backgroundColor = "#ff7b7b";
    } else {
        messageBox.style.backgroundColor = "#a6ddbf";
    }
    
    // set message text
    $(".message-box-text")[0].innerHTML = message;
    
    // show it, then fade it out after a few seconds
    var opacity = 1;
    messageBox.style.opacity = "1";
    fadingOut = true;
    setTimeout(function () {
        timer = setInterval(function () {
            if (opacity <= 0.05) {
                clearInterval(timer);
                opacity = 0;
                fadingOut = false;
            }
            messageBox.style.opacity = opacity;
            opacity -= 0.05;
        }, 50);
    }, 4000);
}

/***********************************************
* logout 
***********************************************/
function logout(isCancellingPin) {
    localStorage.setItem("accountNumber", null);
    localStorage.setItem("pinNumber", null);
    if (isCancellingPin) {
        window.location.href = "index.html?cancelPin";
    } else {
        window.location.href = "index.html?logout";
    }
}

/***********************************************
* change languages 
***********************************************/
function switchLanguage() {
    var switchButton = $(".switch-language-button")[0];
    if (switchButton.innerHTML == "English") {
        switchButton.innerHTML = "Français";
    } else {
        switchButton.innerHTML = "English";
    }
}
