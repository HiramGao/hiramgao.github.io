$(function () {

    const progress = $('#progress-indicator');
    const back = $('.back-to-top-wrapper')
    function updateProgress() {
        var winHeight = $(document).height()
        var top = $(document).scrollTop()
        var pageHeight = $(window).height()
        progress.css('width', (top + pageHeight) / winHeight * 100 + '%')
    }
    updateProgress()

    function updateBack() {
        var top = $(document).scrollTop()
        var pageHeight = $(window).height()
        if (top > pageHeight) {
            back.slideDown(300)
        } else if (top < pageHeight) {
            back.slideUp(200);
        }
    }

    updateBack()

    back.click(function () {
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });

    function winScroll() {
        requestAnimationFrame(updateProgress);
        updateBack()
    }

    $(window).scroll(winScroll);

})

