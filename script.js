
window.addEventListener("load", function() {
    // Establish canvas
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 1063;
    canvas.height = 550;

    class Player{
        constructor() {
            this.gameWidth = canvas.width;
            this.gameHeight = canvas.height;
            this.width = 125;
            this.height = 125;
            this.x = 300;
            this.y = 200;
            this.image = document.getElementById("birdImage");
            this.frameX = 0;
            this.maxFrame = 4;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.frameY = 0;
        }
        draw(context){
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
            // vertical movement
            if (this.onGround()){
                this.y = 300;
            }
        }
        // detect if player is on starting platform
        onPlatform(){
            return this.y == 250 && this.x == 100;
        }
        // detect if player is on the ground
        onGround(){
            return this.y >= 500 - this.height;
        }
    }

    class Background {
        constructor() {
            this.image = document.getElementById("backgroundImage");
            this.x = 0;
            this.y = -1500;
            this.width = 4252;
            this.height = 2200;      
        }
        draw(context){
            context.drawImage(this.image, 0, 0, 1063, 550, this.x, this.y, this.width, this.height);
        }
    }

    class Buffs{

    }

    let airTime = 0;
    let playerAffectX = 3;
    let playerAffectY = 3;
    class InputHandler {
        constructor(){
            this.jump = false;
            this.click = false;
            this.clicks = [];
            this.temp = false;
            this.onlyOnce = false;
            window.addEventListener("mousedown", e => {
                this.click = true;
            });
            window.addEventListener("mouseup", e => {
                this.click = false;
                this.clicks.push(e);
            });
            window.addEventListener("keydown", e => {
                this.jump = true;
                
                console.log("hi")
            });
            window.addEventListener("keyup", e => {
                this.onlyOnce = true;
                this.jump = false;
            });
        }
        
        update(){

            if (this.clicks.length == 0 && this.click === true) {
                player.x--;
                player.y++;
                player.frameX = 2;
                if (player.y > 275) {
                    player.y = 275;
                    player.x = 225;
                }
            } else if (this.clicks.length >= 1 && !this.temp) {
                player.x += playerAffectX;
                player.y -= playerAffectY;
                airTime++;
                ctx.translate(-playerAffectX, playerAffectY);
                // console.log(player.onGround());
                if (player.onGround()){
                    this.temp = true;
                }
            }

            if (airTime > 500) {
                playerAffectY -= .05;
            }
            if (this.jump == true && this.onlyOnce == true) {
                playerAffectY += 10;
                this.onlyOnce = false;
                console.log(this.jump);
            }
            
        }
    }

    function handleBuffs(){

    }

    function displayStatusText(){

    }

    // declare classes
    const input = new InputHandler();
    const player = new Player();
    const background = new Background();

    let lastTime = 0;

    // set a function to animate in a loop while calculating delta time
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        // ctx.translate(10, 10);
        background.draw(ctx);
        player.draw(ctx);
        player.update(deltaTime);
        input.update();
        requestAnimationFrame(animate);
    } animate(0);
})
