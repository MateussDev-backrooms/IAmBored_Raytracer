//vars

let canvas;
let ctx;
let t = 0;
let bounce_cnt = 3;
let rays_per_pixel = 16;

//classes
class vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Shape {
    constructor(position, material) {
        this.position = position;
        this.material = material;
    }
}

class Sphere extends Shape {
    constructor(position, material, radius) {
        super(position, material);
        this.r = radius;
    }
}

class Material {
    constructor(color, emissiveCol, strength) {
        this.color = color;
        this.emissiveCol = emissiveCol
        this.emissiveStrength = strength
    }
}
let screen = [];
let camera_origin = new vector3(0, 0, -128);
let objects = [
    new Sphere(new vector3(0, 0, 64), new Material({r:1,g:1,b:1}, {r:1,g:1,b:1}, 10), 50)
];

class hit {
    constructor(hit, distance, position, normal) {
        this.hit = hit;
        this.distance = distance;
        this.position = position;
        this.normal = normal;
    }
}

function init() {
    setInterval(update, 0.1

    );
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    // camera_origin = new vector3(canvas.width/2, canvas.height/2, -128)
    prepareScreen();
    populateScene(64);
    // raytraceScene();
    render();
}

let c_x = 0;
let c_y = 0;
function update() {
    let _pixel_pos = vec_add(
        new vector3(c_x, c_y, 0),
        new vector3(-canvas.width / 2, -canvas.height / 2, 0)
    );
    let _ray_dir = vec_norm(vec_add(vec_neg(camera_origin), _pixel_pos));
    // console.log(_pixel_pos, _ray_dir, )
    let totalCol = {r:0,g:0,b:0}
    for(let it=0; it<rays_per_pixel; it++) {
        totalCol = col_add(totalCol, traceRay(camera_origin, _ray_dir))
    }
    screen[c_x][c_y] = col_div(totalCol, rays_per_pixel)
    
    c_x++;
    if(c_x >= canvas.width) {
        c_x = 0;
        c_y++;
        if(c_y >= canvas.height) {
            c_y = 0;
        }
    }
}

