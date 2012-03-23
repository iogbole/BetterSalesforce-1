// ==UserScript==
// @name BetterSalesforce
// @description Makes Salesforce a bit more bearable
// @match https://na3.salesforce.com/*
// ==/UserScript==

// Helper functions
var getId = function(arg) { return document.getElementById(arg); };
var getClass = function(arg) { return document.getElementsByClassName(arg); };

// Reverse-engineered salesforce hack(s)
function assignToQueue(sf_id, queue) {
  $.get('/' + sf_id + '/a', function(data) { 

    $.post("/" + sf_id + "/a", { 
         '_CONFIRMATIONTOKEN':$(data).find('#_CONFIRMATIONTOKEN').attr('value') ,
         'id':sf_id,
         'ids':sf_id,
         'newOwn_mlktp':'case_queue',
         'newOwn_lktp':'case_queue',
         'newOwn_mod':1,
         'newOwn':queue,
         'save':' Save '}, function() { refreshQ(); } );
  });
}

// Frontline
var SOLO_Q = '00B50000006MDyq';

// Surgical
var ARNOLD_Q = '00B50000006Mk6c';
var ELIZ_Q = '00B50000006Mk6X';
var JACOB_Q = '00B50000006MQxl';
var RUSSELL_Q = '00B50000006Mk64';

// S&M
var BEN_Q = '00B50000006MkP5';
var DANE_Q = '00B50000006MkPA';

// Girth
var ALEX_Q = '00B50000006MQxb';
var DANIEL_Q = '00B50000006MQxg';
var JOSH_Q = '00B50000006MQxq';
var MATT_Q = '00B50000006MQxv';
var TATSURO_Q = '00B50000006MXuZ';
var TAYLOR_Q = '00B50000006MQy0';

// Big Qs
var BACKLINE_Q = '00B50000006MOiU';
var SUPPORT_Q = '00B50000006LTCj';
var US2EMEA_Q = '00B50000006Mi54';
var EMEA2US_Q = '00B50000006Mi4v';
var SEV1_Q = '00B50000006Lh9v';

// Day Counts
var BACKLINE_ESCALATED_Q = '00B50000006MXCN';
var CASES_TAKEN_Q = '00B50000006MYd5';

// Salesforce
var SF_URL = "500?fcf=";

// Descriptions of Links
var JIVECOMMUNITY_DESC = 'Open Case in Jive Community'
var ACCEPT_DESC = 'Accept this case.'
var T2_DESC = 'Bump IT!'
var HOSTING_DESC = 'Send to Hosting Queue'
var ACCOUNT_DESC = 'Send to Account Support Queue'

// Queue Names
var BACKLINE_QUEUE = 'Backline'
var ACCOUNT_SUPPORT_QUEUE = 'accountsupport'
var HOSTING_QUEUE = 'Hosting'

function setQueueCount(view_id, dom_obj) {
  $.post("/_ui/common/list/ListServlet", {
    'action':'filter',
    'filterId':view_id,
    'filterType':'t',
    'page':'1',
    'rowsPerPage':'50',
  }, function(data) { dom_obj.text(data.match(/"totalRowCount":(\d+)/)[1]) }, 'text');
}


// Global Variables
var waitingDiv;
var caseLinks = {};
var inProgressCount = 0;
var queueTitle;
var alertCount = 1;
var paused = false; // is the 30 second refresh paused?

if( isQPage() ) {
  fixSalesforceUI();
  initJiveUI();
   
  fireQChangesWhenReady(true);
  window.setInterval(autoQRefresh, 1000);
}


