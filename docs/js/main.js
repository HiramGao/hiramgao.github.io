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

    const toggle = $('#sidebar-toggle')
    const sidebar = $('#sidebar')
    const context = $('#context')

    let sidebarHided = JSON.parse($.Cookies.get('sidebar') || 'false')
    let isAnimating = false
    if (sidebarHided) {
        $('.sidebar-main').css('display','none')
        $('.copyright').css('display','none')

        sidebar.css('width', '24px');
        context.css('width', `${$('.max-width-4').width() - 24}px`);
    }

    function closeAnimating() {
        isAnimating = false
    }

    function hideContext() {
        $('.sidebar-main').hide(500)
        $('.copyright').hide(500)
        sidebar.animate({
            width: "24px"
        }, 500);
        context.animate({
            width: `${$('.max-width-4').width() - 24}px`,
            paddingLeft: 0
        }, 1000, "linear", closeAnimating);
        $.Cookies.set('sidebar', true)
    }
    function showContext() {
        $('.sidebar-main').show(500)
        $('.copyright').show(500)
        sidebar.animate({
            width: "25%"
        }, 1000, 'linear', closeAnimating);
        context.animate({
            width: "75%",
            paddingLeft: '1rem'
        }, 500);
        $.Cookies.set('sidebar', false)
    }

    toggle.on('click', function () {
        if (!isAnimating) {
            isAnimating = true
            sidebarHided ? showContext() : hideContext()
            sidebarHided = !sidebarHided
        }
    })

})

