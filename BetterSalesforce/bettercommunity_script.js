function checkForComments() {

    // Comments have loaded
    if ($('ul.jive-comment').length) {
        // Last comment
        addLastCommentLink();

        // Next comment
        addCommentNavigation();
        addPaginationClickEvent();

        clearInterval(waitForCommentsTimer);
    }
}

function addLastCommentLink() {
    $('span.j-thread-info-block.font-color-meta a').clone().appendTo($('div.j-byline.font-color-meta').append(' - '));
    $('div.j-byline.font-color-meta a').on('click', function() {
        setTimeout(function(){
            addCommentNavigation();
            addPaginationClickEvent();
        },1500);
    });
}

function addCommentNavigation() {
    if ($('.comment-nav').length) { console.log("FOUND COM"); return; }
    $('p.jive-comment-meta.font-color-meta-light').append("<div class='comment-nav' style='float:right;display:none;'><a class='prev-comment' style='display:inline-box;cursor:pointer;margin-right:5px;'>Previous</a><a class='next-comment' style='display:inline-box;cursor:pointer;'>Next</a></div>");
    $('a.next-comment').on('click', function() {
        var pos = $(this).closest('li.reply').nextAll('li.reply').offset().top;
        $('html, body').scrollTop(pos);
    });
    $('a.prev-comment').on('click', function() {
        var pos = $(this).closest('li.reply').prevAll('li.reply').offset().top;
        $('html, body').scrollTop(pos);
    });
    $('.reply').on('mouseover', function() {
        $(this).find('.comment-nav').show();
    });

    $('.reply').on('mouseout', function() {
        $(this).find('.comment-nav').hide();
    });
}

function addPaginationClickEvent() {
    $('span.j-pagination').on('click', 'a', function() {
        setTimeout(function(){addCommentNavigation(); addPaginationClickEvent()}, 1500);
    });
}

var waitForCommentsTimer = setInterval(function(){checkForComments();}, 250);
