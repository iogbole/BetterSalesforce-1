// ==UserScript==
// @name BetterSalesforce
// @description Makes Salesforce a bit more bearable
// @author Cory G., Seth P., Taylor T., Sean S., Josh L.
// @match https://na3.salesforce.com/*
// ==/UserScript==


// Helper functions
var getId = function (arg) {
    return document.getElementById(arg);
};
var getClass = function (arg) {
    return document.getElementsByClassName(arg);
};

// Account Support
var ACCOUNT_Q = '00B50000006LnHq';
//var MODULE_Q = '00B50000005nIpQ';

// Frontline
var SOLO_Q = '00B50000006NMcv';

// Surgical
var ALEX_Q = '00B50000006MQxb';
var JACOB_Q = '00B50000006MQxl';
var TAYLOR_Q = '00B50000006MQy0';

// S&M
var ARNOLD_Q = '00B50000006Mk6c';
var JOSH_Q = '00B50000006MQxq';

// Girth
var AARON_Q = '00B50000006Nknd';
var BEN_Q = '00B50000006MkP5';
var BENW_Q = '00B50000006NcAj';
var DOUG_Q = '00B50000006Mk6X';
var ELAINE_Q = '00B50000006NcBq';
var FRANK_Q = '00B50000006Mz3S';
var PATRICK_Q = '00B50000006NcC0';
var TIM_Q = '00B50000006NB7W';
var VINCE_Q = '00B50000006NL86';

//EMEA Frontline
var FEMI_Q = '00B50000006NkFH';
var IZABELA_Q = '00B50000006Muvr';
var BINTA_Q = '00B50000006Nhik';
var NEBIL_Q = '00B50000006N5Ol';

//EMEA Backline

var ISRAEL_Q ='00B50000006N6as'
var ADAM_Q ='00B50000006N5Og'
var SHAILESH_Q = '00B50000006Muvw';


// Big Qs
var SUPPORT_Q = '00B50000006LTCj';
var EMEA_Q = '00B50000006NkFM';
var US2EMEA_Q = '00B50000006Mi54';
var EMEA2US_Q = '00B50000006Mi4v';
var SEV1_Q = '00B50000006Lh9v';
var GIRTH_Q = '00B50000006MwXb';
var SURG_Q = '00B50000006MQvk';
var SNM_Q = '00B50000006MXM8';

// Day Counts
var BACKLINE_ESCALATED_Q = '00B50000006MXCN';
var CASES_TAKEN_Q = '00B50000006NS1g';

// Descriptions of Links
var JIVECOMMUNITY_DESC = 'Open Case in Jive Community';
var T2_DESC = 'Bump IT!';
var HOSTING_DESC = 'Send to Hosting Queue';
var ACCOUNT_DESC = 'Send to Account Support Queue';
var FRONTLINE_DESC = 'Send to Frontline Queue';

// Queue Names
var BACKLINE_QUEUE = 'Backline';
var ACCOUNT_SUPPORT_QUEUE = 'AccountSupport';
var HOSTING_QUEUE = 'Hosting';
var SUPPORT_QUEUE = 'Support';

// Sprite Image File
var SPRITE_IMAGE = chrome.extension.getURL("images/bsf-sprites.png");

// Some variables that are used in the script.
var subjCol, statusCol, pCol, slaCol, accountCol, selectedCase = null, selectedRow = null;

// Frontline High Count and Medium Count
var mediumCount = 25;
var highCount = 50;


function setQueueCount(view_id, dom_obj) {
    $.post("/_ui/common/list/ListServlet", {
        'action':'filter',
        'filterId':view_id,
        'filterType':'t',
        'page':'1',
        'rowsPerPage':'50'
    }, function (data) {
        dom_obj.text(data.match(/"totalRowCount":(\d+)/)[1]);
    }, 'text');
}


// Global Variables
var caseLinks = {};
var inProgressCount = 0;
var queueTitle;
var paused = false; // is the 30 second refresh paused?

if (isQPage()) {

    localStorage.shouldInit = true;
    localStorage.refreshCount = 0;

    fixSalesforceUI();
    initJiveUI();

    fireQChangesWhenReady(true);
    window.setInterval(autoQRefresh, 1000);
}

function assignToQueue(sf_id, queue) {
    $.get('/' + sf_id + '/a', function (data) {
        $.post("/" + sf_id + "/a", {
            '_CONFIRMATIONTOKEN':$(data).find('#_CONFIRMATIONTOKEN').attr('value'),
            'id':sf_id,
            'ids':sf_id,
            'newOwn_mlktp':'case_queue',
            'newOwn_lktp':'case_queue',
            'newOwn_mod':1,
            'newOwn':queue,
            'save':' Save '}, function () {
            refreshQ();
        });
    });
}

