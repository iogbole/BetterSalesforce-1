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
    var mainHTML = '<div>Coming soon...</div>';
  
    $('.content').empty();
    $('.content').append(mainHTML);
}

function setModesPage() {
    var modesHTML = '<div>Coming soon...</div>';

    $('.content').empty();
    $('.content').append(modesHTML);
}

function setAlertsPage() {
    var alertsHTML = 'Coming soon...<p>Alert on P1:&nbsp;';
  
    if (alertOnP1) {
  	    alertsHTML += '<input type="radio" name="alertonp1" value="alert_true" onClick="javascript: setAlert(true)" checked>Yes</input>&nbsp;' + 
  	        '<input type="radio" name="alertonp1" value="alert_false" onClick="javascript: setAlert(false)">No</input>';
    } else {
  	    alertsHTML += '<input type="radio" name="alertonp1" value="alert_true" onClick="javascript: setAlert(true)">Yes</input>&nbsp;' + 
  	        '<input type="radio" name="alertonp1" value="alert_false" onClick="javascript: setAlert(false)" checked>No</input>';  
    }
  
    $('.content').empty();
    $('.content').append(alertsHTML);
}

function setAlert(val) {
    alertOnP1 = val;
    localStorage.setItem('alertonp1', alertOnP1);
}
