const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drops = [];
let ripples = [];
let coins = [];
let startTime = Date.now();

// baca saldo lama dari localStorage
let saved = localStorage.getItem("totalUSDT");
let totalUSDT = saved ? JSON.parse(saved) : 0;

function createDrop() {
    let x = Math.random() * canvas.width;
    let y = Math.random() * -100;
    let speed = Math.random() * 5 + 2;
    drops.push({ x, y, speed });
}

function lerpColor(t) {
    t = Math.max(0, Math.min(1, t));
    let val = 255 * (1 - t);
    return `rgb(${val},${val},${val})`;
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function draw() {
    let elapsed = (Date.now() - startTime) / 1000; 
    let cycle = 20; 
    let t = (elapsed % cycle) / 10; 
    let blend = (t <= 1) ? t : 2 - t;

    // background
    ctx.fillStyle = lerpColor(blend);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // drops
    for (let i = 0; i < drops.length; i++) {
        let drop = drops[i];
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 2, 0, Math.PI * 2);

        let brightness = (1 - blend) * 255; 
        ctx.fillStyle = (brightness > 128) ? '#0077be' : '#87CEFA';
        ctx.fill();

        drop.y += drop.speed;

        if (drop.y > canvas.height) {
            // ripple
            ripples.push({
                x: drop.x,
                y: canvas.height,
                radius: 2,
                alpha: 1
            });

            // reward
            let reward = randomRange(0.00000002, 0.00000001);
            totalUSDT += reward;

            // simpan ke localStorage
            localStorage.setItem("totalUSDT", JSON.stringify(totalUSDT));

            // koin visual
            coins.push({
                x: drop.x,
                y: canvas.height - 10,
                size: 12,
                alpha: 1,
                targetX: 120,
                targetY: 30
            });

            drops.splice(i, 1);
            i--;
        }
    }

    // ripples
    for (let i = 0; i < ripples.length; i++) {
        let r = ripples[i];
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,119,190,${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        r.radius += 0.8;   
        r.alpha -= 0.02;   

        if (r.alpha <= 0) {
            ripples.splice(i, 1);
            i--;
        }
    }

    // coins
    for (let i = 0; i < coins.length; i++) {
        let c = coins[i];

        // gambar lingkaran emas
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${c.alpha})`; 
        ctx.fill();
        ctx.strokeStyle = `rgba(218,165,32, ${c.alpha})`; 
        ctx.lineWidth = 2;
        ctx.stroke();

        // simbol $
        ctx.fillStyle = `rgba(0,0,0,${c.alpha})`;
        ctx.font = `${c.size / 2}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", c.x, c.y);

        // update posisi (bergerak ke saldo)
        c.x += (c.targetX - c.x) * 0.05;
        c.y += (c.targetY - c.y) * 0.05;
        c.size *= 0.98;
        c.alpha -= 0.01;

        if (c.alpha <= 0.05 || c.size < 2) {
            coins.splice(i, 1);
            i--;
        }
    }

    // total saldo
    ctx.fillStyle = (blend < 0.5) ? '#000' : '#fff'; 
    ctx.font = '20px Arial';
    ctx.textAlign = "left";
    ctx.fillText(`Total: ${totalUSDT.toFixed(8)} USDT`, 20, 40);

    requestAnimationFrame(draw);
}

setInterval(createDrop, 100);
draw();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
