function checkAccountNumber() {
    accountNumber = $(".enter-account-input")[0].value;
    
    // load accounts
    var accountsJson = [];
    $.ajax({
        type: 'GET',
        url: 'accounts.json',
        dataType: 'json',
        success: function(data) { accountsJson = data;},
        async: false
    });
    
    // check that account number in account
    var validAccountNumber = false;
    for (var i = 0; i < j.accounts.length; i++) {
        if (accountsJson.accounts[i].accountNumber == accountNumber) {
            validAccountNumber = true;
        }
    }
    
    if (!validAccountNumber) {
        displayError("Account number could not be found.");
    } else {
        localStorage.setItem("accountNumber", accountNumber);
        window.location.href = "enterpin.html";
    }
}

function getAccountNumber() {
    return localStorage.getItem("accountNumber");
}

function checkPinNumber() {
    pinNumber = $(".enter-pin-input")[0].value;
    localStorage.setItem("pinNumber", pinNumber);
    window.location.href = "mainmenu.html";
}

function displayError(errorString) {
    $("#error-box").style.visibility = true;
    $("#error-box-text").html = errorString;
}
