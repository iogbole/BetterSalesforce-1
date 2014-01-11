$(document).ready(function() {

    // Refresh rate
    $("#range_input").change(function() {
        var newval = $(this).val();
        localStorage.refreshTime = newval;
        $("#slidernumber").text(newval);
    });

    // Alert on P1 CB
    $("#check_alertp1").change(function() {
       localStorage.alertP1 = this.checked;
    })

    // Minimilist View CB
    $("#check_minimilist").change(function() {
        localStorage.minimilist = this.checked;
    })
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
    // Refresh rate
    var refreshTime = localStorage.refreshTime ? localStorage.refreshTime : 60;
    $("#slidernumber").text(refreshTime);
    $("#range_input").attr("value", refreshTime);

    // Show alert on P1
    $("#check_alertp1").prop('checked', localStorage.alertP1 == 'true');

    // Minimilst
    $("#check_minimilist").prop('checked', localStorage.minimilist == 'true');

}

document.addEventListener('DOMContentLoaded', restore_options);
