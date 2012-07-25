// Global Variables
var CONTENT_CLASS = 'content';
var alertOnP1 = false;
var MAX_MODES = 10;



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
      return 'Error';
  }
}


function setMainPage() {
  var mainHTML = '<div>Main Page!</div>';
  
  $('.content').empty();
  $('.content').append(mainHTML);
}

function setModesPage() {
  var modesHTML = '<div>Modes Page!</div>';

  $('.content').empty();
  $('.content').append(modesHTML);
}

function setAlertsPage() {
  var alertsHTML = '<div>Alerts Page!</div>';

  $('.content').empty();
  $('.content').append(alertsHTML);
}
