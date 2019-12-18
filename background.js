var user = '';
var isEnabled = false;

(function () {
    chrome.storage.sync.get(['user', 'enabled'], function (result) {
        user = JSON.parse(result.user);
        isEnabled = result.enabled;
        login()
    })
}())
chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        var headers = info.responseHeaders;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1); // Remove header
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [ '*://*/*' ], // Pattern to match all http(s) pages
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request.enabled);
        isEnabled = request.enabled;
        if (request.enabled) {
            location.reload
        }
        login()
        sendResponse({
            ok: "ok"
        })
    });

function login() {
    console.log('enabled ' + isEnabled)
    // listen for our browerAction to be clicked
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        // for the current tab, inject the "inject.js" file & execute it
        if (tab.status === "complete" && isEnabled) {
            if (tab.url === "https://isis.tu-berlin.de/login/index.php" && isEnabled) {
                console.log('executing' + isEnabled);
                
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