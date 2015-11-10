'use strict';

var accounts;
var currentAccount;
var selectedBankAccountName;
var selectedFromAccountName;
var selectedToAccountName;

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

    //read current language and display appropriate tags
    if (localStorage.getItem("currentLang") == null) { //if current language has not yet been set in cache, set to english
            localStorage.setItem("currentLang", "English");
    }
    var switchButton = $(".switch-language-button")[0];
    //var engElems = document.getElementsByClass("english");
    //var frnElems = document.getElementsbyClass("french");
    if (localStorage.getItem("currentLang") == "English"){
            switchButton.innerHTML = "English";
            //for (var i = 0; i < frnElems.length; i++) {
            //frnElems[i].disabled = true;
            //}
            //document.getElementsbyId("english").disabled=false;
    }else if (localStorage.getItem("currentLang") == "French"){
            switchButton.innerHTML = "Français";
            //for (var i = 0; i < engElems.length; i++) {
            //engElems[i].disabled = true;
            //}			
            //document.getElementsById("french").disabled=false;
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
    
    else if (window.location.href.indexOf("enterpin.html") > -1){
    }
    
    // view accounts
    else if (window.location.href.indexOf("viewaccounts.html") > -1 || window.location.href.indexOf("confirm.html") > -1) {
        $(".account-number-label")[0].innerHTML = currentAccount.accountNumber;
        for (var i = 0; i < currentAccount.bankAccounts.length; i++) {
            var lineToAdd = $(".view-accounts-container")[0].innerHTML;
            lineToAdd += "<p class=\"account-name\">";
            lineToAdd += currentAccount.bankAccounts[i].name;
            lineToAdd += "</p>\n<p class=\"account-balance\">$";
            lineToAdd += getBalance(currentAccount.bankAccounts[i].name) + "</p><br>";
            lineToAdd += (i == currentAccount.bankAccounts.length-1) ? "" : "<hr class=\"account-separator\"/>";
            $(".view-accounts-container")[0].innerHTML = lineToAdd;
        }
    }
    
    // populate select account dropdowns
    else if (window.location.href.indexOf("withdraw.html") > -1
          || window.location.href.indexOf("transfermoney.html") > -1
          || window.location.href.indexOf("deposit.html") > -1) {
        for (var j = 0; j < $(".select-account-table").length; j++) {
            for (var i = 0; i < currentAccount.bankAccounts.length; i++) {
                var lineToAdd = $(".select-account-table")[j].innerHTML;
                lineToAdd += "<tr class=\"select-account-row\" onclick=\"selectAccount(this,\'";
                lineToAdd += currentAccount.bankAccounts[i].name;
                lineToAdd += "\'," + (j == 1) + ")\">\n<td class=\"select-account-column-1\">";
                lineToAdd += currentAccount.bankAccounts[i].name;
                lineToAdd += "</td>\n<td class=\"select-account-column-2\">$";
                lineToAdd += getBalance(currentAccount.bankAccounts[i].name) + "</td>\n</tr>";
                $(".select-account-table")[j].innerHTML = lineToAdd;
            }
        }
    }
   
    // when input changes, enable withdraw/deposit button 
    if (($(".enter-number-input")[0]) != null) {
        $(".enter-number-input").bind('input', function () {
            var val = $(this).val();
            if (isNaN(val)) {
                $(".enter-number-button").addClass("disabled-button")
                if ($(".enter-number-input-error")[0] != null) {
                    $(".enter-number-input-error")[0].style.visibility = "visible";
                }
            } else {
                $(".enter-number-button").removeClass("disabled-button")
                if ($(".enter-number-input-error")[0] != null) {
                    $(".enter-number-input-error")[0].style.visibility = "hidden";
                }
            }
            
            if (selectedFromAccountName == null && $(".from-not-selected-error")[0] != null) {
                $(".from-not-selected-error")[0].style.visibility = "visible";
            }
            if (selectedToAccountName == null && $(".from-not-selected-error")[0] != null) {
                $(".to-not-selected-error")[0] .style.visibility = "visible";
            }
        });
    }
});

