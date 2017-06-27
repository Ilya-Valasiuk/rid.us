$(document).ready(function () {
    PhotoStory();
});

function PhotoStory() {

    var PHOTO_STORY_VISIBLE_CLASS = 'photo_story-view-visible';
    var PHOTO_STORY_CLASS = 'photo_story-view';
    var PHOTO_STORY_STARTER_ELEMENT = 'photo_story-clickable';

    var slider;
    var currentScrollPosition;

    init();

    function init() {
        var $element = $('.' + PHOTO_STORY_STARTER_ELEMENT);
        $element.click(openPhotoStory);

        checkUrlAndOpenIfNeed();
    }

    function openPhotoStory(e, position){
        var $element = $(this);
        var $photoStoryView = $('.' + PHOTO_STORY_CLASS);

        if ($photoStoryView) {
            currentScrollPosition = document.body.scrollTop;
            show($photoStoryView);
            slider = new Slider();
            slider.init($photoStoryView, position);
        }
    }

    function show(element) {
        togglePhotoStoryView(element);
        bindHandlers(element);
    }

    function togglePhotoStoryView(element) {
        $(document.body).toggleClass(PHOTO_STORY_VISIBLE_CLASS);
    }

    function bindHandlers(element) {
        var $closeBtn = element.find('.photo_story-close');
        // close button handler
        $closeBtn.click(closeAndCleanHandlers);
        // escape handler
        $(document).keyup(closeAndCleanHandlers);

        function closeAndCleanHandlers(event) {
            if (event.type === 'keyup' && !isEscape(event)) {
                return;
            }

            togglePhotoStoryView(element);
            removeHash();
            slider.remove();

            $closeBtn.off('click', closeAndCleanHandlers);
            $(document).off('keyup', closeAndCleanHandlers);
            document.body.scrollTop = currentScrollPosition;
        }
    }

    function checkUrlAndOpenIfNeed() {
        var hash = window.location.hash;
        var position = +hash.split('#')[1];

        if (hash && !isNaN(position)) {
            var $element = $('.' + PHOTO_STORY_STARTER_ELEMENT);
            if ($element) {
                openPhotoStory.call($element, undefined, position - 1);
            } else {
                removeHash();
            }
        }
    }

    function removeHash() {
        var scrollV, scrollH, loc = window.location;
        if ("pushState" in history)
            history.pushState("", document.title, loc.pathname + loc.search);
        else {
            // Prevent scrolling by storing the page's current scroll offset
            scrollV = document.body.scrollTop;
            scrollH = document.body.scrollLeft;

            loc.hash = "";

            // Restore the scroll offset, should be flicker free
            document.body.scrollTop = scrollV;
            document.body.scrollLeft = scrollH;
        }
    }

    function isEscape(event) {
        return event.keyCode === 27;
    }
}

function Slider() {

    var PHOTO_STORY_ITEM_CLASS = 'photo_story-item';
    var PHOTO_STORY_ITEM_ACTIVE_CLASS = 'photo_story-item-active';
    var PHOTO_STORY_TOTAL_ITEMS_CLASS = 'photo_story-total';
    var PHOTO_STORY_CURRENT_ITEM_CLASS = 'photo_story-current';
    var PHOTO_STORY_NEXT = 'photo_story-content-arrow-wrapper-right';
    var PHOTO_STORY_PREV = 'photo_story-content-arrow-wrapper-left';
    var PHOTO_STORY_IMAGE_CLASS = 'photo_story-images';
    var PHOTO_STORY_ANOTHER_LINKS = 'photo_story-another';
    var PHOTO_STORY_ANOTHER_OPEN = 'photo_story-another--open';

    var currentPosition;
    var totalSize;
    var parentElement;
    var $elements;
    var isAnotherShow = false;

    function initSlider(element, position) {
        parentElement = element;

        initHandlers();
        initItems(position || 0);
        goTo(position || 0);
    }

    function initItems(currentPosition) {
        $elements = parentElement.find('.' + PHOTO_STORY_ITEM_CLASS);
        totalSize = $elements.length;

        parentElement.find('.' + PHOTO_STORY_TOTAL_ITEMS_CLASS).html(totalSize);
        parentElement.find('.' + PHOTO_STORY_CURRENT_ITEM_CLASS).html(currentPosition + 1);
    }

    function removeSlider() {
        removeHandlers();
        removeActiveClass();
    }

    function initHandlers() {
        $("body").keydown(keyboardNavigation);

        parentElement.find('.' + PHOTO_STORY_NEXT).click(next);
        parentElement.find('.' + PHOTO_STORY_IMAGE_CLASS).click(next);
        parentElement.find('.' + PHOTO_STORY_PREV).click(prev);
    }

    function removeHandlers() {
        $('body').off('keydown', keyboardNavigation);

        parentElement.find('.' + PHOTO_STORY_IMAGE_CLASS).off('click', next);
        parentElement.find('.' + PHOTO_STORY_NEXT).off('click', next);
        parentElement.find('.' + PHOTO_STORY_PREV).off('click', prev);
    }

    function removeActiveClass() {
        // remove old active element
        parentElement.find('.' + PHOTO_STORY_ITEM_ACTIVE_CLASS).removeClass(PHOTO_STORY_ITEM_ACTIVE_CLASS);
    }

    function keyboardNavigation(e) {
        if(e.keyCode == 37) { // left
          prev();
        }
        else if(e.keyCode == 39) { // right
          next();
        }
    }

    function next() {
        var nextPosition = currentPosition + 1 < totalSize ? currentPosition + 1 : currentPosition;

        goTo(nextPosition);
    }

    function prev() {
        var prevPosition = currentPosition - 1 >= 0 && !isAnotherShow ? currentPosition - 1 : currentPosition;

        goTo(prevPosition, true);
    }

    function goTo(index, isPrev) {
       if (!currentPosition || currentPosition !== index || (isPrev && isAnotherShow)) {
           removeActiveClass();
            // set new active element
            $($elements[index]).addClass(PHOTO_STORY_ITEM_ACTIVE_CLASS);

            window.location.hash = index + 1;

            currentPosition = index;

            parentElement.find('.' + PHOTO_STORY_CURRENT_ITEM_CLASS).html(currentPosition + 1);
            parentElement.removeClass(PHOTO_STORY_ANOTHER_OPEN);

            isAnotherShow = false;
       } else if(currentPosition || !isAnotherShow) {
            removeActiveClass();
            parentElement.find('.' + PHOTO_STORY_ANOTHER_LINKS).addClass(PHOTO_STORY_ITEM_ACTIVE_CLASS);
            parentElement.addClass(PHOTO_STORY_ANOTHER_OPEN);
            isAnotherShow = true;
       }
    }

    return {
        init: initSlider,
        remove: removeSlider,
        next: next,
        prev: prev
    }
}
