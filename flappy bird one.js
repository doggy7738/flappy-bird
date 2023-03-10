// Select canvas
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// Game variables and consts
let frames = 0;
const DEGREE = Math.PI / 180;

// Load sprite image
const sprite = new Image();
sprite.src = 'https://i.postimg.cc/XJQVyb5Y/sprite.png';

/* Load sounds */
// Score
//const SCORE_S = new Audio();
//SCORE_S.src = "audio/sfx_point.wav";
// Flap
//const FLAP = new Audio();
//FLAP.src = "audio/sfx_flap.wav";
// Hit
//const HIT = new Audio();
//HIT.src = "audio/sfx_hit.wav";
// Swooshing
//const SWOOSHING = new Audio();
//SWOOSHING.src = "audio/sfx_swooshing.wav";

//const DIE = new Audio();
//DIE.src = "audio/sfx_die.wav";



// Game states
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}

// Start button to make sure user clicks inside of restart button to restart
const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

// Control game state
cvs.addEventListener("click", function(evt) {
    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            //SWOOSHING.play();
            break;
        case state.game:
            bird.flap();
            //FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            // Check if restart button was clicked
            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w &&
                clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }

            break;
    }
})

// Background
const bg = {
    sX: 0, // Source x position
    sY: 0, // Source y position
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h,
            this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h,
            this.x + this.w, this.y, this.w, this.h);
    }
}

// Foreground
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,

    dx: 2, // delta x to move ground to the left by

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h,
            this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h,
            this.x + this.w, this.y, this.w, this.h);
    },

    update: function() {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2); // reset ground position when edge of screen is reached
        }
    }
}

// Bird
const bird = {
    animation: [
        { sX: 276, sY: 112 },
        { sX: 276, sY: 139 },
        { sX: 276, sY: 164 },
        { sX: 276, sY: 139 }
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,

    radius: 12,
    frame: 0,

    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,

    draw: function() {
        let bird = this.animation[this.frame];

        // Rotate bird
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);

        ctx.restore();
    },

    flap: function() {
        this.speed = -this.jump;
    },

    update: function() {
        // Bird flaps slower if in getReady state
        this.period = state.current == state.getReady ? 10 : 5;
        // Increment the frame by 1 each period
        this.frame += frames % this.period == 0 ? 1 : 0;
        // Frame resets to 0 whenever it reaches 4
        this.frame = this.frame % this.animation.length;

        if (state.current == state.getReady) {
            this.y = 150; // Reset position after game over
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + this.h / 2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                    //DIE.play();
                }
            }

            // If speed > jump, bird is falling
            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE
                this.frame = 1; // stop flapping if falling
            } else {
                this.rotation = -25 * DEGREE
            }
        }

    },

    speedReset: function() {
        this.speed = 0;
    }
}

// Get ready message
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width / 2 - 173 / 2,
    y: 80,

    draw: function() {
        if (state.current == state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h,
                this.x, this.y, this.w, this.h);
        }
    }

}

// Game over message
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 225 / 2,
    y: 90,

    draw: function() {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h,
                this.x, this.y, this.w, this.h);
        }
    }

}

// Pipes
const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0
    },

    bottom: {
        sX: 502,
        sY: 0
    },

    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,

    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            // Top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h,
                p.x, topYPos, this.w, this.h);

            // Bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h,
                p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function() {
        if (state.current != state.game) return;

        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomPipeYPos = p.y + this.h + this.gap;

            /* Collision detection */
            // Top pipe
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
                bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                state.current = state.over;
                //HIT.play();
            }

            // Bottom pipe
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
                bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                state.current = state.over;
                //HIT.play();
            }

            // Move pipes to left
            p.x -= this.dx;

            // Remove pipes once off screen
            if (p.x + this.w <= 0) {
                this.position.shift();

                // Update score
                score.value += 1;
                //SCORE_S.play();
                score.best = Math.max(score.best, score.value);
                localStorage.setItem("best", score.best);
            }
        }
    },

    reset: function() {
        this.position = [];
    }

}

// Score
const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    draw: function() {
        ctx.fillStyle = "#FFF";

        if (state.current == state.game) {
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50);
        } else if (state.current == state.over) {
            // Score value
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // Best score
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },

    reset: function() {
        this.value = 0;
    }
}

// Draw
function draw() {
    ctx.fillStyle = "#70C5CE";
    ctx.fillRect(0, 0, cvs.width, cvs.height)

    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// Update
function update() {
    bird.update();
    fg.update();
    pipes.update();
}

// Loop
function loop() {
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}

loop();
console.log('made' + ' ' + 'by' + ' ' + 'Preston' + ' ' + 'R' + ' ' + 'for' + ' ' + 'steam')