function fireQChangesWhenReady(firstRun, timesRun) {
    if (timesRun == undefined) {
        timesRun = 0;
    }

    if (initQDetails(firstRun) || isQEmpty()) {
        ready = true;
        removeOrWaitForRefreshButton();

        //Hide the div that pops up when the queue is refreshing
        $('.waitingSearchDiv').width(0).css('overflow', 'hidden');
        $('.waitingHolder').hide();

        $('#q-refresh').fadeIn();
        $('#q-loading').hide();

        var curr_mode = localStorage.mode; // Get currently set queue mode

        if (curr_mode == 'Girth') {
            setQueueCount(AARON_Q, $('#aaron-in-progress'));
            setQueueCount(BEN_Q, $('#ben-in-progress'));
            setQueueCount(BENW_Q, $('#benw-in-progress'));
            setQueueCount(DOUG_Q, $('#doug-in-progress'));
            setQueueCount(ELAINE_Q, $('#elaine-in-progress'));
            setQueueCount(FRANK_Q, $('#frank-in-progress'));
            setQueueCount(PATRICK_Q, $('#patrick-in-progress'));
            setQueueCount(TIM_Q, $('#tim_dooher-in-progress'));
            setQueueCount(VINCE_Q, $('#vince-in-progress'));
        }
        else if (curr_mode == 'Surgical') {
            setQueueCount(ALEX_Q, $('#alex_evans-in-progress'));
            setQueueCount(JACOB_Q, $('#jacob-in-progress'));
            setQueueCount(TAYLOR_Q, $('#taylor_thornton-in-progress'));
        }
        else if (curr_mode == 'SnM') {
            setQueueCount(ARNOLD_Q, $('#arnold-in-progress'));
            setQueueCount(JOSH_Q, $('#josh_leckbee-in-progress'));
        }

        else if (curr_mode == 'EMEA-Backline') {
            setQueueCount(SHAILESH_Q, $('#shailesh-in-progress'));
            setQueueCount(ADAM_Q, $('#adam-in-progress'));
            setQueueCount(ISRAEL_Q, $('#israel-in-progress'));

        }

        else if (curr_mode == 'EMEA-Frontline') {
            setQueueCount(IZABELA_Q, $('#izabela-in-progress'));
            setQueueCount(FEMI_Q, $('#femi-in-progress'));
            setQueueCount(BINTA_Q, $('#binta-in-progress'));
            setQueueCount(NEBIL_Q, $('#nebil-in-progress'));

        }
        else {
            setQueueCount(SOLO_Q, $('#solo-in-progress'));
        }

        // Bigs
        if (curr_mode == 'Account Support') {
            setQueueCount(ACCOUNT_Q, $('#account-support-queue-count'));
            setQueueCount(CASES_TAKEN_Q, $('#cases-taken'));
            setQueueCount(SUPPORT_Q, $('#support-queue'));
            setQueueCount(US2EMEA_Q, $('#us2emea-queue'));
            setQueueCount(EMEA2US_Q, $('#emea2us-queue'));
        }
        else {
            setQueueCount(BACKLINE_ESCALATED_Q, $('#backline-escalated'));
            setQueueCount(CASES_TAKEN_Q, $('#cases-taken'));
            setQueueCount(SUPPORT_Q, $('#support-queue'));

            if (curr_mode == 'EMEA-Frontline') {
                setQueueCount(EMEA_Q, $('#emea-queue'));
            }
            else if (curr_mode == 'EMEA-Backline') {
                setQueueCount(EMEA_Q, $('#emea-queue'));
            }
            else if (curr_mode == 'Girth') {
                setQueueCount(GIRTH_Q, $('#girth-queue'));
            }
            else if (curr_mode == 'Surgical') {
                setQueueCount(SURG_Q, $('#surg-queue'));
            }
            else if (curr_mode == 'SnM') {
                setQueueCount(SNM_Q, $('#snm-queue'));
            }

            setQueueCount(SEV1_Q, $('#sev1-queue'));
            setQueueCount(US2EMEA_Q, $('#us2emea-queue'));
            setQueueCount(EMEA2US_Q, $('#emea2us-queue'));
        }
        highlightQueues();

        //Start building the links after everything else calculates.
        initRows();
        if (firstRun)
        {
            window.addEventListener('resize', initRows, true);
        }
    }
    else if (timesRun < 100) {
        setTimeout((function () {
            fireQChangesWhenReady(firstRun, timesRun + 1);
        }), (firstRun ? 500 : 250));
    }
}

