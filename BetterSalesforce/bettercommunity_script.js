var preferences = [];
var waitForCommentsTimer;


function checkForComments() {

    // Comments have loaded
    if ($('ul.jive-comment').length) {
        // Last comment
        addLastCommentLink();

        // Comment Navigation
        if (isModuleEnabled("commentnav", "true")) {
            $('div.j-byline.font-color-meta a').on('click', function () {
                checkForLoadingComments();
            });
            addCommentNavigation();
            addPaginationClickEvent();
        }

        clearInterval(waitForCommentsTimer);
    }
}

function addLastCommentLink() {
    $('span.j-thread-info-block.font-color-meta a').clone().appendTo($('div.j-byline.font-color-meta').append(' - '));
}

function addCommentNavigation() {
    $('.reply').on('mouseenter', function () {
        $(this).find('.jive-comment-content').prepend("<span class='comment-nav'><label class='prev-comment'>Previous</label><label class='next-comment'>Next</label></span>");
        $('.prev-comment').on('click', function () {
            var pos;
            try {
                pos = $(this).closest('li.reply').prevAll('li.reply').offset().top;
            } catch (err) {
                pos = $('.j-comment-action-bar').offset().top;
            }
            $('html, body').scrollTop(pos);
        });
        $('.next-comment').on('click', function () {
            var pos = $(this).closest('li.reply').nextAll('li.reply').offset().top;
            $('html, body').scrollTop(pos);
        });
    });

    $('.reply').on('mouseleave', function () {
        $(this).find('.comment-nav').remove();
    });
}

function addPaginationClickEvent() {
    $('span.j-pagination').on('click', 'a', function () {
        checkForLoadingComments();
    });
}

function checkForLoadingComments() {
    var myInt = setInterval(function () {
        if (!$('.j-running-loader').length) {
            addCommentNavigation();
            addPaginationClickEvent();
            clearInterval(myInt);
        }
    }, 750);
}

function isModuleEnabled(name, default_value) {
    return preferences[name] ? preferences[name] : default_value;
}

function run() {
    waitForCommentsTimer = setInterval(function () {
        checkForComments();
    }, 500);
}

chrome.storage.sync.get(null, function (items) {
    $.each(items, function (key, val) {
        preferences[key] = val;
    });
    run();
});