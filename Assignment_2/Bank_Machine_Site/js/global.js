// load accounts from JSON file
function loadAccountsJson() {
    var accountsJson = [];
    $.ajax({
        type: 'GET',
        url: 'accounts.json',
        dataType: 'json',
        success: function(data) { accountsJson = data;},
        async: false
    });
    return accountsJson;
}

function accountNumberEntered() {
    var accountNumber = $(".enter-number-input")[0].value;
    var accountsJson = loadAccountsJson();
    
    // check that account number in account
    var validAccountNumber = false;
    for (var i = 0; i < accountsJson.accounts.length; i++) {
        if (accountsJson.accounts[i].accountNumber == accountNumber) {
            validAccountNumber = true;
            break;
        }
    }
    
    if (!validAccountNumber) {
        displayError("Account number could not be found. Please try entering it again.");
    } else {
        localStorage.setItem("accountNumber", accountNumber);
        window.location.href = "enterpin.html";
    }
}

function pinNumberEntered() {
    var pinNumber = $(".enter-number-input")[0].value;
    var accountsJson = loadAccountsJson();
    
    // check that account number in account
    var validPinNumber = false;
    for (var i = 0; i < accountsJson.accounts.length; i++) {
        if (accountsJson.accounts[i].accountPin == pinNumber 
         && accountsJson.accounts[i].accountNumber == localStorage.getItem("accountNumber")) {
            validPinNumber = true;
            break;
        }
    }
 
    if (!validPinNumber) {
        displayError("Pin number incorrect. Please try again.");
    } else {
        window.location.href = "mainmenu.html";
    }
}

function displayError(errorString) {
    // flash error box
    if ($(".error-box")[0].style.visibility == "visible") {
        $(".error-box")[0].style.backgroundColor = "green";
    } else {
        $(".error-box")[0].style.visibility = "visible";
    }
    $(".error-box-text")[0].innerHTML = errorString;
}

function hideError() {
    $(".error-box")[0].style.visibility = "hidden";
    $(".error-box-text")[0].innerHTML = "Error text here.";
}
