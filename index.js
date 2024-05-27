//vars

let canvas;
let ctx;
let t = 0;

let screen = [];
let scr_rays = [];
let cam_origin = { x: 0, y: 0, z: -128 };

let _sphere_origin = { x: 0, y: 0, z: 51};
let _sphere_radius = 50;

function init() {
    setInterval(update, 0);
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    cam_origin = { x: canvas.width / 2, y: canvas.height / 2, z: 0 };
    raytraceScene();

    render();
}
function update() {
    
}

let c_x = 0, c_y = 0
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
        screen[x][y] = { r: 0, g: 0, b: 256 }
    } else {
        screen[x][y] = { r: 0, g: 0, b: 0}
    }


    // console.log('raytraced pixel', x, y)
}

function sphereIntersect(origin, dir, sphere_pos, sphere_r) {
    let e = vec_sub(origin, sphere_pos)
    //t*t(dx*dx + dy*dy + dz*dz) + t*(2*ex*dx + 2*ey*dy + 2*ez*dz) + ex*ex + ey*ey + ez*ez - r*r = 0
    let a=1
    let b=2*e.x*dir.x + 2*e.y*dir.y + 2*e.z*dir.z
    let c = vec_length(e)*vec_length(e) - sphere_r*sphere_r

    let disc = b*b - 4*a*c
    if(disc < 0) {
        return false;
    }
    return true
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
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
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