function getModes() {
    var modeString;
    var currMode = localStorage.mode;

    if (currMode == 'Frontline') {
        modeString =
            '<OPTION VALUE = "Account Support" >Account Support</OPTION>' +
                '<OPTION VALUE = "EMEA-Backline">EMEA Backline</OPTION>' +
                '<OPTION VALUE = "EMEA-Frontline">EMEA Frontline</OPTION>' +
                '<OPTION VALUE = "Frontline" selected>Frontline</OPTION>' +
                '<OPTION VALUE = "Girth">Girth</OPTION>' +
                '<OPTION VALUE = "Surgical">Surgical</OPTION>' +
                '<OPTION VALUE = "SnM">SnM</OPTION>';
    }
    else if (currMode == 'Girth') {
        modeString =
            '<OPTION VALUE = "Account Support" >Account Support</OPTION>' +
                '<OPTION VALUE = "EMEA-Backline">EMEA Backline</OPTION>' +
                '<OPTION VALUE = "EMEA-Frontline">EMEA Frontline</OPTION>' +
                '<OPTION VALUE = "Frontline" >Frontline</OPTION>' +
                '<OPTION VALUE = "Girth" selected>Girth</OPTION>' +
                '<OPTION VALUE = "Surgical">Surgical</OPTION>' +
                '<OPTION VALUE = "SnM">SnM</OPTION>';

    }
    else if (currMode == 'Surgical') {
        modeString =
            '<OPTION VALUE = "Account Support" >Account Support</OPTION>' +
                '<OPTION VALUE = "EMEA-Backline">EMEA Backline</OPTION>' +
                '<OPTION VALUE = "EMEA-Frontline">EMEA Frontline</OPTION>' +
                '<OPTION VALUE = "Frontline" >Frontline</OPTION>' +
                '<OPTION VALUE = "Girth">Girth</OPTION>' +
                '<OPTION VALUE = "Surgical" selected>Surgical</OPTION>' +
                '<OPTION VALUE = "SnM">SnM</OPTION>';
    }
    else if (currMode == 'Account Support') {
        modeString =
            '<OPTION VALUE = "Account Support" selected>Account Support</OPTION>' +
                '<OPTION VALUE = "EMEA-Backline">EMEA Backline</OPTION>' +
                '<OPTION VALUE = "EMEA-Frontline">EMEA Frontline</OPTION>' +
                '<OPTION VALUE = "Frontline" >Frontline</OPTION>' +
                '<OPTION VALUE = "Girth">Girth</OPTION>' +
                '<OPTION VALUE = "Surgical">Surgical</OPTION>' +
                '<OPTION VALUE = "SnM">SnM</OPTION>';
    }

    else if (currMode == 'EMEA-Frontline') {
        modeString =
            '<OPTION VALUE = "Account Support" >Account Support</OPTION>' +
                '<OPTION VALUE = "EMEA-Backline">EMEA Backline</OPTION>' +
                '<OPTION VALUE = "EMEA-Frontline" selected>EMEA Frontline</OPTION>' +
                '<OPTION VALUE = "Frontline" >Frontline</OPTION>' +
                '<OPTION VALUE = "Girth">Girth</OPTION>' +
                '<OPTION VALUE = "Surgical">Surgical</OPTION>' +
                '<OPTION VALUE = "SnM">SnM</OPTION>';

    }
    else if (currMode == 'EMEA-Backline') {
        modeString =
            '<OPTION VALUE = "Account Support" >Account Support</OPTION>' +
                '<OPTION VALUE = "EMEA-Backline" selected>EMEA Backline</OPTION>' +
                '<OPTION VALUE = "EMEA-Frontline">EMEA Frontline</OPTION>' +
                '<OPTION VALUE = "Frontline" >Frontline</OPTION>' +
                '<OPTION VALUE = "Girth">Girth</OPTION>' +
                '<OPTION VALUE = "Surgical">Surgical</OPTION>' +
                '<OPTION VALUE = "SnM">SnM</OPTION>';
    }

    else {
        modeString =
            '<OPTION VALUE = "Account Support" >Account Support</OPTION>' +
                '<OPTION VALUE = "EMEA-Backline" selected>EMEA Backline</OPTION>' +
                '<OPTION VALUE = "EMEA-Frontline">EMEA Frontline</OPTION>' +
                '<OPTION VALUE = "Frontline">Frontline</OPTION>' +
                '<OPTION VALUE = "Girth">Girth</OPTION>' +
                '<OPTION VALUE = "Surgical">Surgical</OPTION>' +
                '<OPTION VALUE = "SnM" selected>SnM</OPTION>' ;

    }

    return modeString;
}

