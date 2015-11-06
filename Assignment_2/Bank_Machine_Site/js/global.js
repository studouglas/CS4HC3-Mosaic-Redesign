function checkAccountNumber() {
    accountNumber = $(".enter-account-input")[0].value;
    localStorage.setItem("accountNumber", accountNumber);
    window.location.href = "enterpin.html";
}

function getAccountNumber() {
    return localStorage.getItem("accountNumber");
}