function fireQChangesWhenReady(firstRun, timesRun) {
  if( timesRun==undefined ) timesRun = 0;
  
  if( initQDetails(firstRun) || isQEmpty() ) {
    ready = true;
    removeOrWaitForRefreshButton();            

    //Hide the div that pops up when the queue is refreshing
    $('.waitingSearchDiv').width(0).css('overflow', 'hidden');
    $('.waitingHolder').hide();
        
    $('#q-refresh').show();
    $('#q-loading').hide();
    initRows();
    
    var curr_mode = localStorage.mode; // Get currently set queue mode
    
    if ( curr_mode == 'Girth' ) {
	    setQueueCount(ALEX_Q, $('#alex_evans-in-progress'));
	    setQueueCount(DANIEL_Q, $('#daniel_shaver-in-progress'));
	    setQueueCount(TATSURO_Q, $('#tatsuro_alpert-in-progress'));
	    setQueueCount(JOSH_Q, $('#josh_leckbee-in-progress'));
	    setQueueCount(MATT_Q, $('#matt_jarvie-in-progress'));
	    setQueueCount(TAYLOR_Q, $('#taylor_thornton-in-progress'));    
    } else if ( curr_mode == 'Surgical') {	
	    setQueueCount(ARNOLD_Q, $('#arnold-in-progress'));
	    setQueueCount(ELIZ_Q, $('#eliz-in-progress'));
	    setQueueCount(JACOB_Q, $('#jacob-in-progress'));
	    setQueueCount(RUSSELL_Q, $('#russell-in-progress'));    
    } else if ( curr_mode == 'SnM' ) {
	    setQueueCount(BEN_Q, $('#ben-in-progress'));
	    setQueueCount(DANE_Q, $('#dane-in-progress'));
    } else {
	    setQueueCount(SOLO_Q, $('#solo-in-progress'));     
    }

    // Bigs
    setQueueCount(BACKLINE_Q, $('#backline-in-progress'));
    setQueueCount(BACKLINE_ESCALATED_Q, $('#backline-escalated'));
    setQueueCount(CASES_TAKEN_Q, $('#cases-taken'));
    setQueueCount(SUPPORT_Q, $('#support-queue'));
    setQueueCount(SEV1_Q, $('#sev1-queue'));
    setQueueCount(US2EMEA_Q, $('#us2emea-queue'));
    setQueueCount(EMEA2US_Q, $('#emea2us-queue'));  

    highlightQueues();

    if( firstRun ) window.addEventListener('resize',initRows,true);
  } else if( timesRun<100 ) {
    setTimeout( (function() { fireQChangesWhenReady(firstRun, timesRun+1) }), (firstRun ? 500 : 250));
  }
}

function getModes() {
    var modeString;
    var currMode = localStorage.mode;
    
    if (currMode == 'Frontline') {
  	modeString = '<OPTION VALUE = "Frontline" selected>Frontline</OPTION>' +
	 '<OPTION VALUE = "Girth">Girth</OPTION>' +
	 '<OPTION VALUE = "Surgical">Surgical</OPTION>' +
 	 '<OPTION VALUE = "SnM">SnM</OPTION>';
    } else if ( currMode == 'Girth' ) {
	modeString = '<OPTION VALUE = "Frontline" >Frontline</OPTION>' +
	 '<OPTION VALUE = "Girth" selected>Girth</OPTION>' +
	 '<OPTION VALUE = "Surgical">Surgical</OPTION>' +
 	 '<OPTION VALUE = "SnM">SnM</OPTION>';
    } else if ( currMode == 'Surgical' ) {
	modeString = '<OPTION VALUE = "Frontline" >Frontline</OPTION>' +
	 '<OPTION VALUE = "Girth">Girth</OPTION>' +
	 '<OPTION VALUE = "Surgical" selected>Surgical</OPTION>' +
 	 '<OPTION VALUE = "SnM">SnM</OPTION>';
    } else {
	modeString = '<OPTION VALUE = "Frontline">Frontline</OPTION>' +
	 '<OPTION VALUE = "Girth">Girth</OPTION>' +
	 '<OPTION VALUE = "Surgical">Surgical</OPTION>' +
 	 '<OPTION VALUE = "SnM" selected>SnM</OPTION>';
    }

    return modeString;
}

