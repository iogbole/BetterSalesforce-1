// Global Variables
var CONTENT_CLASS = 'content';
var alertOnP1 = localStorage.getItem('alertonp1');
var MAX_MODES = 10;
var first_run = true;

$(document).ready(function() {
    if (first_run) {
	    menu(true);
	    first_run = false;
	    console.log('first_run complete');
    }
});

// Display options page based on menuItem parameter
function menu(menuItem) {
    switch (menuItem) {
      case 'main':
          setMainPage();
          break;
      case 'modes':
          setModesPage();
          break;
      case 'alerts':
          setAlertsPage();
          break;
      default:
          setMainPage();
          break;
    }
}


function setMainPage() {
    var mainHTML = '<div>Coming someday...</div>';
  
    $('.content').empty();
    $('.content').append(mainHTML);
}

function setModesPage() {
    var modesHTML = '<div>Coming later than someday...</div>';

    $('.content').empty();
    $('.content').append(modesHTML);
}

function setAlertsPage() {
    var alertsHTML = '<p>Alert on P1:&nbsp;';

    if (alertOnP1) {
  	    alertsHTML += '<button class="alertonp1">Disable</button>';
    } else {
  	    alertsHTML += '<button class="alertonp1">Enable</button>';
    }

    $('.content').empty();
    $('.content').append(alertsHTML);
}

function setAlert(val) {
    alertOnP1 = val;
    localStorage.setItem('alertonp1', alertOnP1);
}

function clickHandler(e) {
    $('.main').click(function() {
        menu('main');
    });

    $('.modes').click(function() {
        menu('modes');
    });

    $('.alerts').click(function() {
       menu('alerts');
    });

    $('button').click(function() {
        setAlert(!alertOnP1);
        console.log('here2');
    });
}

// Add Event Listeners for Options
document.addEventListener('DOMContentLoaded', function () {
   $('a').bind('click', clickHandler);
});

