// Script to Background listener, badge updates.
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {    
    if (!request.greeting) {
        chrome.browserAction.setBadgeText({text: 'NULL'});
    } else {
        // If there are no Sev 1s, then instead of showing "0" we just don't show the badge at all
        if (request.greeting == 0){
            chrome.browserAction.setBadgeText({text: ''});
        } else {
            chrome.browserAction.setBadgeText({text: '' + request.greeting});
        }

    }
  });