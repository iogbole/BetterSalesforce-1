function checkFor() {
    if ($('.supportal-casethread-latest-comment').length) {
        $('span.j-thread-info-block.font-color-meta a').clone().appendTo($('div.j-byline.font-color-meta').append(' - '));
        clearInterval(myTime);
    }
}

var myTime = setInterval(function() {checkFor();}, 500);