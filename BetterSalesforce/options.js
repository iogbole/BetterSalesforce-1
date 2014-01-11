$(document).ready(function() {
});

function save_options() {
    var myArray = new Array("Josh,US-Backline,1029sdfo2308", "Billy,EMEA-Backline,281fjh1of");
    localStorage["myArray"] = JSON.stringify(myArray);

    flashStatus();
}

function flashStatus(msg) {
    var status = document.getElementById("status");
    status.innerHTML = msg !== undefined ? msg : "Options Saved!";

    $(status).fadeOut(500, function() {});
}

function restore_options() {
    return;
}

function changeRefresh() {
    $("label#range_output").innerHTML = localStorage.refreshTime;
}

document.addEventListener('DOMContentLoaded', restore_options);
$("#range_input").on('change', function() {
    changeRefresh.call($(this));
});