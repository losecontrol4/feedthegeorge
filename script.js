

// import Phaser from 'phaser'
let foodEaten = 0
let canvasWidth = 3000
let canvasHeight = 1875
let keys = ['bagel', 'pizza', 'banana', 'teq', 'uncrust']
let chompArray = []
let clicked = false

var config = {
    
  type: Phaser.CANVAS,
  width: canvasWidth,
  height: canvasHeight,
  scale: {
    parent: "body",
    autoCenter: Phaser.Scale.CENTER_VERTICALLY,
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    width: canvasWidth,
    height: canvasHeight,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200},
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);
let spatVel = 0

function preload() {
  try {
  game.canvas.getContext("2d").imageSmoothingQuality = "high"
  } catch {}
  this.load.spritesheet("george", "assets/spritesheet.png", {
    frameWidth: 412,
    frameHeight: 605,
  });
  this.load.image("bagel", "assets/bagel.png");
  this.load.image("banana", "assets/banana.png");
  this.load.image("pizza", "assets/pizza.png");
  this.load.image("teq", "assets/teq.png");
  this.load.image("uncrust", "assets/uncrust.png");
  this.load.image("background", "assets/background.png");
  this.load.image("spat", "assets/spat.png")
  this.load.audio("chomp", ["assets/audio/chomp.mp3"])
  this.load.audio("feedthebirds", ["assets/audio/feedthebirds1.mp3"])
}

function create() {

  this.input.setPollAlways();

  background = this.add.image(
    canvasWidth / 2,
    canvasHeight / 2,
    "background"
  );
  let georgeRatio = 412/605
  let georgeWidth = 109

  background.setDisplaySize(canvasWidth, canvasHeight);
  george = this.physics.add.sprite(
    800 / 10,
    500 / 2,
    "george"
  );
  george.setScale(1.2)
  george.setSize(george.displayWidth - 300, george.displayHeight - 400)
//  george.setSize(412/3, 605/3) 
  george.setFrame(1);
  george.setBounce(.75, 0.75);
  george.setCollideWorldBounds(true);


  georgeHead = this.physics.add.existing(this.add.zone(george.x, george.y, 100, 100))
  georgeHead.body.setAllowGravity(false)



  spat = this.physics.add.image(
    800 / 2,
    500 / 2,
    "spat"
  );
  spat.setScale(.5)
  spat.setBounce(0)
  spat.body.setAllowGravity(false)
  spatHead = this.physics.add.existing(this.add.zone(spat.x, spat.y, 140, 160))
  spatHead.body.setAllowGravity(false)

  this.physics.add.collider(george, spat);


  this.physics.add.overlap(spatHead, george, reflect, null, this);

  food = this.physics.add.group()

  deleteZone1 = this.physics.add.existing(this.add.zone(canvasWidth/2, canvasHeight + 1000, canvasWidth*2, 200))
  deleteZone2 = this.physics.add.existing(this.add.zone(-1000, canvasHeight/2, 200, canvasHeight*2))
  deleteZone3 = this.physics.add.existing(this.add.zone(canvasWidth + 1000, canvasHeight/2, 200, canvasHeight*2))
  deleteZone1.body.moves = false
  deleteZone2.body.moves = false
  deleteZone3.body.moves = false

  deleteZone = this.physics.add.group([deleteZone1, deleteZone2, deleteZone3])
  

  this.physics.add.overlap(deleteZone, food, deleteFood, null, this);
  this.physics.add.overlap(georgeHead, food, eatFood, null, this);
  this.physics.add.overlap(spatHead, food, reflect, null, this)
    //   food.createMultiple({key: ['bagel', 'pizza', 'banana', 'teq', 'uncrust'], quanity: 5 })
    //   food.children.iterate((child) => {
    //     child.setScale(.4);
    //     child.body.moves = false
    //   });
    //   Phaser.Actions.SetXY(food.getChildren(), 32, 100, 300)
    this.physics.add.collider(food, food);
    this.physics.add.collider(food, george);

    this.anims.create({
        key: 'eat',
        frames: this.anims.generateFrameNumbers('george', { start: 0, end: 1}),
        frameRate: 3,
        repeat: -1
    });

    george.anims.play("eat")

    for(let i = 0; i < 10; i++) {
        chompArray.push(this.sound.add("chomp", { loop: false, volume: 0.15 }));
    }


    let music = this.sound.add('feedthebirds', {
            loop: true
        })
    music.play()


    
}

function update() {
    if (Phaser.Math.Between(0, 30) == 1)
        createFood(this, food)
        
    if (!clicked && game.input.activePointer.isDown) {
        clicked = true
    }

    const p = this.input.activePointer;

    georgeHead.body.x = george.body.x + george.width/2 - 130;
    georgeHead.body.y = george.body.y - 100;

  if(this.input.activePointer.isDown){
    spat.body.x = p.x - spat.displayWidth + 15
    spat.body.y = p.y - spat.displayHeight + 17
}

    spatHead.body.x = spat.body.x + 1;
    spatHead.body.y = spat.body.y;

 

    // spat.rotation += 0.01;

}

function createFood(object, food) {
  if (clicked) {  
    index = Phaser.Math.Between(0, 4)
    newFood = object.physics.add.image(Phaser.Math.Between(0, canvasWidth), -500, keys[index]).setScale(.6)
    food.add(newFood)
}
}

function deleteFood(deleteZone, food) {
    food.destroy()
}

function eatFood(georgeHead, food) {
    food.destroy()
    foodEaten += 1
    for(let i = 0; i < chompArray.length; i++){
        if(!chompArray[i].isPlaying){
            chompArray[i].setDetune(Phaser.Math.Between(-300, 300))
            chompArray[i].play()
            break
        }
    }


}

function reflect(spatHead, object){
    factor = this.input.activePointer.isDown ? 2 : 1
    object.setVelocity(this.input.activePointer.velocity.x * factor + object.body.velocity.x, this.input.activePointer.velocity.y * factor + object.body.velocity.y)

}