// Initialize GUI objects
function initJiveUI() {
if ( localStorage.mode==undefined || localStorage.mode=='undefined' || localStorage.mode=='Backline') localStorage.mode='SnM';

var appensionHtml ='<style>.x-grid3-row-table  tr:hover { background: #E3EFF3; } .t2-queue span {padding-right:0 !important;} .big {float: right;}</style><div id="q-panel" style="margin:5px 0px; padding: 5px; border:#CCC solid 1px">' +
        '<div style="float:left;width:25%"><div>Mode: ';

	appensionHtml += '<select id="change-mode" onChange="window.location.reload()">' + getModes() + '</select>';

	appensionHtml += '</div></div><div style="float:left;width:40%;">';

	if ( localStorage.mode=='Girth' ) {
	 appensionHtml +=
         '<span class="t2-queue"><a href="500?fcf=00B50000006MQxb" style="color:black">Alex (<span id="alex_evans-in-progress">*</span>)</a></span>' +	 
         '<span class="t2-queue"><a href="500?fcf=00B50000006MQxg" style="color:black">Daniel (<span id="daniel_shaver-in-progress">*</span>)</a></span>' +
         '<span class="t2-queue"><a href="500?fcf=00B50000006MDyq" style="color:black">Josh (<span id="josh_leckbee-in-progress">*</span>)</a></span>' +
         '<span class="t2-queue"><a href="500?fcf=00B50000006MQxv" style="color:black">Matt (<span id="matt_jarvie-in-progress">*</span>)</a></span>' +	 
         '<span class="t2-queue"><a href="500?fcf=00B50000006MXuZ" style="color:black">Tatsuro (<span id="tatsuro_alpert-in-progress">*</span>)</a></span>' +
         '<span class="t2-queue"><a href="500?fcf=00B50000006MQy0" style="color:black">Taylor (<span id="taylor_thornton-in-progress">*</span>)</a></span>';
	 } else if ( localStorage.mode=='Surgical' ) {
	 appensionHtml +=
	 '<span class="t2-queue"><a href="500?fcf=00B50000006Mk6c" style="color:black">Arnold (<span id="arnold-in-progress">*</span>)</a></span>' +
	 '<span class="t2-queue"><a href="500?fcf=00B50000006Mk6X" style="color:black">Eliz (<span id="eliz-in-progress">*</span>)</a></span>' +
	 '<span class="t2-queue"><a href="500?fcf=00B50000006MQxl" style="color:black">Jacob (<span id="jacob-in-progress">*</span>)</a></span>' +
	 '<span class="t2-queue"><a href="500?fcf=00B50000006Mk64" style="color:black">Rusty (<span id="russell-in-progress">*</span>)</a></span>';	 
	 } else if ( localStorage.mode=='SnM' ) {
	 appensionHtml +=
	 '<span class="t2-queue"><a href="500?fcf=00B50000006MkP5" style="color:black">Ben (<span id="ben-in-progress">*</span>)</a></span>' +
	 '<span class="t2-queue"><a href="500?fcf=00B50000006MkPA" style="color:black">Dane (<span id="dane-in-progress">*</span>)</a></span>';
	 } else {
	 appensionHtml +=
	 '<span class="t2-queue"><a href="500?fcf=00B50000006MDyq" style="color:black">My Queue(<span id="solo-in-progress">*</span>)</a></span>';
	 }

	 appensionHtml +=
	 '<span class="t2-queue big"><a href="500?fcf=00B50000006Lh9v" id="sev1" style="font-size:120%;font-weight:bold;color:red;display:none;">NEW P1!!(<span id="sev1-queue">*</span>)</a></span>' +
	 '<span class="t2-queue big"><a href="500?fcf=00B50000006MOiU" style="color:black">Backline (<span id="backline-in-progress">*</span>)</a></span>' +	 
	 '<span class="t2-queue big"><a href="500?fcf=00B50000006LTCj" style="color:black">Frontline (<span id="support-queue">*</span>)</a></span>' +	 
	 
	 // Daily
	 '<br /><span class="t2-queue">Today <span id="backline-escalated">*</span> cases have been escalated to Backline.</span>' +
	 '<span class="t2-queue big" id="us"><a href="500?fcf=00B50000006Mi54" style="color:black">From_US (<span id="us2emea-queue">*</span>)</a></span>' +
 	 '<span class="t2-queue big" id="us"><a href="500?fcf=00B50000006Mi4v" style="color:black">From_EMEA (<span id="emea2us-queue">*</span>)</a></span>' +
	 '<br /><span class="t2-queue">You\'ve taken <span id="cases-taken">*</span> today.</span>' +
        '</div>' +	
        '<div id="q-refresh" style="float:right;width:20%;text-align:right"><p>refreshing in <strong id="q-refresh-count">0</strong> seconds</p>' +
         '<a href="javascript:;" id="refresh-q-link">refresh queue</a> &nbsp; &nbsp; <a href="javascript:;" id="refresh-links">refresh links</a> &nbsp; &nbsp; <a href="javascript:;" id="pause-refresh">pause</a>' +
        '</div>' +
        '<div id="q-loading" style="float:right;width:30%;text-align:right;display:none;">loading...<br /> &nbsp;</div>' +
        '<div style="clear:both"></div></div>';         


	 // Append HTML to nav
	 $('.topNav.primaryPalette').append(appensionHtml);
	
  $('#change-mode').change(changeMode);
  $('#refresh-q-link').click(refreshQ);
  $('#refresh-links').click(initRows);
  $('#pause-refresh').click(function() {
     paused = !paused;
     $('#pause-refresh').text(paused ? 'resume' : 'pause');
  });

  //Set title of page
  queueTitle = $('.title option:selected').text();
  document.title = '(*) ' +  queueTitle;
}