/***********************************************
* Dismiss dropdown if click outside of it 
***********************************************/
$(document).click(function (e) {
   if ($(".select-account-container")[0] != null 
    && !isDescendant($(".select-account-container")[0], e.target)) {
       $(".select-account-table")[0].style.visibility = "hidden";
    }
    if ($(".select-account-container")[1] != null
     && !isDescendant($(".select-account-container")[1], e.target)) {
        $(".select-account-table")[1].style.visibility = "hidden";
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
        localStorage.setItem("currentLang", "French");
        switchButton.innerHTML = "Français";
    } else {
        localStorage.setItem("currentLang", "English");
        switchButton.innerHTML = "English";
    }		
}

/***********************************************
* returns the default value from JSON or modified
* from localStorage
***********************************************/
function getBalance(accountName) {
    var bankAccountKey = currentAccount.accountNumber + accountName;

    if (localStorage.getItem(bankAccountKey) != null) {
        return localStorage.getItem(bankAccountKey);
    } else {
        for (var i = 0; i < currentAccount.bankAccounts.length; i++) {
            if (currentAccount.bankAccounts[i].name == accountName) {
                return currentAccount.bankAccounts[i].balance;
            }
        }
        return "ERROR: Account" + accountName + " could not be found";
    }
}

/***********************************************
* delta is float, can be positive or negative 
***********************************************/
function updateBalance(accountName, delta) {
    var newBalance = parseFloat(getBalance(accountName)) + parseFloat(delta);
    if (newBalance < 0) {
        return false;
    } else {
        var accountKey = currentAccount.accountNumber + accountName;
        localStorage.setItem(accountKey, newBalance.toFixed(2));
    }
    return true;
}

/***********************************************
* Removes all localStorage items (except acct #) 
***********************************************/
function resetBalanceUpdates() {
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i) != "accountNumber" && localStorage.key(i) != "currentLang") {
            console.log("Resetting balance for: " + localStorage.key(i));
            localStorage.removeItem(localStorage.key(i));
        }
    }
}

/***********************************************
* Shows dropdown with accounts 
***********************************************/
function showAccountsPicker(second) {
    if (second) {
        $(".select-account-table")[0].style.visibility = "hidden";    
        $(".select-account-table")[1].style.visibility = "visible";    
    } else {
        $(".select-account-table")[0].style.visibility = "visible";
        if ($(".select-account-table")[1] != null) {
            $(".select-account-table")[1].style.visibility = "hidden";    
        }
    }
}

/***********************************************
* Choose account from dropdown 
***********************************************/
function selectAccount(sender, accountName, second) {
    
    var selectedBalance = getBalance(accountName);
    
    if (window.location.href.indexOf("transfermoney.html") > -1) {
        if (isDescendant($(".select-account-table")[0], sender)) {
            selectedFromAccountName = accountName;
            $(".from-not-selected-error")[0].style.visibility = "hidden";
        } else if (isDescendant($(".select-account-table")[1], sender)) {
            selectedToAccountName = accountName;
            $(".to-not-selected-error")[0].style.visibility = "hidden";
        }
    } else {
        selectedBankAccountName = accountName;
        $(".enter-number-input")[0].disabled = false;
    }
    
    // add the name and balance as button text
    var lineToAdd = "<span class=\"left-column select-account-span\" onclick=\"showAccountsPicker(" + second + ")\">";
    lineToAdd += accountName;
    lineToAdd += "</span><span class=\"right-column select-account-span\" onclick=\"showAccountsPicker(" + second + ")\" style=\"font-weight: 800;\">$";
    lineToAdd += selectedBalance;
    lineToAdd += "</span>"
    
    var i = (second == true) ? 1 : 0;
    $(".select-account-table")[i].style.visibility = "hidden";
    $(".select-account-button")[i].innerHTML = lineToAdd;
    $(".select-account-button")[i].textAlign = "center";
}

/***********************************************
* Withdraw the money
***********************************************/
function withdraw() {
    if ($("#withdraw-button").hasClass("disabled-button")) {
        return;
    }
    var amount = parseFloat($(".enter-number-input")[0].value);
    if (isNaN(amount)) {
        displayMessage("Amount in unrecognized format", true);
    }
    
    if (updateBalance(selectedBankAccountName, -amount)) {
        window.location.href = "confirm.html";
    } else {
        displayMessage("Not enough funds in '" + selectedBankAccountName + "' to withdraw that amount", true);
    }
}

/***********************************************
* Deposit money 
***********************************************/
function deposit() {
    if ($("#deposit-button").hasClass("disabled-button")) {
        return;
    }
    var amount = parseFloat($(".enter-number-input")[0].value);
    if (isNaN(amount)) {
        displayMessage("Amount in unrecognized format", true);
    }
    
    if (updateBalance(selectedBankAccountName, amount)) {
        window.location.href = "confirm.html";
    } else {
        console.log("Error when depositing");
    }
}

/**********************************************
* Checks to ensure Transfer is valid 
***********************************************/
function checkValidTransfer() {
    var amount = parseFloat($(".enter-number-input")[0].value);
    if (selectedFromAccountName == null || selectedToAccountName == null) {
        displayMessage("Both accounts must be selected", true);
        return;
    }
    if (selectedFromAccountName == selectedToAccountName) {
        displayMessage("Cannot transfer to same account", true);
        return;
    }
    if (isNaN(amount)) {
        displayMessage("Amount in unrecognized format", true);
        return;
    }
    
    if (updateBalance(selectedFromAccountName, -amount)) { 
        updateBalance(selectedToAccountName, amount);
        window.location.href = "confirm.html";
    } else {
        displayMessage("Not enough funds in '" + selectedFromAccountName + "' to perform transfer",true);
    }
}

/***********************************************
*  true if 2nd arg contained in 1st 
***********************************************/
function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
}
