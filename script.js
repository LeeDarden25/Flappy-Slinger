window.addEventListener("load", function() {
    // Establish canvas
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 1353;
    canvas.height = 575;
    let score = 0;
    let gameSpeed = 2;
    let buffs = [];
    let buffTimer = 0;
    let buffInterval = 15;
    let randomBuffInterval = Math.random() * 1000 + 500;

    class Player{
        constructor() {
            this.width = 125;
            this.height = 125;
            this.x = 300;
            this.y = 200;
            this.image = document.getElementById("birdImage");
            this.frameX = 0;
            this.maxFrame = 4;
            this.fps = 15;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.frameY = 0;
        }
        draw(context){
            // (img, sx, sy, swidth, sheight, x, y, width, height)
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height,
            this.x, this.y, this.width, this.height)
        }
        update(deltaTime, buffs){
            // sprite animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime
            }
            // Boundaries for ground and sky
            if (this.onGround()){
                this.y = 350;
                this.frameX = 2;
            }
            if (this.tooHigh()){
                this.y = -1350;
                hazard.draw();
                hazard.x -= 10;
            }
            // Draw boundary line for the sky
            if (player.y <= -900){
                ctx.beginPath();
                ctx.moveTo(0, -1345);
                ctx.lineTo(4252, -1345);
                ctx.strokeStyle = 'red';
                ctx.stroke();
            }
            // Collision detection for jump buffs
            buffs.forEach(buff => {
                const dx = (buff.x + buff.width/2) - (this.x + this.width/2);
                const dy =  (buff.y + buff.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy)
                if (distance < buff.width/2 + this.width/2){
                    buff.markedForDeletion = true;
                    input.jumpCount += 2;
                    score++;
                }
            })
        }
        // detect if player is on starting platform
        onPlatform(){
            return this.y == 250 && this.x == 100;
        }
        // detect if player is on the ground
        onGround(){
            return this.y >= 350;
        }
        // detect if player is too high in the sky
        tooHigh(){
            return this.y <= -1350;
        }
    }

    // Assign layered background images to variables
    const backgroundLayer1 = new Image();
    backgroundLayer1.src = 'layer1.png';
    const backgroundLayer2 = new Image();
    backgroundLayer2.src = 'layer2.png';
    const backgroundLayer3 = new Image();
    backgroundLayer3.src = 'layer3.png';
    const backgroundLayer4 = new Image();
    backgroundLayer4.src = 'layer4.png';
    const backgroundLayer5 = new Image();
    backgroundLayer5.src = 'layer5.png';
    const backgroundLayer6 = new Image();
    backgroundLayer6.src = 'layer6.png';
    const backgroundLayer7 = new Image();
    backgroundLayer7.src = 'layer7.png';

    // Functionality to images to move at different speeds for parallax effect
    class Layer {
        constructor(image, speedModifier){
            this.x = 0;
            this.y = -1500;
            this.width = 4252;
            this.height = 2200;
            this.image = image;
            this.speedModifier = speedModifier;
            this.speed = gameSpeed * this.speedModifier;
        }
        // Update function within class that will properly space the images from one another, avoiding gaps
        update(){
            this.speed = gameSpeed * this.speedModifier;
            if (this.x <= -this.width){
                this.x = 0;
            }
            this.x = Math.floor(this.x - this.speed);
        }
        // Make draw function that draws two of each image, also to avoid gaps
        draw(){
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        }
    }
    class Hazard{
        constructor(){
            this.image = document.getElementById("planeImage");
            this.width = 400;
            this.height = 188;
            this.x = 1700;
            this.y = -1360;
        }
        draw(){
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
    class Wind {
        constructor() {
            this.image = document.getElementById("windImage");
            this.width = 139;
            this.height = 125;
            this.x = 0;
            this.y = 0;
            this.frame = 0;
            this.timeSinceLastFrame = 0;
            this.frameInterval = 100;
            this.markedForDeletion = false;
        }
        update(deltaTime){
            this.timeSinceLastFrame += deltaTime;
            if (this.timeSinceLastFrame > this.frameInterval){
                this.frame++;
                this.timeSinceLastFrame = 0;
                if (this.frame > 5) this.markedForDeletion = true;
            }
        }
        draw(){
            ctx.drawImage(this.image, this.frame * this.width, 0, this.width, this.height,
            this.x, this.y - this.height/4, this.width, this.height)
        }
    }
    class Buff{
        constructor(){
            this.image = document.getElementById("buffImage");
            this.x = 2500;
            this.y = Math.floor(Math.random() * (-800)) + (-400);
            this.width = 75;
            this.height = 75;
            this.markedForDeletion = false;
        }
        draw(context){
            context.drawImage(this.image, 0, 0, 901, 878, this.x, this.y, this.width, this.height);
            this.x -= 0.5;
        }
        update(){
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
            }
        }
    }

    // Functionality to inputs
    let airTime = 0;
    let playerAffectX = 1;
    let playerAffectY = 3;
    class InputHandler {
        constructor(){
            this.jump = false;
            this.click = false;
            this.clicks = [];
            this.temp = false;
            this.onlyOnce = false;
            this.jumpCount = 20;
            window.addEventListener("mousedown", e => {
                this.click = true;
            });
            window.addEventListener("mouseup", e => {
                this.click = false;
                this.clicks.push(e);
            });
            window.addEventListener("keydown", e => {
                this.jump = true;
            });
            window.addEventListener("keyup", e => {
                this.onlyOnce = true;
                this.jump = false;
            });
        }
        update(){
            // Check clicks array to determine if mouseup has been pressed yet
            if (this.clicks.length == 1 && this.click === false) {
                // Drag bird down and to the left
                player.x--;
                player.y++;
                // Halt bird animation at frame 2
                player.frameX = 2;
                // Stop dragging action at (225,275)
                if (player.y > 220) {
                    player.y = 220;
                    player.x = 280;
                }
            } 
            // Check if mouseup has been triggered 2nd time yet and player is in boundaries
            else if (this.clicks.length > 1 && !this.temp) {
                // Increase airTime and add weight to the player
                player.x += playerAffectX;
                player.y -= playerAffectY;
                airTime++;
                // Make canvas follow the player
                ctx.translate(-playerAffectX, playerAffectY);
                // Boundary checkers
                if (player.onGround()){
                    this.temp = true;
                }
                if (player.tooHigh()){
                    this.temp = true;
                }
            }
            // Check if airTime is over 400 to add weight to the player
            if (airTime > 400) {
                playerAffectY -= .07;
                playerAffectX = 0;
            }
            // Jumping functionality
            if (this.jump == true && this.onlyOnce == true && this.jumpCount > 0 && airTime > 500) {
                playerAffectY += 9;
                this.onlyOnce = false;
                this.jumpCount--;
            }
        }
    }

    function handleBuffs(deltaTime){
        if (buffTimer > buffInterval * randomBuffInterval){
            buffs.push(new Buff());
            randomBuffInterval = Math.random() * 1000 + 500;
            buffTimer = 0;
        } else {
            buffTimer += deltaTime;
        }
        buffs.forEach(buff => {
            buff.draw(ctx);
            buff.update(deltaTime);
        })
        buffs = buffs.filter(buff => !buff.markedForDeletion);
    }

    function displayStatusText(){
        document.querySelector(".jump-count").innerHTML="JUMPS: " + input.jumpCount;
        document.querySelector(".score-count").innerHTML="SCORE: " + score;
    }

    // declare classes
    const input = new InputHandler();
    const player = new Player();
    const hazard = new Hazard();
    const wind = new Wind();
    const layer1 = new Layer(backgroundLayer1, 0.2);
    const layer2 = new Layer(backgroundLayer2, 0.4);
    const layer3 = new Layer(backgroundLayer3, 0.6);
    const layer4 = new Layer(backgroundLayer4, 0.8);
    const layer5 = new Layer(backgroundLayer5, 1);
    const layer6 = new Layer(backgroundLayer6, 1);
    const layer7 = new Layer(backgroundLayer7, 1.5);

    // Create an array of the layers to be iterated through
    const backgroundObjects = [layer1, layer2, layer3, layer4, layer5, layer6, layer7];

    // set a function to animate in a loop while calculating delta time
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if (input.clicks.length > 1 && !player.tooHigh() && !player.onGround()) {
            backgroundObjects.forEach(object => {
                object.update();
                object.draw();
                handleBuffs(deltaTime);
            }); 
        } else {
            layer1.draw();
            layer2.draw();
            layer3.draw();
            layer4.draw();
            layer5.draw();
            layer6.draw();
            layer7.draw();
        }
        if ((player.x + player.width) < hazard.x){
            player.draw(ctx);
        } else {
            wind.x = player.x;
            wind.y = player.y;
            wind.draw();
            wind.update(deltaTime);
        }
        player.update(deltaTime, buffs);
        input.update();
        displayStatusText(ctx);
        requestAnimationFrame(animate);
    } animate(0);
})