function getSoloQueuesHtml() {
    var html = '';

    if (localStorage.mode == 'Girth') {
        html =
                '<span class="t2-queue"><a href="500?fcf=00B50000006Nknd" style="color:black">Aaron (<span id="aaron-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006MkP5" style="color:black">Ben (<span id="ben-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006NcAj" style="color:black">Ben2 (<span id="benw-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006Mk6X" style="color:black">Doug (<span id="doug-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006NcBq" style="color:black">Elaine (<span id="elaine-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006Mz3S" style="color:black">Frank (<span id="frank-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006NcC0" style="color:black">Patrick (<span id="patrick-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006NB7W" style="color:black">Tim (<span id="tim_dooher-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006NL86" style="color:black">Vince (<span id="vince-in-progress">*</span>)</a></span>';
    }
    else if (localStorage.mode == 'Surgical') {
        html =
            '<span class="t2-queue"><a href="500?fcf=00B50000006MQxb" style="color:black">Alex (<span id="alex_evans-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006MQxl" style="color:black">Jacob (<span id="jacob-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006MQy0" style="color:black">Taylor (<span id="taylor_thornton-in-progress">*</span>)</a></span>';
    }
    else if (localStorage.mode == 'SnM') {
        html =
            '<span class="t2-queue"><a href="500?fcf=00B50000006Mk6c" style="color:black">Arnold (<span id="arnold-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006MDyq" style="color:black">Josh (<span id="josh_leckbee-in-progress">*</span>)</a></span>';
    }

    else if (localStorage.mode == 'EMEA-Frontline') {
        html =
            '<span class="t2-queue"><a href="500?fcf=00B50000006Muvr" style="color:black">Izabela (<span id="izabela-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006N5Ol" style="color:black">Nebil (<span id="nebil-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006NkFH" style="color:black">Femi (<span id="femi-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006Nhik" style="color:black">Binta (<span id="binta-in-progress">*</span>)</a></span>' ;
    }
    else if (localStorage.mode == 'EMEA-Backline') {
        html =
            '<span class="t2-queue"><a href="500?fcf=00B50000006Muvw" style="color:black">Shailesh (<span id="shailesh-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006N5Og" style="color:black">Adam (<span id="adam-in-progress">*</span>)</a></span>' +
                '<span class="t2-queue"><a href="500?fcf=00B50000006N6as" style="color:black">Israel (<span id="israel-in-progress">*</span>)</a></span>';
    }

    else {
        html =
            '<span class="t2-queue"><a href="500?fcf=00B50000006NMcv" style="color:black">My Queue(<span id="solo-in-progress">*</span>)</a></span>';
    }

    return html;
}

function getBigQueuesHtml() {
    //Support, Backline, and Severity 1 Queues
    var bigQHtml =
        '<span class="t2-queue big"><a href="500?fcf=00B50000006Lh9v" id="sev1" style="font-size:120%;font-weight:bold;color:red;display:none;">NEW P1!!(<span id="sev1-queue">*</span>)</a></span>' +
            '<span class="t2-queue big"><a href="500?fcf=00B50000006LTCj" style="color:black">Frontline (<span id="support-queue">*</span>)</a></span>';

    if (localStorage.mode == 'Girth') {
        bigQHtml += '<span class="t2-queue big"><a href="500?fcf=00B50000006MwXb" style="color:black">Girth (<span id="girth-queue">*</span>)</a></span>';
    }
    else if (localStorage.mode == 'SnM') {
        bigQHtml += '<span class="t2-queue big"><a href="500?fcf=00B50000006MXM8" style="color:black">SnM (<span id="snm-queue">*</span>)</a></span>';
    }
    else if (localStorage.mode == 'Surgical') {
        bigQHtml += '<span class="t2-queue big"><a href="500?fcf=00B50000006MQvk" style="color:black">Surg (<span id="surg-queue">*</span>)</a></span>';
    }
    else if (localStorage.mode == 'EMEA-Frontline') {
        bigQHtml += '<span class="t2-queue big"><a href="500?fcf=00B50000006NkFM" style="color:black"> EMEA HOT Accounts (<span id="emea-queue">*</span>)</a></span>';
    }
    else if (localStorage.mode == 'EMEA-Backline') {
        bigQHtml += '<span class="t2-queue big"><a href="500?fcf=00B50000006NkFM" style="color:black"> EMEA HOT Accounts(<span id="emea-queue">*</span>)</a></span>';
    }

    // Daily Statistics
    bigQHtml +=
        '<br /><span class="t2-queue">Today <span id="backline-escalated">*</span> cases have been escalated to Backline.</span>';
    if (localStorage.mode != "Frontline") {
        bigQHtml +=
            '<span class="t2-queue big" id="us"><a href="500?fcf=00B50000006Mi54" style="color:black">From_US (<span id="us2emea-queue">*</span>)</a></span>' +
                '<span class="t2-queue big" id="us"><a href="500?fcf=00B50000006Mi4v" style="color:black">From_EMEA (<span id="emea2us-queue">*</span>)</a></span>';
    }
    bigQHtml +=
        '<br /><span class="t2-queue">You\'ve taken <span id="cases-taken">*</span> today.</span>' +
            '</div>' +
            '<div id="q-refresh" style="float:right;width:20%;text-align:right"><p>refreshing in <strong id="q-refresh-count">0</strong> seconds</p>' +
            '<a href="javascript:;" id="refresh-q-link">refresh queue</a> &nbsp; &nbsp; <a href="javascript:;" id="refresh-links">refresh links</a> &nbsp; &nbsp; <a href="javascript:;" id="pause-refresh">pause</a>' +
            '</div>' +
            '<div id="q-loading" style="float:right;width:20%;text-align:right;display:none;">brewing...<br /> &nbsp;</div>' +
            '<div style="clear:both"></div></div>';

    return bigQHtml;
}

