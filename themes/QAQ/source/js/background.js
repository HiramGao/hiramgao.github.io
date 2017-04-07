! function() {
    var winWidth = window.innerWidth,
        winHeight = window.innerHeight,
        POINT = 35;

    var canvas = document.getElementById('background-canvas');
    var context = canvas.getContext('2d');
    canvas.width = winWidth;
    canvas.height = winHeight;
    context.strokeStyle = 'rgba(0,0,0,0.2)',
        context.strokeWidth = 1,
        context.fillStyle = 'rgba(0,0,0,0.1)';
    var circleArr = [];

    function Line(x, y, _x, _y, o) {
        this.beginX = x;
        this.beginY = y;
        this.closeX = _x;
        this.closeY = _y;
        this.o = o;
    }

    function Circle(x, y, r, moveX, moveY) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.moveX = moveX;
        this.moveY = moveY;
    }

    function num(max, _min) {
        var min = arguments[1] || 0;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function drawCricle(cxt, x, y, r, moveX, moveY) {
        var circle = new Circle(x, y, r, moveX, moveY)
        cxt.beginPath()
        cxt.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI)
        cxt.closePath()
        cxt.fill();
        return circle;
    }
    //绘制线条
    function drawLine(cxt, x, y, _x, _y, o) {
        var line = new Line(x, y, _x, _y, o)
        cxt.beginPath()
        cxt.strokeStyle = 'rgba(0,0,0,' + o + ')'
        cxt.moveTo(line.beginX, line.beginY)
        cxt.lineTo(line.closeX, line.closeY)
        cxt.closePath()
        cxt.stroke();

    }
    //初始化生成原点
    function init() {
        circleArr = [];
        for (var i = 0; i < POINT; i++) {
            circleArr.push(drawCricle(context, num(winWidth), num(winHeight), num(15, 2), num(10, -10) / 40, num(10, -10) / 40));
        }
        draw();
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < POINT; i++) {
            drawCricle(context, circleArr[i].x, circleArr[i].y, circleArr[i].r);
        }
        for (var i = 0; i < POINT; i++) {
            for (var j = 0; j < POINT; j++) {
                if (i + j < POINT) {
                    var A = Math.abs(circleArr[i + j].x - circleArr[i].x),
                        B = Math.abs(circleArr[i + j].y - circleArr[i].y);
                    var lineLength = Math.sqrt(A * A + B * B);
                    var C = 1 / lineLength * 7 - 0.009;
                    var lineOpacity = C > 0.03 ? 0.03 : C;
                    if (lineOpacity > 0) {
                        drawLine(context, circleArr[i].x, circleArr[i].y, circleArr[i + j].x, circleArr[i + j].y, lineOpacity);
                    }
                }
            }
        }
    }

    window.onload = function() {
        init();

        function run() {
            for (var i = 0; i < POINT; i++) {
                var cir = circleArr[i];
                cir.x += cir.moveX;
                cir.y += cir.moveY;
                if (cir.x > winWidth) cir.x = 0;
                else if (cir.x < 0) cir.x = winWidth;
                if (cir.y > winHeight) cir.y = 0;
                else if (cir.y < 0) cir.y = winHeight;

            }
            draw();
            requestAnimationFrame(run);
        }
        requestAnimationFrame(run);
        //closeBtn
        var closeSidebar = document.getElementById('close-sidebar');
        var sidebar = document.getElementById('sidebar');
        var context = document.getElementById('context');
        closeSidebar.addEventListener("click", function() {
                sidebar.style.width = '0';
                sidebar.style.height = '0';
                sidebar.style.opacity = '0';
                context.style.width = "100%";
                sidebar.style.margin = "0";
            }, false)
            //progress
        var totalH = document.body.clientHeight
        var h = (window.innerHeight || document.documentElement.clientHeight) + window.pageYOffset;
        var progress = document.getElementById('progress-indicator');

        function winScroll() {
            requestAnimationFrame(function() {
                updateProgress(((window.innerHeight || document.documentElement.clientHeight) + window.pageYOffset) / totalH);
            });
        }
        winScroll();
        document.addEventListener('scroll', winScroll, false);

        function updateProgress(perc) {
            progress.style.width = perc * 100 + '%';
        }
    }


}()
