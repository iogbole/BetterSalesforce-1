// Script to Background listener, badge updates.
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (!request.greeting) {
        chrome.browserAction.setBadgeText({text: 'NULL'});
    } else {
        chrome.browserAction.setBadgeText({text: '' + request.greeting});
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
   chrome.tabs.create({url: chrome.extension.getURL('options.html')});
});