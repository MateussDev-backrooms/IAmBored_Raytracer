//vars

let canvas
let ctx
let t = 0;

function init() {
    setInterval(update, 25);
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    render();
}

function update() {
    t++;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    requestAnimationFrame(render)
}