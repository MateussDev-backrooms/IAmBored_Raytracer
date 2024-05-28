//vars

let canvas;
let ctx;
let t = 0;

//classes
class vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
let screen = []
let camera_origin = new vector3(0, 0, -128)


class hit {
    constructor(hit, distance, position, normal) {
        this.hit = hit;
        this.distance = distance;
        this.position = position;
        this.normal = normal;
    }
}

function init() {
    setInterval(update, 10);
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    
    camera_origin = new vector3(canvas.width/2, canvas.height/2, -128)
    prepareScreen();
    raytraceScene()
    render();
}
function update() {

}

function render() {
    

    //paint to screen
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            ctx.fillStyle = `rgb(${screen[x][y]}, 0, 0)`
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

//operations with vectors
function vec_add(v1, v2) {
    return new vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
}

function vec_sub(v1, v2) {
    return new vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
}

function vec_neg(v1) {
    return new vector3(-v1.x, -v1.y, -v1.z)
}

function vec_scl(v1, k) {
    return new vector3(v1.x * k, v1.y * k, v1.z * k)
}


function vec_len(v1) {
    return Math.sqrt(v1.x*v1.x + v1.y*v1.y + v1.z*v1.z)
}

function vec_dot(v1, v2) {
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z
}

function vec_norm(v1) {
    return vec_scl(v1, 1/vec_len(v1))
}

//raytracing functions
function prepareScreen() {
    for(let x=0; x<canvas.width; x++) {
        screen[x] = [];
        for(let y=0; y<canvas.height; y++) {
            screen[x][y] = 0
        }

    }
}

function raytraceScene() {
    for(let x=0; x<canvas.width; x++) {
        for(let y=0; y<canvas.height; y++) {
            let _pixel_pos = new vector3(x, y, 0)
            let _ray_dir = vec_norm(vec_add(vec_neg(camera_origin), _pixel_pos));
            // console.log(_pixel_pos, _ray_dir, )
            let hitTest = intersectSphere(camera_origin, _ray_dir, new vector3(0, 0, 0), 32)
            if(hitTest.hit) {
                screen[x][y] = 256
            }
        }

    }
}

function intersectSphere(ray_origin, ray_dir, sphere_pos, sphere_r) {
    let _hit = new hit(false, 0, new vector3(0, 0, 0), new vector3(0, 0, 0));

    let offsetRay = vec_sub(ray_origin, sphere_pos)

    let a = vec_dot(ray_dir, ray_dir);
    let b = 2 * vec_dot(offsetRay, ray_dir);
    let c = vec_dot(offsetRay, offsetRay) - sphere_r*sphere_r;

    let D = b*b - 4*a*c;

    if(D >= 0) {
        let dst = (-b - Math.sqrt(D)) / (2*a) //x2

        if(dst >= 0) {
            _hit.hit = true;
            _hit.distance = dst;
            _hit.position = vec_add(ray_origin, vec_scl(ray_dir, dst));
            _hit.normal = vec_norm(vec_sub(_hit.position, sphere_pos))
        }
    }
    return _hit
} 