// Initialize GUI objects
function initJiveUI() {

    if (localStorage.shouldInit == 1) {

        console.log("here")
        return;
    }

    if (localStorage.mode == undefined || localStorage.mode == 'undefined' || localStorage.mode == 'Backline')
    {
        localStorage.mode = 'SnM';
    }
    if (localStorage.refreshTime == undefined || localStorage.refreshTime == 'undefined' ||
        localStorage.refreshTime == 'NaN')
    {
        localStorage.refreshTime = 25;
    }

    var appensionHtml = '<style>.x-grid3-row-table  tr:hover { background: #E3EFF3; } .t2-queue span {padding-right:0 !important;} .big {float: right;} ' +

        //Sprite CSS
        '.sprite-icon { background: url(' + SPRITE_IMAGE +
        ') no-repeat top left; width:16px; height:16px; display:inline-block; } ' +
        '.sprite-tier2-icon{ background-position:0 -376px; } .sprite-account_support{ background-position:0 0; } ' +
        '.sprite-hosting{background-position:0 -132px;} .sprite-favicon{background-position:0 -66px;} ' +

        //Fixed the Action Column from shifting.
        '.x-grid3-td-ACTION_COLUMN {width:64px !important;} </style> ' +
        '<div id="q-panel" style="margin:5px 0px; padding: 5px; border:#CCC solid 1px"> <div style="float:left;width:15%"><div>Mode: ';

    appensionHtml += '<select id="change-mode" onChange="window.location.reload()">' + getModes() + '</select>';

    appensionHtml += '<br>';

    appensionHtml += 'Refresh: ';

    appensionHtml += '<input type="range" min="5" max="45" step="5" value="' + localStorage.refreshTime +
        '" onChange="localStorage.refreshTime = value;" title="' + localStorage.refreshTime + '" />';

    appensionHtml += '</div></div><div style="float:left;width:60%;">';

    // Add queues to appending HTML
    appensionHtml += getSoloQueuesHtml();

    // Account Support View	
    if (localStorage.mode == 'Account Support') {
        appensionHtml +=
            '<span class="t2-queue big"><a href="500?fcf=00B50000006LnHq" style="color:black">Account Support (<span id="account-support-queue-count">*</span>)</a></span>' +
                '<span class="t2-queue big"><a href="500?fcf=00B50000006LTCj" style="color:black">Support (<span id="support-queue">*</span>)</a></span>' +

                // Daily Queues for Account Support
                '<br /><span class="t2-queue">You\'ve taken <span id="cases-taken">*</span> today.</span>' +
                '</div>' +
                '<div id="q-refresh" style="float:right;width:20%;text-align:right"><p>refreshing in <strong id="q-refresh-count">0</strong> seconds</p>' +
                '<a href="javascript:;" id="refresh-q-link">refresh queue</a> &nbsp; &nbsp; <a href="javascript:;" id="refresh-links">refresh links</a> &nbsp; &nbsp; <a href="javascript:;" id="pause-refresh">pause</a>' +
                '</div>' +
                '<div id="q-loading" style="float:right;width:30%;text-align:right;display:none;">brewing...<br /> &nbsp;</div>' +
                '<div style="clear:both"></div></div>';
    }
    else {
        appensionHtml += getBigQueuesHtml();
    }

    // Append HTML to nav
    $('.topNav.primaryPalette').append(appensionHtml);
    $('#change-mode').change(changeMode);
    $('#refresh-q-link').click(refreshQ);
    $('#refresh-links').click(initRows);
    $('#pause-refresh').click(function () {
        paused = !paused;
        $('#pause-refresh').text(paused ? 'resume' : 'pause');
    });

    //Set title of page
    queueTitle = $('.title option:selected').text();
    document.title = '(*) ' + queueTitle;

}

function isQPage() {
    if (document.title.indexOf('Cases') == 0) {
        return true;
    }
    return false;
}

function isSupportQPage() {
    var supportIndex = document.title.indexOf('Support');
    if (supportIndex >= 4) {
        return true;
    }
    return false;
}

function isQEmpty() {
    return getClass("x-grid-empty").length > 0;
}

// TODO: Special buttons that Account Support has causes buttons not to appear. Need to hide them as well
function fixSalesforceUI() {
    // Get rid of the screen-wasting sidebar
    $('#sidebarCell').hide();

    // Move the New Case, Accept, Change Owner, and Refresh links up to the top bar
    $('.controls .clearingBox').replaceWith($('.subNav > .linkBar > .listButtons').remove());
    $('.controls').append($('<div class="clearingBox" />'));
    // Hide where those links used to be
    $('.subNav > .linkBar').hide();
    // We hide the refresh button in the fireQChangesWhenReady function to pick up on post-refresh changes
    removejscssfile("dCustom0.css", "css");
    removejscssfile("Case.css", "css");
    removejscssfile("HelpBubble.css","css");
    removejscssfile("chatterExtended.css","css");
    removejscssfile("dStandard.css","css");
    removejscssfile("chatterCore.css","css");
    //removejscssfile("common.css","css");
    //removejscssfile("ExtCSS-SFDC.css","css");
}

