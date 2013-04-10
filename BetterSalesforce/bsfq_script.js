// ==UserScript==
// @name BetterSalesforce
// @description Makes Salesforce a bit more bearable
// @author Cory G., Seth P., Taylor T., Sean S., Josh L.
// @match https://na3.salesforce.com/*
// ==/UserScript==

var version = "4.0.0";

// Entry point
$(document).ready(function () {

    fixUI();
    refreshList();

    //initJiveUI();

    //fireQChangesWhenReady(true);
    //window.setInterval(autoQRefresh, 1000);
});

// Sends click event to the SF refresh button
function refreshList() {
    $('.btn.refreshListButton').get(0).click();
}

// Remove unnecessary styling and other DOM elements from the Salesforce page
function fixUI() {

    function moveElements() {

        $('#phHeaderLogoImage').attr("src", chrome.extension.getURL("images/bg.png")).css("width","100");
        $('.zen-active').attr("style", "background-color:#A55647;");
        $('#tabBar').append("<li id='Other_Tab'></li>");
        $('div.controls').appendTo("#Other_Tab");
        $('div.filterLinks a').unwrap();
        $('#Other_Tab').attr("style", "float:right;");
        $('#Other_Tab').find('div select').attr("style", "padding:3px;");
        $('td.right').append("<span style='float:right;font-weight:bold;'>BSFQ v"+version+"</span>");
        $('.btn.refreshListButton').appendTo('td.right').hide();
        $('.bodyDiv').css("border-top", "0");
        $('td.oRight').css("padding", "5px");
    }

    function removeElements() {

        $('li .btn').hide();
        $('#sidebarCell').remove();
        $('.subNav > .linkBar').remove();
        $('.topNavTab').remove();
        $('.multiforce').remove();
        $('div .controls img').remove();
        $('div.bPageFooter').remove();
    }

    function removeTabs() {
        $('.zen-tabMenu li').each(function () {
            if ( !$(this).is('#home_Tab') && !$(this).is("#Case_Tab") && !$(this).is("#report_Tab") && !$(this).is("#Dashboard_Tab") && !$(this).is("#Other_Tab")) {
                $(this).remove();
            }
        });
    }

    function removeStyling() {
        removeFile("dCustom0.css", "css");
        removeFile("Case.css", "css");
        removeFile("HelpBubble.css","css");
        removeFile("chatterExtended.css","css");
        removeFile("dStandard.css","css");
        removeFile("chatterCore.css","css");
    }

    function removeFile(filename,filetype) {
        var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none"; //determine element type to create nodelist from
        var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none"; //determine corresponding attribute to test for
        var allsuspects=document.getElementsByTagName(targetelement);
        for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
                allsuspects[i].parentNode.removeChild(allsuspects[i]); //remove element by calling parentNode.removeChild()
        }
    }

    moveElements();
    removeElements();
    removeTabs();
    removeStyling();
}