function render() {
    //paint to screen
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            let _drawCol = rel_col_to_col(screen[x][y])
            ctx.fillStyle = `rgb(${_drawCol.r}, ${_drawCol.g}, ${_drawCol.b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    requestAnimationFrame(render)
}

//operations with vectors
function vec_add(v1, v2) {
    return new vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}

function vec_sub(v1, v2) {
    return new vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}

function vec_neg(v1) {
    return new vector3(-v1.x, -v1.y, -v1.z);
}

function vec_scl(v1, k) {
    return new vector3(v1.x * k, v1.y * k, v1.z * k);
}

function vec_len(v1) {
    return Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
}

function vec_dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function vec_norm(v1) {
    return vec_scl(v1, 1 / vec_len(v1));
}

function random_range(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function randomNormalDistribution() {
    let rng = Math.random();
    let theta = 2 * Math.PI * rng;
    let rho = Math.sqrt(-2 * Math.log(rng));
    return rho * Math.cos(theta);
}

function dist3D(v1, v2) {
    return Math.sqrt(
        Math.pow(v1.x - v2.x, 2) +
        Math.pow(v1.y - v2.y, 2) +
        Math.pow(v1.z - v2.z, 2)
    );
}
function clamp(x, min, max) {
    if(x>max) {
        return max
    } else if(x<min){
        return min
    }
    return x
}

function col_mul(col1, col2) {
    return {
        r:clamp(col1.r*col2.r, 0, 256),
        g:clamp(col1.g*col2.g, 0, 256),
        b:clamp(col1.b*col2.b, 0, 256)
    }
}

function col_add(col1, col2) {
    return {
        r:clamp(col1.r+col2.r, 0, 256),
        g:clamp(col1.g+col2.g, 0, 256),
        b:clamp(col1.b+col2.b, 0, 256)
    }
}

function col_scl(col1, k) {
    return {
        r:clamp(col1.r*k, 0, 256),
        g:clamp(col1.g*k, 0, 256),
        b:clamp(col1.b*k, 0, 256)
    }
}
function col_div(col1, k) {
    return {
        r:clamp(col1.r/k, 0, 256),
        g:clamp(col1.g/k, 0, 256),
        b:clamp(col1.b/k, 0, 256)
    }
}

function col_to_rel_col(col) {
    return {
        r:col.r/256,
        g:col.g/256,
        b:col.b/256
    }
}

function rel_col_to_col(col) {
    return {
        r:col.r*256,
        g:col.g*256,
        b:col.b*256
    }
}

//raytracing functions
function prepareScreen() {
    for (let x = 0; x < canvas.width; x++) {
        screen[x] = [];
        for (let y = 0; y < canvas.height; y++) {
            screen[x][y] = { r: 256, g: 0, b: 256 };
        }
    }
}

function randomDir() {
    let _x = randomNormalDistribution();
    let _y = randomNormalDistribution();
    let _z = randomNormalDistribution();
    return vec_norm(new vector3(_x, _y, _z));
}

function randomDirHemisphere(normal) {
    let _randomDir = randomDir();
    if (vec_dot(_randomDir, normal) < 0) {
        return vec_neg(_randomDir);
    }
    return _randomDir;
}

function traceRay(ray_origin, ray_dir) {
    let _traced_ray_origin = ray_origin
    let _traced_ray_dir = ray_dir
    let _traced_hit = new hit(false, 0, new vector3(0, 0, 0), new vector3(0, 0, 0));
    let _traced_object = {};

    let _traced_ray_carryCol = {r:1.0,g:1.0,b:1.0}
    let _incoming_light = {r:0,g:0,b:0}

    //copy objects array
    let _renderobj = [...objects];

    //sort backwards by distance
    _renderobj.sort(
        (a, b) =>
            dist3D(b.position, camera_origin) - dist3D(a.position, camera_origin)
    );

    for (let i = 0; i < bounce_cnt; i++) {
        for (let object of _renderobj) {
            let hitTest = intersectSphere(
                _traced_ray_origin,
                _traced_ray_dir,
                object.position,
                object.r
            );
            if (hitTest.hit) {
                _traced_hit = {...hitTest}
                _traced_object = {...object}
            } else {
            }
        }
        if(_traced_hit.hit) {
            _traced_ray_origin = _traced_hit.position
            _traced_ray_dir = randomDirHemisphere(_traced_hit.normal)
            // console.log("bounce! bounced of", _traced_object.material.emissiveCol)
            //light color
            let _emittedLight = col_scl(_traced_object.material.emissiveCol, _traced_object.material.emissiveStrength)
            _incoming_light = col_mul(col_add(_incoming_light, _emittedLight), _traced_ray_carryCol)
            //ray color
            _traced_ray_carryCol = col_mul(_traced_ray_carryCol, _traced_object.material.color)
        } else {
            break;
        }
    }
    return _incoming_light
}

function raytraceScene() {
    

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            
        }
    }
}

function intersectSphere(ray_origin, ray_dir, sphere_pos, sphere_r) {
    let _hit = new hit(false, 0, new vector3(0, 0, 0), new vector3(0, 0, 0));

    let offsetRay = vec_sub(ray_origin, sphere_pos);

    let a = vec_dot(ray_dir, ray_dir);
    let b = 2 * vec_dot(offsetRay, ray_dir);
    let c = vec_dot(offsetRay, offsetRay) - sphere_r * sphere_r;

    let D = b * b - 4 * a * c;

    if (D >= 0) {
        let dst = (-b - Math.sqrt(D)) / (2 * a); //x2

        if (dst >= 0) {
            _hit.hit = true;
            _hit.distance = dst;
            _hit.position = vec_add(ray_origin, vec_scl(ray_dir, dst));
            _hit.normal = vec_norm(vec_sub(_hit.position, sphere_pos));
        }
    }
    return _hit;
}

function populateScene(amount) {
    for (let i = 0; i < amount; i++) {

        let material = new Material({
            r: Math.random(),
            g: Math.random(),
            b: Math.random(),
        }, {r:0,g:0,b:0}, 0)

        objects.push(
            new Sphere(
                new vector3(
                    random_range(-500, 500),
                    random_range(-500, 500),
                    random_range(0, 500)
                ),
                material,
                random_range(8, 64)
            )
        );
    }
}
