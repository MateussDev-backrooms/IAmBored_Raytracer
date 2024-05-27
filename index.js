//vars

let canvas;
let ctx;
let t = 0;

let screen = [];
let scr_rays = [];
let cam_origin = { x: 0, y: 0, z: -128 };

let _sphere_origin = { x: 64, y: 0, z: 25};
let _sphere_radius = 50;

function init() {
    setInterval(update, 0);
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    cam_origin = { x: canvas.width / 2, y: canvas.height / 2, z: 0 };
    raytraceScene();

    render();
}
let c_x = 0, c_y = 0
function update() {
    if(c_y < canvas.width) {
        c_x += 1;
        if(c_x >= canvas.width) {
            c_x = 0;
            c_y += 1;
        }
        raytracePixel(c_x, c_y)
    }
}

function render() {
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            ctx.fillStyle = `rgb(${screen[x][y].r}, ${screen[x][y].g}, ${screen[x][y].b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    requestAnimationFrame(render);
}

function raytraceScene() {
    //create 2D array for pixels
    for (let x = 0; x < canvas.width; x++) {
        screen[x] = [];
        scr_rays[x] = [];
        for (let y = 0; y < canvas.height; y++) {
            scr_rays[x][y] = {x:0, y:0, z:0}
            screen[x][y] = { r: 0, g: 0, b: 0 }
            raytracePixel(x, y)
        }
    }
}

function raytracePixel(x, y) {
    scr_rays[x][y] = vec_add(vec_invert(cam_origin), { x: x, y: y, z: 0 }); //calculates the vector from the camera origin to the pixel

    let norm_dir = vec_normalize(scr_rays[x][y]);
    if(sphereIntersect(cam_origin, norm_dir, _sphere_origin, _sphere_radius)) {
        screen[x][y] = { r: 256, g: 256, b: 256 }
    } else {
        screen[x][y] = { r: 0, g: 0, b: 0}
    }


    // console.log('raytraced pixel', x, y)
}

function sphereIntersect(origin, dir, sphere_pos, sphere_r) {
    let rayOffset = vec_sub(origin, sphere_pos)
    let a = vec_dot(dir, dir);
    let b = 2 * vec_dot(rayOffset, dir);
    let c = vec_dot(rayOffset, rayOffset) - sphere_r * sphere_r;

    let D = b*b - 4*a*c;

    if(D >= 0) {
        let dst = (-b - Math.sqrt(D) / (2*a))

        if(dst >= 0) {
            return true
        }
    }
    return false
}

//util functions
function dist3D(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt(
        (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2)
    );
}

function vec_dist(vec1, vec2) {
    return Math.sqrt(
        Math.pow(vec1.x - vec2.x, 2) +
        Math.pow(vec1.y - vec2.y, 2) +
        Math.pow(vec1.z - vec2.z, 2)
    );
}

function vec_invert(vec) {
    return { x: -vec.x, y: -vec.y, z: -vec.z };
}

function vec_add(vec1, vec2) {
    return { x: vec1.x + vec2.x, y: vec1.y + vec2.y, z: vec1.z + vec2.z };
}

function vec_sub(vec1, vec2) {
    return vec_add(vec1, vec_invert(vec2))
}

function vec_length(vec) {
    return Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
}

function vec_scale(vec, k) {
    return { x: vec.x * k, y: vec.y * k, z: vec.z * k };
}

function vec_normalize(vec) {
    return vec_scale(vec, 1 / vec_length(vec));
}

function vec_dot(vec1, vec2) {
    return (vec1.x * vec2.x) + (vec1.y * vec2.y) + (vec1.z * vec2.z)
}

function redrawScene() {
    c_y = 0;
    c_x = 0
    for (let x = 0; x < canvas.width; x++) {
        screen[x] = [];
        scr_rays[x] = [];
        for (let y = 0; y < canvas.height; y++) {
            scr_rays[x][y] = {x:0, y:0, z:0}
            screen[x][y] = { r: 0, g: 0, b: 0 }
        }
    }
}