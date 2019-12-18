// dummy credentials
var user = {
    username: 'please enter credentials',
    password: ''
};
var isEnabled = false;

// initializer IIFE 
var initializer;
(initializer = () => {
    chrome.storage.sync.get(['user', 'enabled'], function (result) {

        if (result.enabled == null || result.enabled == undefined) {
            isEnabled = false;
        } else {
            isEnabled = result.enabled;
        }


        if (result.user == null || result.user == undefined) {
            isEnabled = false;
            chrome.storage.sync.set({
                'enabled': false
            })
            chrome.storage.sync.set({
                'user': JSON.stringify(user)
            })

        } else {
            user = JSON.parse(result.user)
        }
        login()
    })
})();


// listen to checkbox change
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request.enabled);
        isEnabled = request.enabled;
        if (request.reason == "checkbox") {
            if (request.enabled) {
                location.reload
            }
            login()
        }
        if (request.reason == "user"){
            initializer()
        }

        sendResponse({
            ok: "ok"
        })
    });

// login automate
function login() {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        // for the current tab, inject the "inject.js" file & execute it
        if (tab.status === "complete" && isEnabled) {
            if (tab.url === "https://isis.tu-berlin.de/" && isEnabled){
                tab.url = 'https://isis.tu-berlin.de/login/index.php'
            }
            if (tab.url === "https://isis.tu-berlin.de/login/index.php" && isEnabled) {

                chrome.tabs.executeScript(tab.ib, {
                    code: '	document.getElementById("shibbolethbutton").click()'
                });
                return;

            } else if (tab.url.includes("https://shibboleth.tubit.tu-berlin.de/idp/profile/SAML2/") && isEnabled) {
                chrome.tabs.executeScript(tab.ib, {
                    code: 'var user = ' + JSON.stringify(user)
                }, function () {
                    chrome.tabs.executeScript(tab.ib, {
                        code: `(function() {
                            console.log(user.username);
                            document.getElementById("username").value = user.username;
                            document.getElementById("password").value = user.password;                        
                            document.getElementById("login-button").click();
                           
                        })();`
                    })
                });
                return;
            }
        }

    });

}