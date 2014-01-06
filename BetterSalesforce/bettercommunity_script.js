function checkForComments() {
    if ($('.supportal-casethread-latest-comment').length) {
        $('span.j-thread-info-block.font-color-meta a').clone().appendTo($('div.j-byline.font-color-meta').append(' - '));
        clearInterval(waitForCommentsTimer);
    }
}

var waitForCommentsTimer = setInterval(function() {checkForComments();}, 500);