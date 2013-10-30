// ==UserScript==
// @name Cloud_Cache
// @description Stop clearing the damn cache
// @author Josh
// @match *://*/admin/settings-cache!input.jspa
// ==/UserScript==

if (isCloudCachePage()) {
    var badElement = getBadElement();

    $(badElement).remove();
}

function isCloudCachePage() {
    if ($("#jive-userStatus:contains('7c3')").length > 0)
    {
        return true;
    }

    return false;
}

function getBadElement() {
    return $(".cacheStats:contains('Community Display Name Cache')").parent();
}