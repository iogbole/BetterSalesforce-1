// Script to Background listener, badge updates.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.command) {
        case 'greeting':
            chrome.browserAction.setBadgeText({text: '' + request.data});
            break;
    }
});

/*
chrome.browserAction.onClicked.addListener(function(tab) {
   chrome.tabs.create({url: chrome.extension.getURL('options.html')});
});
*/