function removeOrWaitForRefreshButton() {
    function removeSFRefresh() {
        if ($('.btn.refreshListButton').length) {
            $('.btn.refreshListButton').hide();
        }
        else {
            setTimeout(removeSFRefresh, 250);
        }
    }

    removeSFRefresh();
}

function autoQRefresh() {
    var qcount = getId('q-refresh-count');
    if (qcount && !paused) {
        var num = parseInt(qcount.innerHTML) - 1;
        if (num > 0) {
            qcount.innerHTML = num + '';
        }
        else {
            refreshQ();
        }
    }
}

//Returns false if the Queue isn't refreshed or loaded
function initQDetails(firstRun) {
    var cols = getClass('x-grid3-row-table'); //get the td columns of the first entry

    if ((firstRun && !getId('ext-gen3')) || (!firstRun && (getId('gm_modded') || !getId('ext-gen9'))))
    {
        return false;
    }
    if (!cols || !cols.length) {
        return false;
    }
    cols = cols[0].childNodes[0].childNodes[0].childNodes;

    for (var i = 0; i < cols.length; ++i) {
        var classes = cols[i].getAttribute('class');

        if (classes.indexOf('x-grid3-td-CASES_SUBJECT') > -1 || classes.indexOf('x-grid3-td-Subject') > -1)
        {
            subjCol = i;
        }
        else if (classes.indexOf('x-grid3-td-CASES_STATUS') > -1)
        {
            statusCol = i;
        }
        else if (classes.indexOf('x-grid3-td-Priority') > -1)
        {
            pCol = i;
        }
        else if (classes.indexOf('x-grid3-td-ACCOUNT_NAME') > -1)
        {
            accountCol = i;
        }

        // Checks to find the SLA Field and record the field column number
        else if (classes.indexOf('x-grid3-td-00N50000002SfG9') > -1)
        {
            slaCol = i;
        }
    }
    return true;
}

function refreshQ() {
    $('#q-refresh-count').text(localStorage.refreshTime);

    //if not already refreshing
    // TODO: Do we need to guard against multiple refreshes?
    $('#q-refresh').hide();
    $('#q-loading').fadeIn();

    // SalesForce will remove this element when the refresh is complete
    el = document.createElement('span');
    el.id = 'gm_modded';

    if (isQEmpty()) {
        getClass('x-grid-empty')[0].appendChild(el);
    }
    else {
        getClass('x-grid3-row')[0].appendChild(el);
    }

    queueTitle = $('.title option:selected').text();
    document.title = '(*) ' + queueTitle;


    //Trigger the SalesForce refresh 
    //jQuery's click() doesn't seem to fire the handler defined in the onclick attribute (boo),
    // so we use the (hopefully working) DOM element's .click method
    $('.btn.refreshListButton').get(0).click();

    setTimeout(function () {
        fireQChangesWhenReady(false);
    }, 0);

    localStorage.refreshCount++;

    if (localStorage.refreshCount >= 5) {
        localStorage.refreshCount = 0;
        localStorage.shouldInit = 1;
    } else {
        localStorage.shouldInit = 0;
    }
}

function changeMode() {
    localStorage.mode = $('#change-mode').val();
}

function highlightQueues() {
    if (localStorage.mode == 'Girth') {
        highlightGirth();
    }
    else if (localStorage.mode == 'Surgical') {
        highlightSurgical();
    }
    else if (localStorage.mode == 'SnM') {
        highlightSnM();
    }
    else if (localStorage.mode == 'Account Support') {
        highlightSolo();
        highlightAS();
    }

    else if (localStorage.mode == 'EMEA-Frontline') {
        highlightEMEAFrontline();
    }
    else if (localStorage.mode == 'EMEA-Backline') {
        highlightEMEABackline();
    }
    else {
        highlightSolo();
    }

    highlightSevOnes();
    highlightFrontlineQueue();
    highlightBacklineQueue();
    highlightEscalatedQueue();
    highlightTaken();
}

function highlightSolo() {
    var low = 6;
    var high = 13;
    var arr = new Array('solo-in-progress');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num < low) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num >= low && num < high) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightSurgical() {
    var low = 6;
    var high = 13;
    var arr = new Array('alex_evans-in-progress', 'jacob-in-progress','taylor_thornton-in-progress');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num < low) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num >= low && num < high) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightSnM() {
    var low = 6;
    var high = 13;
    var arr = new Array('arnold-in-progress', 'eliz-in-progress','josh_leckbee-in-progress');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num < low) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num >= low && num < high) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightEMEAFrontline() {
    var low = 6;
    var high = 13;
    var arr = new Array('izabela-in-progress', 'nebil-in-progress', 'femi-in-progress', 'binta-in-progress');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num < low) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num >= low && num < high) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}
