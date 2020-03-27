window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

!async function () {
  const avatar = document.getElementById('avatar');
  const context = new (window.AudioContext || window.webkitAudioContext)();

  const winWidth = window.innerWidth,
    winHeight = window.innerHeight,
    canvas = document.getElementById('egg');
  const cwidth = canvas.width,
    cheight = canvas.height - 2,
    meterWidth = 10, //width of the meters in the spectrum
    capHeight = 2,
    capStyle = '#fff',
    meterNum = 800 / (10 + 2), //count of the meters
    capYPositionArray = [], ////store the vertical position of hte caps for the preivous frame
    ctx = canvas.getContext('2d'),
    gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(1, '#0f0');
  gradient.addColorStop(0.5, '#ff0');
  gradient.addColorStop(0, '#f00');

  let analyser, array, step;

  avatar.addEventListener('click', playEgg);

  function playEgg() {
    playAudio();
    avatar.removeEventListener('click', playEgg)
  }

  async function playAudio() {
    let audioMedia = await request('../egg/The+Xx+-+Intro.mp3');
    context.decodeAudioData(audioMedia, decode => play(context, decode));
  }

  function play(context, decodeBuffer) {
    context.resume();
    let source = context.createBufferSource();
    analyser = context.createAnalyser();
    source.connect(analyser);
    analyser.connect(context.destination);
    source.buffer = decodeBuffer;
    source.start(0);

    canvas.style.display = 'block'
    renderFrame(analyser)
  }

  async function request(url) {
    return new Promise(resolve => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';
      xhr.onreadystatechange = function () {
        // 请求完成，并且成功
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(xhr.response);
        }
      };
      xhr.send();
    });
  }


  function renderFrame() {

    array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    step = Math.round(array.length / meterNum);
    ctx.clearRect(0, 0, cwidth, cheight);
    for (let i = 0; i < meterNum; i++) {
      let value = array[i * step];
      if (capYPositionArray.length < Math.round(meterNum)) {
        capYPositionArray.push(value);
      }

      ctx.fillStyle = capStyle;
      if (value < capYPositionArray[i]) {
        ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
      } else {
        ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
        capYPositionArray[i] = value;
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(i * 12, cheight - value + capHeight, meterWidth, cheight);
    }
    requestAnimationFrame(renderFrame);
  }


}();
