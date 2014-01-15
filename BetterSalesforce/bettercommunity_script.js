function checkForComments() {

    // Comments have loaded
    if ($('ul.jive-comment').length) {
        // Last comment
        $('span.j-thread-info-block.font-color-meta a').clone().appendTo($('div.j-byline.font-color-meta').append(' - '));

        // Next comment
        $('p.jive-comment-meta.font-color-meta-light').append("<div class='comment-nav' style='float:right;'><a class='prev-comment' style='display:inline-box;cursor:pointer;'>Previous</a>&nbsp;&nbsp;<a class='next-comment' style='display:inline-box;cursor:pointer;'>Next</a></div>");
        $('a.next-comment').on('click', function() {
            //$('html, body').animate({scrollTop: $(this).offset().top}, 10);
            var pos = $(this).closest('li.reply').nextAll('li.reply').offset().top;
            $('html, body').scrollTop(pos);
        });
        $('a.prev-comment').on('click', function() {
            //$('html, body').animate({scrollTop: $(this).offset().top}, 10);
            var pos = $(this).closest('li.reply').prevAll('li.reply').offset().top;
            console.log(pos);
            $('html, body').scrollTop(pos);
        });

        /*
        $('span.j-pagination').children.forEach(function() {
            $(this).on('click', function() {
                console.log("WOO");
            });
        });*/

        clearInterval(waitForCommentsTimer);
    }
}

var waitForCommentsTimer = setInterval(function() {checkForComments();}, 250);