function highlightEMEABackline() {
    var low = 6;
    var high = 13;
    var arr = new Array('shailesh-in-progress', 'adam-in-progress', 'israel-in-progress');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num < low) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num >= low && num < high) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightGirth() {
    var low = 6;
    var high = 13;
    var arr = new Array('aaron-in-progress','ben-in-progress', 'benw-in-progress', 'doug-in-progress', 'elaine-in-progress','frank-in-progress',
        'patrick-in-progress', 'tim_dooher-in-progress', 'vince-in-progress');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num <= low) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num > low && num < high) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightSevOnes() {
    var arr = new Array('sev1-queue');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num < 1) {
                $('#sev1').css({'display':'none'});
                chrome.extension.sendMessage({greeting:'0'});
            }
            else {
                $('#sev1').css({'display':'inline'});
                chrome.extension.sendMessage({greeting:'' + num});
            }
            ;
        }
    });
}

function highlightAS() {
    var arr = new Array('account-support-queue-count');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num < 20) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num >= 20 && num < 30) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightFrontlineQueue() {
    var arr = new Array('support-queue');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);

            if (num < mediumCount) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num >= mediumCount && num < highCount) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightBacklineQueue() {
    var arr = new Array('backline-in-progress');

    if (localStorage.mode == 'Girth') {
        arr.push('girth-queue');
    }
    else if (localStorage.mode == 'Surgical') {
        arr.push('surg-queue');
    }
    else if (localStorage.mode == 'SnM') {
        arr.push('snm-queue');
    }
    else if (localStorage.mode == 'EMEA-Backline') {
        arr.push('emea-queue');
    }

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num < 10) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num >= 10 && num < 25) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightEscalatedQueue() {
    var arr = new Array('backline-escalated');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num < 25) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num >= 25 && num < 35) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightTaken() {
    var high = 3;
    var low = 2;
    var arr = new Array('cases-taken');

    $.each(arr, function () {
        var count = $('#' + this).text();
        if (count != '*') {
            var num = parseInt(count);
            if (num > high) {
                $('#' + this).css({'font-weight':'bolder', 'color':'green'});
            }
            else if (num <= high && num > low) {
                $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
            }
            else {
                $('#' + this).css({'font-weight':'bolder', 'color':'red'});
            }
        }
    });
}

function highlightRows(case_rows) {
    for (var i in case_rows) {
        var cols = case_rows[i].childNodes;
        var sfurl = recursiveChild(cols[subjCol], 'a').href;

        if (sfurl) {
            // Draw the colors for the enhanced support customers
            if (typeof(cols[slaCol]) != 'undefined') {
                if (slaCol && cols[slaCol].textContent == 'Gold') {
                    case_rows[i].parentNode.style.backgroundColor = '#FFC125';
                }
                else if (slaCol && cols[slaCol].textContent == 'Platinum') {
                    case_rows[i].parentNode.style.backgroundColor = '#CCCCFF';
                }
            }

            // If this was refreshed, see if this case was selected
            if (selectedCase == sfurl) {
                case_rows[i].style.backgroundColor = '#fdffe3';
                selectedRow = case_rows[i];
            }
            else if (statusCol && cols[statusCol].textContent != 'In Progress') {
                case_rows[i].parentNode.style.backgroundColor = '#EEE';
            }
            else {
                inProgressCount += 1;
            }


            // Is it a P1? If so, bold it!
            if (pCol && cols[pCol].textContent == 'Level 1') {
                for (var j in case_rows[i].childNodes)
                {
                    if (case_rows[i].childNodes[j].style)
                    {
                        case_rows[i].childNodes[j].style.fontWeight = 'bold';
                    }
                }
            }
        }
    }
}

function initRows() {
    if (getClass('x-grid3-td-CASES_SUBJECT').length || getClass('x-grid3-td-Subject').length)
    {
        inProgressCount = 0;
        var case_rows = getCaseRows();

        //Highlight the row after the row is clicked
        highlightRows(case_rows);

        document.title = '(' + inProgressCount + ') ' + queueTitle;
        addLinksToRows(case_rows);
    }
}

function addLinksToRows(case_rows) {
    for (var i in case_rows) {
        if(i < 11) {
            addLinksToRow(case_rows[i].childNodes[subjCol].childNodes[0]);
        } else {
            setTimeout(addLinksToRow(case_rows[i].childNodes[subjCol].childNodes[0]), (15*i));
        }
    }
}

function createCaseLinks(sf_id, jive_case_url) {
    return '<a href="' + jive_case_url + '" target="_blank" class="sprite-icon sprite-favicon"> </a> &nbsp; ' +
        '<a href="' + '/' + sf_id + '/a?retURL=' + location.href.replace('https://na3.salesforce.com', '') +
        '"><em>[C]</em></a> &nbsp;';
}