var subjCol, statusCol, pCol, accountCol, selectedCase=null, selectedRow=null;
function isQPage() {
  if( document.title.indexOf('Cases')==0 ) {
    return true;
  }
  return false;
}

function isQEmpty() {
  return getClass("x-grid-empty").length > 0;
}  
 
function fixSalesforceUI() {
  // Get rid of the screen-wasting sidebar
  $('#sidebarCell').hide();
  // Move the New Case, Accept, Change Owner, and Refresh links up to the top bar
  $('.controls .clearingBox').replaceWith($('.subNav > .linkBar > .listButtons').remove());
  $('.controls').append($('<div class="clearingBox" />'));
  // Hide where those links used to be
  $('.subNav > .linkBar').hide();
  // We hide the refresh button in the fireQChangesWhenReady function to pick up on post-refresh changes
}

function removeOrWaitForRefreshButton() {
  function removeSFRefresh() {
    if( $('.btn.refreshListButton').length ) $('.btn.refreshListButton').hide();
    else setTimeout(removeSFRefresh, 250);
  }
  removeSFRefresh();
}

function autoQRefresh() {
  var qcount = getId('q-refresh-count');
  if( qcount && !paused ) {
    var num = parseInt(qcount.innerHTML) - 1;
    if( num>0 ) {
      qcount.innerHTML = num + '';
    } else {
      refreshQ();
    }
  }
}

//Returns false if the Queue isn't refreshed or loaded
function initQDetails(firstRun) {
  if( (firstRun && !getId('ext-gen3')) ||
      (!firstRun && (getId('gm_modded') || !getId('ext-gen9'))) ) return false;
  
  var cols = getClass('x-grid3-row-table'); //get the td columns of the first entry
  if( !cols || !cols.length ) { console.log("false");  return false;}
  cols = cols[0].childNodes[0].childNodes[0].childNodes;
  
  for( var i=0; i<cols.length; ++i ) {
    var classes = cols[i].getAttribute('class');
    if( classes.indexOf('x-grid3-td-CASES_SUBJECT')>-1 )
      subjCol = i;
    else if( classes.indexOf('x-grid3-td-CASES_STATUS')>-1 )
      statusCol = i;
    else if( classes.indexOf('x-grid3-td-Priority')>-1 )
      pCol = i;
    else if( classes.indexOf('x-grid3-td-ACCOUNT_NAME')>-1 )
      accountCol = i;
  }
  return true;
}

function refreshQ() {
  $('#q-refresh-count').text(30);
  //if not already refreshing
  // TODO: Do we need to guard against multiple refreshes?
//  if( getId('q-refresh-count') ) {
    $('#q-refresh').hide();
    $('#q-loading').show();
    
    // SalesForce will remove this element when the refresh is complete
    el = document.createElement('span');
    el.id = 'gm_modded';
    if(isQEmpty())
      getClass('x-grid-empty')[0].appendChild(el);
    else
      getClass('x-grid3-row')[0].appendChild(el);
    
    //Trigger the SalesForce refresh 
    //jQuery's click() doesn't seem to fire the handler defined in the onclick attribute (boo),
    // so we use the (hopefully working) DOM element's .click method
    $('.btn.refreshListButton').get(0).click();

    setTimeout(function(){fireQChangesWhenReady(false)},0);
  //}
}

