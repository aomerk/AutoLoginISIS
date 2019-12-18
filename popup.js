// //Wire up event event handlers
// document.addEventListener("DOMContentLoaded", function(event) {
//     var resultsButton = document.getElementById("getResults");
//     resultsButton.onclick = getResults();
// });
var currentUser = {
    username: '',
    password: ''
}



var checkbox = document.getElementById("enable-checkbox");

document.getElementById("user-form").addEventListener('submit', saveUser)
getData();



function getData() {
    chrome.storage.sync.get(['user', 'enabled'], function (result) {
        currentUser = JSON.parse(result.user);
        checkbox.checked = result.enabled;
        console.log('Value is  ' + JSON.stringify(currentUser));
        console.log('Value is  ' + checkbox.checked);
        document.getElementById("user-form")[0].value = currentUser.username;
        document.getElementById("user-form")[1].value = currentUser.password;

    })
}

function saveUser(event) {
    currentUser.username = document.getElementById("user-form")[0].value;
    currentUser.password = document.getElementById("user-form")[1].value;
    chrome.storage.sync.set({
        'user': JSON.stringify(currentUser)
    }, function () {
        getData()
        alert(`new user ${currentUser.username} saved`);
    });
    event.preventDefault();
}
checkbox.addEventListener('change', function () {
    chrome.storage.sync.set({
        'enabled': this.checked
    }, function () {
        getData()
    });
    chrome.runtime.sendMessage({
        enabled: this.checked
    }, function (response) {});
})