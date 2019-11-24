var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var scale = window.devicePixelRatio;
prepareCanvas()

function getPos( el ) {
    var rect = el.getBoundingClientRect();
    return {x: (rect.left + rect.right)/2 , y: (rect.top + rect.bottom)/2, w: (rect.right-rect.left)/2};
}

var particles = [];
var animating_logo, animating_button = 0;

function prepareCanvas() {
    canvas.style.width = window.innerWidth * 0.9 + "px";
    canvas.style.height = window.innerHeight + "px";
    canvas.width = window.innerWidth * 0.9 * scale;
    canvas.height = window.innerHeight * scale;
    ctx.scale(scale, scale);
    ctx.font = "25px Arial";
    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = "center"; 
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#00f4a4";
}

$(window).resize(prepareCanvas());

$("#logo-id").on('mouseenter', function() {
    if(animating_logo) return;
    spawnCharacters("logo-id");
    animating_logo = 1;
    if(!animating_button) requestAnimationFrame(draw);
});

$("#run").on('mouseenter', function() {
    if(animating_button) return;
    spawnCharacters("run");
    animating_button = 1;
    if(!animating_logo) requestAnimationFrame(draw);
});

function spawnCharacters(el) {
    var el_pos = getPos(document.getElementById(el));
    for(var i = 3; i <= 10; i++) {
        particles.push({
            origin: el_pos,
            targetDist: el_pos.w * 1.2,
            x: el_pos.x - el_pos.w * 0.9,
            y: el_pos.y,
            speed: -1 * i * i / 5,
            char: String.fromCharCode(0x2200 + Math.random() * (0x22FF - 0x2200 + 1))});
        particles.push({
            origin: el_pos,
            targetDist: el_pos.w * 1.2,
            x: el_pos.x + el_pos.w * 0.9,
            y: el_pos.y,
            speed: i * i / 5,
            char: String.fromCharCode(0x2200 + Math.random() * (0x22FF - 0x2200 + 1))});
        }
}

function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    var offscreen = 0;
    particles.forEach(function(particle, id) {
        if(particle.x < 0 || particle.x > ctx.canvas.width) offscreen++;
        else {
            particle.x += particle.speed;
            particle.speed *= 1.05;
            ctx.globalAlpha = Math.min(1, Math.abs(50 / particle.speed));
            if(Math.abs(particle.x - particle.origin.x) > particle.targetDist) ctx.fillText(particle.char, Math.round(particle.x), Math.round(particle.y)); 
            particles[id] = particle;
        }
    });
    
    if(offscreen < particles.length) requestAnimationFrame(draw);
    else particles = [], animating_logo = animating_button = 0;
}