function changeMode() {
   localStorage.mode = $('#change-mode').val();
}

function highlightQueues(){    
    
    if ( localStorage.mode=='Girth' ) {
    	highlightGirth();
    } else if ( localStorage.mode=='Surgical' ) {
    	highlightSurgical();
    } else if ( localStorage.mode == 'SnM' ) {
    	highlightSnM();
    } else {
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
  
    $.each(arr, function() {
       var count = $('#' + this).text();
       if (count != '*'){
       	   var num = parseInt(count);
           if(num < low){
               $('#' + this).css({'font-weight':'bolder', 'color':'green'});
           } else if (num >= low && num < high){
	       $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
           } else {
               $('#' + this).css({'font-weight':'bolder', 'color':'red'});
           }
       }
    });
}

function highlightSurgical(){
    var low = 6;
    var high = 13;
    var arr = new Array('arnold-in-progress', 'eliz-in-progress', 'jacob-in-progress', 'russell-in-progress');
  
    $.each(arr, function() {
       var count = $('#' + this).text();
       if (count != '*'){
       	   var num = parseInt(count);
           if(num < low){
               $('#' + this).css({'font-weight':'bolder', 'color':'green'});
           } else if (num >= low && num < high){
	       $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
           } else {
               $('#' + this).css({'font-weight':'bolder', 'color':'red'});
           }
       }
    });
}

function highlightSnM(){
    var low = 6;
    var high = 13;
    var arr = new Array('ben-in-progress', 'dane-in-progress');
  
    $.each(arr, function() {
       var count = $('#' + this).text();
       if (count != '*'){
       	   var num = parseInt(count);
           if(num < low){
               $('#' + this).css({'font-weight':'bolder', 'color':'green'});
           } else if (num >= low && num < high){
	       $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
           } else {
               $('#' + this).css({'font-weight':'bolder', 'color':'red'});
           }
       }
    });
}

function highlightGirth(){
    var low = 6;
    var high = 13;
    var arr = new Array('alex_evans-in-progress', 'daniel_shaver-in-progress', 'tatsuro_alpert-in-progress', 'josh_leckbee-in-progress', 'matt_jarvie-in-progress', 'taylor_thornton-in-progress');
  
    $.each(arr, function() {
       var count = $('#' + this).text();
       if (count != '*'){
       	   var num = parseInt(count);
           if(num < low){
               $('#' + this).css({'font-weight':'bolder', 'color':'green'});
           } else if (num >= low && num < high){
	       $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
           } else {
               $('#' + this).css({'font-weight':'bolder', 'color':'red'});
           }
       }
    });
}

function highlightSevOnes(){
  var arr = new Array('sev1-queue');
	
  $.each(arr, function() {
       var count = $('#' + this).text();
       if (count != '*'){
       	   var num = parseInt(count);
           if(num < 1){
               $('#sev1').css({'display':'none'});
           } else {
               $('#sev1').css({'display':'inline'});
           }
       }
    });
}

function highlightFrontlineQueue(){
    var arr = new Array('support-queue');

    $.each(arr, function() {
        var count = $('#' + this).text();
		if (count != '*'){
           var num = parseInt(count);
           var qCount = parseInt(localStorage.getItem('qAlertCount'));
           
           if(isNaN(qCount))
            var alertCounts = parseInt(alertCount);
		   else
            var alertCounts = parseInt(localStorage.getItem('qAlertCount'));
           
           // Stop Annoying PopUp if queue is above 40
           if(num >= 40 && (alertCounts == 1 || alertCounts%10 == 0)){
            supportQAlert(num);
           }
		   
           if(num < 35){
            alertCounts = 0;
		   
           localStorage.setItem('qAlertCount', alertCounts);
		   
           if(num == 0){
            $('#' + this).css({'font-weight':'bolder', 'color':'green'});}
           }
		   
		   else if (num >= 30 && num < 40){
            alertCounts = 0;
            localStorage.setItem('qAlertCount', alertCounts);
            $('#' + this).css({'font-weight':'bolder', 'color':'orange'});
		   }
		   
		   else {
            alertCounts++;
            localStorage.setItem('qAlertCount', alertCounts);
            $('#' + this).css({'font-weight':'bolder', 'color':'red'});
           }
        }
    });
}

function highlightBacklineQueue(){
    var arr = new Array('backline-in-progress');

    $.each(arr, function() {
	var count = $('#' + this).text();
	if (count != '*'){
		var num = parseInt(count);
		if(num < 10){
               		$('#' + this).css({'font-weight':'bolder', 'color':'green'});
           	} else if (num >= 10 && num < 25){
	       		$('#' + this).css({'font-weight':'bolder', 'color':'orange'});
   		} else {
              		$('#' + this).css({'font-weight':'bolder', 'color':'red'});
           	}
	}
    });
}

function highlightEscalatedQueue(){
    var arr = new Array('backline-escalated');

    $.each(arr, function() {
	var count = $('#' + this).text();
	if (count != '*'){
		var num = parseInt(count);
		if(num < 25){
               		$('#' + this).css({'font-weight':'bolder', 'color':'green'});
           	} else if (num >= 25 && num < 35){
	       		$('#' + this).css({'font-weight':'bolder', 'color':'orange'});
   		} else {
              		$('#' + this).css({'font-weight':'bolder', 'color':'red'});
           	}
	}
    });
}

function highlightTaken(){
    var arr = new Array('cases-taken');

    $.each(arr, function() {
	var count = $('#' + this).text();
	if (count != '*'){
		var num = parseInt(count);
		if(num > 6){
               		$('#' + this).css({'font-weight':'bolder', 'color':'green'});
           	} else if (num <= 6 && num > 2){
	       		$('#' + this).css({'font-weight':'bolder', 'color':'orange'});
   		} else {
              		$('#' + this).css({'font-weight':'bolder', 'color':'red'});
           	}
	}
    });
}

function initRows() {
		if( getClass('x-grid3-td-CASES_SUBJECT').length ) {
      inProgressCount = 0;
      
      var case_rows = getCaseRows();
      //Highlight the row after the row is clicked 
      for( var i in case_rows ) {
        var cols = case_rows[i].childNodes;
        var sfurl = recursiveChild( cols[subjCol], 'a' ).href;
        if( sfurl ) {          
          //If this was refreshed, see if this case was selected
          if( selectedCase==sfurl ) {
            case_rows[i].style.backgroundColor = '#fdffe3';
            selectedRow = case_rows[i];
          }
          
          if( statusCol && cols[statusCol].textContent!='In Progress' )
            case_rows[i].parentNode.style.backgroundColor = '#EEE';
          else
            inProgressCount += 1;
          
          if( pCol && cols[pCol].textContent=='Level 1' ) {
            for( var j in case_rows[i].childNodes )
                if(case_rows[i].childNodes[j].style)            
                    case_rows[i].childNodes[j].style.fontWeight = 'bold';
          }
        }
      }

      document.title = '(' + inProgressCount + ') ' + queueTitle;

      addLinksToRows( case_rows );
		}
}

function addLinksToRows( case_rows ) {
  for( var i in case_rows ) {
    addLinksToRow( case_rows[i].childNodes[subjCol].childNodes[0] );
  }
}

function createCaseLinks( sf_id , jive_case_url ) {
    return '<a href="'+jive_case_url+'"><img src="' + chrome.extension.getURL("images/favicon.png") + '" /></a> &nbsp; ' +          
           '<a href="' + '/' + sf_id + '/a?retURL=' + location.href.replace('https://na3.salesforce.com', '') + '"><em>[C]</em></a> &nbsp;';
}

function createCaseLinksFrontline( sf_id , jive_case_url ) {
    return '<a href="'+jive_case_url+'" title="'+ JIVECOMMUNITY_DESC +'"><img src="' + chrome.extension.getURL("images/favicon.png") + '" /></a> &nbsp; ' +
    '<a href="javascript:;" id="' + sf_id + '_LEVEL_UP" title="'+ T2_DESC +'"><img src="' + chrome.extension.getURL("images/tier2-icon.png") + '" /></a> &nbsp; ' +
    '<a href="javascript:;" id="' + sf_id + '_ACCOUNT_SUPPORT" title="'+ ACCOUNT_DESC +'"><img src="' + chrome.extension.getURL("images/account_support.png") + '" /></a> &nbsp; ' +
    '<a href="javascript:;" id="' + sf_id + '_HOSTING" title="'+ HOSTING_DESC +'"><img src="' + chrome.extension.getURL("images/hosting.png") + '" /></a> &nbsp; ' +
    '<a href="' + '/' + sf_id + '/a?retURL=' + location.href.replace('https://na3.salesforce.com', '') + '"><em>[C]</em></a> &nbsp;';
}

function insertCaseLinks( dom , sf_id , links ) {
  if($(dom).find('a[href*=jivesoftware]"').length) 
      return; // Links already populated
  $(dom).prepend(links);
    if(localStorage.mode == 'Frontline'){
    $(dom).find('a[id$="_LEVEL_UP"]').click(function() {
        assignToQueue(sf_id, BACKLINE_QUEUE);
    });
    $(dom).find('a[id$="_ACCOUNT_SUPPORT"]').click(function() {
        assignToQueue(sf_id, ACCOUNT_SUPPORT_QUEUE);
    });
    
    $(dom).find('a[id$="_HOSTING"]').click(function() {
        assignToQueue(sf_id, HOSTING_QUEUE);
    });
    }
}

function addLinksToRow(linkTag) {
  var sfurl = $(linkTag).find('a:last').attr('href');
  var sf_id = sfurl.substring(1);
  if( caseLinks[sf_id] ) {
    insertCaseLinks(linkTag, sf_id, caseLinks[sf_id]);
  } else {
    var added = false;
    for( var i=0; i<6 && !added; ++i )
      setTimeout( function() {
        if(added) return;
        //Set up ajax request
        $.get(sfurl).success(function(data) {
              added = true;
              var href = $(data).find('a[href^="https://community.jivesoftware.com"]').attr('href');
              if( !href ) $(data).find('a[href^="http://www.jivesoftware.com/jivespace"]').attr('href');
              if( href ) {
                if(localStorage.mode == 'Frontline')
                    caseLinks[sf_id] = createCaseLinksFrontline(sf_id, href);
                else
                    caseLinks[sf_id] = createCaseLinks(sf_id, href);
                insertCaseLinks(linkTag, sf_id, caseLinks[sf_id]);
              }
          }); 
      }, i*650 );

  } 
}

function getCaseRows() {
  var tables = getClass('x-grid3-row-table');
  var rows = [];
  for( var i in tables ) 
    if( tables[i].childNodes && tables[i].childNodes.length &&
        tables[i].childNodes[0].childNodes )
        rows.push( tables[i].childNodes[0].childNodes[0] );
  return rows;
}

//Returns the first result of the child object of obj that matches selector
function recursiveChild(obj,selector) {
  var res, children, i;
  selector = selector.toUpperCase();
  
  for( i=0; i<obj.childNodes.length; ++i )
    if( obj.childNodes[i].tagName==selector )
      return obj.childNodes[i];
  
  for( i=0; i<obj.childNodes.length; ++i ) {
    res = recursiveChild(obj.childNodes[i], selector);
    if( res ) return res;
  }
  return null;
}

function accountLink(i) {
  return case_rows[i].childNodes[accountCol].childNodes[0].childNodes[0];
}


function inArray(arr,obj) {
  for( var i=0; i<arr.length; ++i )
    if( arr[i]==obj ) return true;
  return false;
}

function destroy(el) {
  if( el && el.parentNode ) el.parentNode.removeChild(el);
}

// Support Queue Alert!
function supportQAlert(number){
	var num = parseInt(number);
	alert('The Support Queue is above 40 !!!!' + '\n' +
		  'The Queue is currenty at '+ num + '!!!!');
}