function createCaseLinksFrontline(sf_id, jive_case_url) {
    if (isSupportQPage() == false) {
        return '<a href="' + jive_case_url + '" target="_blank" title="' + JIVECOMMUNITY_DESC +
            '" class="sprite-icon sprite-favicon"> </a> &nbsp; ' +
            '<a href="javascript:;" id="' + sf_id + '_LEVEL_UP" title="' + T2_DESC +
            '" class="sprite-icon sprite-tier2-icon"> </a> &nbsp; ' +
            '<a href="javascript:;" id="' + sf_id + '_ACCOUNT_SUPPORT" title="' + ACCOUNT_DESC +
            '" class="sprite-icon sprite-account_support"> </a> &nbsp; ' +
            '<a href="javascript:;" id="' + sf_id + '_HOSTING" title="' + HOSTING_DESC +
            '" class="sprite-icon sprite-hosting"> </a> &nbsp;';
    }
    return '<a href="' + jive_case_url + '" title="' + JIVECOMMUNITY_DESC +
        '" class="sprite-icon sprite-favicon"> </a> &nbsp;';
}

function createCaseLinksAccountSupport(sf_id, jive_case_url) {
    return '<a href="' + jive_case_url + '" target="_blank" title="' + JIVECOMMUNITY_DESC + '" ' +
        'class="sprite-icon sprite-favicon"> </a> &nbsp; ' +
        '<a href="javascript:;" id="' + sf_id +
        '_SUPPORT_Q" title="' + FRONTLINE_DESC + '" class="sprite-icon sprite-tier2-icon"> </a> &nbsp; ' +
        '<a href="javascript:;" id="' + sf_id +
        '_HOSTING" title="' + HOSTING_DESC + '" class="sprite-icon sprite-hosting"> </a> &nbsp; ';
}

function insertCaseLinks(dom, sf_id, links) {
    // Check to see if links are already populated
    if ($(dom).find('a[href*=jivesoftware]').length)
    {
        return;
    }
    $(dom).prepend(links);

    // If in Frontline View
    if (localStorage.mode == 'Frontline') {
        $(dom).find('a[id$="_LEVEL_UP"]').click(function () {
            assignToQueue(sf_id, BACKLINE_QUEUE);
        });
        $(dom).find('a[id$="_ACCOUNT_SUPPORT"]').click(function () {
            assignToQueue(sf_id, ACCOUNT_SUPPORT_QUEUE);
        });
        $(dom).find('a[id$="_HOSTING"]').click(function () {
            assignToQueue(sf_id, HOSTING_QUEUE);
        });
    }

    // If in Account Support View
    else if (localStorage.mode == 'Account Support') {
        if ($(dom).find('a[href*=jivesoftware]').length) {
            return;
        } // Links already populated
        $(dom).prepend(links);
        $(dom).find('a[id$="_SUPPORT_Q"]').click(function () {
            assignToQueue(sf_id, SUPPORT_QUEUE);
        });
        $(dom).find('a[id$="_HOSTING"]').click(function () {
            assignToQueue(sf_id, HOSTING_QUEUE);
        });
    }
}

function addLinksToRow(linkTag) {
    var sfurl = $(linkTag).find('a:last').attr('href');
    var sf_id = sfurl.substring(1);

    if (caseLinks[sf_id]) {
        insertCaseLinks(linkTag, sf_id, caseLinks[sf_id]);
    }
    else {
        var added = false;

        if (added) {
            return;
        }

        //TODO: Bad Performing Code. Need to revamp the code in order to mac
        //Set up ajax request
        $.get(sfurl).success(function (data) {
            added = true;
            var href = $(data).find('a[href^="https://community.jivesoftware.com"]').attr('href');

            if (href) {
                if (localStorage.mode == 'Frontline')
                {
                    caseLinks[sf_id] = createCaseLinksFrontline(sf_id, href);
                }
                else if (localStorage.mode == 'Account Support')
                {
                    caseLinks[sf_id] = createCaseLinksAccountSupport(sf_id, href);
                }
                else {
                    caseLinks[sf_id] = createCaseLinks(sf_id, href);
                }
                insertCaseLinks(linkTag, sf_id, caseLinks[sf_id]);
            }
        });
    }
}

function getCaseRows() {
    var tables = getClass('x-grid3-row-table');
    var rows = [];

    for (var i in tables) {
        if (tables[i].childNodes && tables[i].childNodes.length && tables[i].childNodes[0].childNodes) {
            rows.push(tables[i].childNodes[0].childNodes[0]);
        }
    }
    return rows;
}

//Returns the first result of the child object of obj that matches selector
function recursiveChild(obj, selector) {
    var res, children, i;
    selector = selector.toUpperCase();

    for (i = 0; i < obj.childNodes.length; ++i) {
        if (obj.childNodes[i].tagName == selector) {
            return obj.childNodes[i];
        }
    }

    for (i = 0; i < obj.childNodes.length; ++i) {
        res = recursiveChild(obj.childNodes[i], selector);
        if (res) {
            return res;
        }
    }
    return null;
}

function accountLink(i) {
    return case_rows[i].childNodes[accountCol].childNodes[0].childNodes[0];
}


function inArray(arr, obj) {
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i] == obj) {
            return true;
        }
    }
    return false;
}

function destroy(el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

// Function for removing unused CSS or JS from page for optimization purposes
function removejscssfile(filename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
            allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
}