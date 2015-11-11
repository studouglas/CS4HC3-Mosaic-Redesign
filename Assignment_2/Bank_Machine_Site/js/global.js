/*jshint passfail: false */
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

    if (localStorage.getItem("currentLang") == null) {
        localStorage.setItem("currentLang", "English");
    }
    setLanguageElements();
    
    // ENTER ACCT # PAGE =========================================
    if (window.location.href.indexOf("index.html") > -1) {
        if (window.location.href.indexOf("logout") > -1) {
            displayMessage("You have been successfully logged out.", false);
            window.history.pushState('', document.title, window.location.href.substring(0, window.location.href.indexOf("?")));
        } else if (window.location.href.indexOf("cancelPin") > -1) {
            displayMessage("Login successfully cancelled.", false);
            window.history.pushState('', document.title, window.location.href.substring(0, window.location.href.indexOf("?")));
        }
    }
    
    
    // POPULATE VIEW ACCTS =========================================
    else if (window.location.href.indexOf("viewaccounts.html") > -1 || window.location.href.indexOf("confirm.html") > -1) {
        $(".account-number-label")[0].innerHTML = currentAccount.accountNumber;
        if ($(".account-number-label")[1] != null) {
            $(".account-number-label")[1].innerHTML = currentAccount.accountNumber;
        }
        for (i = 0; i < currentAccount.bankAccounts.length; i++) {
            var lineToAdd = $(".view-accounts-container")[0].innerHTML;
            lineToAdd += "<p class=\"account-name\">";
            lineToAdd += currentAccount.bankAccounts[i].name;
            lineToAdd += "</p>\n<p class=\"account-balance\">$";
            lineToAdd += getBalance(currentAccount.bankAccounts[i].name) + "</p><br>";
            lineToAdd += (i == currentAccount.bankAccounts.length - 1) ? "" : "<hr class=\"account-separator\"/>";
            $(".view-accounts-container")[0].innerHTML = lineToAdd;
        }
    }
    
    // POPULATE SELECT ACCT DROPDOWN =========================================
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
   
    // ENABLE/DISABLE BUTTON FROM INPUT =========================================
    if (($(".enter-number-input")[0]) != null && window.location.href.indexOf("enterpin.html") < 0) {
        $(".enter-number-input").bind('input', function () {
            var val = $(this).val();
            
            // show error if invalid
            if (isNaN(val) || val == "") {
                $(".enter-number-button").addClass("disabled-button")
                
                // show error box
                if ($(".enter-number-input-error")[0] != null) {
                    $(".enter-number-input-error")[0].style.visibility = "visible";
                    if ($(".enter-number-input-error")[1] != null) {
                        $(".enter-number-input-error")[1].style.visibility = "visible";
                    }
                }
            } else {
                $(".enter-number-button").removeClass("disabled-button");
                
                // hide error box
                if ($(".enter-number-input-error")[0] != null) {
                    $(".enter-number-input-error")[0].style.visibility = "hidden";
                    if ($(".enter-number-input-error")[1] != null) {
                        $(".enter-number-input-error")[1].style.visibility = "hidden";
                    }
                }
            }
            
            // transfer.html -- show error if account not selected
            if (selectedFromAccountName == null && $(".from-not-selected-error")[0] != null) {
                $(".from-not-selected-error")[0].style.visibility = "visible";
                $(".from-not-selected-error")[1].style.visibility = "visible";
            }
            if (selectedToAccountName == null && $(".to-not-selected-error")[0] != null) {
                $(".to-not-selected-error")[0] .style.visibility = "visible";
                $(".to-not-selected-error")[1] .style.visibility = "visible";
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
    if (pinNumber == "") {
        return;
    }

    // check that pin number in correct
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
    var translatedMessage = translate(message);

    if (fadingOut) {
        clearInterval(timer);
        fadingOut = false;
        message.style.opacity = 0;
    }
    
    // set background colour
    if (isError) {
        messageBox.style.backgroundColor = "#ff7b7b";
    } else {
        messageBox.style.backgroundColor = "#a6ddbf";
    }
    
    // set message text
    $(".message-box-text")[0].innerHTML = translatedMessage;
    
    // show it, then fade it out after a few seconds
    var opacity = 1;
    messageBox.style.opacity = opacity;
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
    if (isCancellingPin) {
        window.location.href = "index.html?cancelPin";
    } else {
        window.location.href = "index.html?logout";
    }
}

/***********************************************
* change languages 
***********************************************/
function switchLanguageClicked() {
    var switchButton = $(".switch-language-button")[0];
    if (switchButton.innerHTML == "Switch to English") {
        localStorage.setItem("currentLang", "English");
    } else {
        localStorage.setItem("currentLang", "French");
    }
    setLanguageElements();
}

/***********************************************
* hides/shows appropriate elements 
***********************************************/
function setLanguageElements() {
    var isEnglish = (localStorage.getItem("currentLang") != "French");
    
    var englishElements = $(".english");
    var frenchElements = $(".french");
    
    $(".switch-language-button")[0].innerHTML = isEnglish ? "Changez à Français" : "Switch to English";
    for (var i = 0; i < frenchElements.length; i++) {
        frenchElements[i].style.display = isEnglish ? "none" : "";
    }
    for (var i = 0; i < englishElements.length; i++) {
        englishElements[i].style.display = isEnglish ? "" : "none";
    }
    
    var selectAccountButtons = $(".select-account-button");
    for (var i = 0; i < selectAccountButtons.length; i++) {
        if (isEnglish && selectAccountButtons[i].innerHTML.indexOf("▼") > -1) {
            selectAccountButtons[i].innerHTML = "Choose Account <span style='font-size: 12px;'>▼</span>";   
        } else if (!isEnglish && selectAccountButtons[i].innerHTML.indexOf("▼") > -1) {
            selectAccountButtons[i].innerHTML = "Choisissez compte <span style='font-size: 12px;'>▼</span>";   
        }
    }
    if ($(".enter-amount-input")[0] != null) {
        $(".enter-amount-input")[0].placeholder = isEnglish ? "Amount" : "Somme";
    }
    if ($("#AccountNumber")[0] != null) {
        $("#AccountNumber")[0].placeholder = isEnglish ? "Account Number" : "Numéro de compte";
    }
    if ($("#PinNumber")[0] != null) {
        $("#PinNumber")[0].placeholder = isEnglish ? "Pin Number" : "Numéro secret";
    }
    if ($(".message-box")[0] != null) {
        $(".message-box-text")[0].innerHTML = translate($(".message-box-text")[0].innerHTML);
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
function showAccountsPicker(isToAccountPicker) {
    if (isToAccountPicker) {
        $(".select-account-table")[0].style.visibility = "hidden";    
        if ($(".select-account-table")[1] != null) {
            $(".select-account-table")[1].style.visibility = "visible";    
        }
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
function selectAccount(sender, accountName, isToAccountPicker) {
    var selectedBalance = getBalance(accountName);
    
    if (window.location.href.indexOf("transfermoney.html") > -1) {
        if (isDescendant($(".select-account-table")[0], sender)) { // from
            selectedFromAccountName = accountName;
            $(".from-not-selected-error")[0].style.visibility = "hidden";
            $(".from-not-selected-error")[1].style.visibility = "hidden";
        } else if (isDescendant($(".select-account-table")[1], sender)) { // to
            selectedToAccountName = accountName;
            $(".to-not-selected-error")[0].style.visibility = "hidden";
            $(".to-not-selected-error")[1].style.visibility = "hidden";
        }
    } else {
        selectedBankAccountName = accountName;
    }
    $(".enter-number-input")[0].disabled = false;
    
    // add the name and balance as button text
    var lineToAdd = "<span class=\"left-column select-account-span\" onclick=\"showAccountsPicker(" + isToAccountPicker + ")\">";
    lineToAdd += accountName;
    lineToAdd += "</span><span class=\"right-column select-account-span\" onclick=\"showAccountsPicker(" + isToAccountPicker + ")\" style=\"font-weight: 800;\">$";
    lineToAdd += selectedBalance;
    lineToAdd += "</span>"
    
    var i = (isToAccountPicker == true) ? 1 : 0;
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
        displayMessage("Amount in unrecognized format.", true);
        return;
    }
    if (amount % 20.0 != 0 || amount == 0) {
        displayMessage("Bank machine can only dispense $20 bills.", true);
        return;
    }
    
    if (updateBalance(selectedBankAccountName, -amount)) {
        window.location.href = "confirm.html";
    } else {
        displayMessage("Not enough funds in '" + selectedBankAccountName + "' to perform withdrwawal.", true);
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
        displayMessage("Amount in unrecognized format.", true);
    }
    
    if (updateBalance(selectedBankAccountName, amount)) {
        window.location.href = "confirm.html";
    } else {
        console.log("Error when depositing");
    }
}

/**********************************************
* transfer money
***********************************************/
function transfer() {
    if ($("#transfer-button").hasClass("disabled-button")) {
        return;
    }
    
    var amount = parseFloat($(".enter-number-input")[0].value);
    if (selectedFromAccountName == null || selectedToAccountName == null) {
        displayMessage("Two accounts must be selected to perform transfer.", true);
        return;
    }
    if (selectedFromAccountName == selectedToAccountName) {
        displayMessage("Cannot perform transfer to same account.", true);
        return;
    }
    if (isNaN($(".enter-number-input")[0].value)) {
        displayMessage("Amount in unrecognized format.", true);
        return;
    }
    if (amount < 1.00) {
        displayMessage("A minimum value of $1.00 is required for a transfer.", true);
        return;
    }
    
    // perform transfer
    if (updateBalance(selectedFromAccountName, -amount)) { 
        updateBalance(selectedToAccountName, amount);
        window.location.href = "confirm.html";
    } else {
        displayMessage("Not enough funds in '" + selectedFromAccountName + "' to perform transfer.",true);
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

/***********************************************
* translation text
***********************************************/
function translate(message) {
    if (localStorage.getItem("currentLang") != "French") {
        return message;
    }
    
    if (message.indexOf("Not enough funds in") > -1 && message.indexOf("to perform transfer.") > -1) {
        var accountName = message.substring(20, message.indexOf("to perform transfer"));
        return "Pas assez d'argent en " + accountName + " pour faire transfert.";
    } else if (message.indexOf("Not enough funds in") > -1 && message.indexOf("to perform withdrawal") > -1) {
        var accountName = message.substring(20, message.indexOf("to perform withdrawal."));
        return "Pas assez d'argent en " + accountName + " pour faire retrait.";
    }

    switch (message) {
        case "You have been successfully logged out.":
            message = "Vous vous avez été déconnecté.";
            break;
        case "Login successfully cancelled.":
            message = "Ouverture de session a été annulé.";
            break;
        case "Account number could not be found. Please try entering it again.":
            message = "Numéro de compte n'était pas trouvé. Réessayez.";
            break;
        case "Pin number incorrect. Please try again.":
            message = "Code confidential n'était pas correcte. Réessayez.";
            break;
        case "Amount in unrecognized format.":
            message = "Format n'est pas correcte.";
            break;
        case "Bank machine can only dispense $20 bills.":
            message = "Ce machine a seulement des billets de $20.";
            break;
        case "Two accounts must be selected to perform transfer.":
            message = "Deux comptes doivent être choisi.";
            break;
        case "Cannot perform transfer to same account.":
            message = "On ne peut pas transferer à la même compte.";
            break;
        case "A minimum value of $1.00 is required for a transfer.":
            message = "On a besoin d'un minimum de $1.00 pour faire le transfer.";
            break;
        default: 
            break;
    }
    return message;
}
