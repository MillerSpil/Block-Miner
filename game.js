const width = window.innerWidth;
const height = window.innerHeight;

let continuePlaying = false;

let grid = [];

function setup() {
    frameRate(15);
    createCanvas(width, height);
    world.generateWorld();
    inventory.openClose();
    inventory.update();
}

function draw() {
    myPlayer.draw();
    myPlayer.gravity();
    myPlayer.jumpHandler();
    myPlayer.moveHandler();
    
}

class Player {
    constructor(x = 0, y = 0, isFalling = false, color = [255, 0, 0], blockInteractionDistance = 5, jumpHeight = 3) {
        this.x = x;
        this.y = y;
        this.isFalling = isFalling;
        this.playerColor = color;
        this.blockInteractionDistance = blockInteractionDistance;
        this.jumpHeight = jumpHeight;
    }

    draw() {
        fill(this.playerColor);
        rect(this.x, this.y, blockSize, blockSize);
    }

    gravity() {
        if (this.y + blockSize > height) {
            this.isFalling = false;
            return;
        }
        let node = findNode(this.x, this.y + blockSize);
        if (node.blockType === blocks.sky.name) {
            this.isFalling = true;
            this.updatePosition(this.x, this.y + blockSize);
        } else {
            this.isFalling = false;
        }
    }

    jumpHandler() {
        if (!this.isFalling) {
            for (let i = 0; i < this.jumpHeight; i++) {
                if (
                    keyIsDown(32) &&
                    findNode(this.x, this.y - blockSize).blockType === blocks.sky.name
                ) {
                    this.updatePosition(this.x, this.y - blockSize)
                }
            }
        }
    }

    moveHandler() {
        // Move left
        if (keyIsDown(65)) {
            if (!(this.x - blockSize < 0)) {
                if (findNode(this.x - blockSize, this.y).blockType === blocks.sky.name) {
                    this.updatePosition(this.x - blockSize, this.y);
                } else {
                    return;
                }
            } else {
                return;
            }
        }
        // Move right
        if (keyIsDown(68)) {
            if (!(this.x + blockSize > width)) {
                if (findNode(this.x + blockSize, this.y).blockType === blocks.sky.name) {
                    this.updatePosition(this.x + blockSize, this.y);
                } else {
                    return;
                }
            } else {
                return;
            }
        }
    }

    updatePosition(newX, newY) {
        fill(blocks.sky.color);
        rect(this.x, this.y, blockSize, blockSize);
        this.x = newX;
        this.y = newY;
        fill(this.playerColor);
        rect(this.x, this.y, blockSize, blockSize);
    }

    clickHandler(mouseX, mouseY) {
        let block = findNode(mouseX, mouseY);
        if (block && myPlayer.canInteractWithBlock(block)) {
            if (mouseButton == LEFT && block.blockType !== blocks.sky.name) {
                myPlayer.mineBlock(block);
                return;
            }
            if (mouseButton == RIGHT && block.blockType === blocks.sky.name) {
                myPlayer.placeBlock(block);
                return;
            }
            //if (mouseButton == CENTER && node.blockType !== blocks.sky.name) {
            //    let container = getContainerByBlockType(node.blockType);
            //    setActiveContainer(container);
            //    player.selectedBlockType = node.blockType;
            //}
        }
    }

    canInteractWithBlock(block) {
        let distance = dist(block.x, block.y, this.x, this.y);
        return distance <= blockSize * this.blockInteractionDistance;
    }

    placeBlock(block) {
        if (inventory.getItemCount(inventory.selectedItem) >= 1) {
            inventory.removeItem(inventory.selectedItem, 1);
            worldHandler.setAndDrawBlockType(block, inventory.selectedItem);
        }
    }

    mineBlock(block) {
        inventory.addItem(block.blockType, 1)
        worldHandler.setAndDrawBlockType(block, blocks.sky.name);
    }
}
let myPlayer = new Player();

class Inventory {
    constructor() {
        this.data = [
            {
                name: "grass",
                img: "./invyPics/grass.png",
                count: 0
            },
            {
                name: "dirt",
                img: "./invyPics/dirt.png",
                count: 0
            },
            {
                name: "stone",
                img: "./invyPics/stone.png",
                count: 0
            },
            {
                name: "iron",
                img: "./invyPics/iron.png",
                count: 0
            },
            {
                name: "diamond",
                img: "./invyPics/diamond.png",
                count: 0
            }
        ]
        this.selectedItem;
        this.selectedItemDiv;
    }

    openClose() {
        const inventory = document.querySelector('.inventory');
        const inventoryTitle = document.querySelector('.inventoryTitle');
        const inventoryHelper = document.querySelector('.inventoryHelper');
        document.addEventListener("keypress", function (e) {
            if (e.key == 'i') {
                if (inventory.style.visibility === "visible") {
                    inventory.style.visibility = "hidden";
                    inventoryTitle.style.visibility = "hidden";
                    inventoryHelper.style.visibility = "hidden";
                    
                } else {
                    inventory.style.visibility = "visible";
                    inventoryTitle.style.visibility = "visible";
                    inventoryHelper.style.visibility = "visible";
                }
            }
        });
    }

    clickHandler(e) {
        if (this.selectedItemDiv) {
            this.selectedItemDiv.classList.remove("selected");
            this.selectedItemDiv = e
            this.selectedItem = this.data[e.className.split('itemHolder item-')[1] - 1].name;
            e.classList.add("selected");
        } else {
            this.selectedItemDiv = e
            this.selectedItem = this.data[e.className.split('itemHolder item-')[1] - 1].name;
            e.classList.add("selected");
        }
        
    }

    update() {
        let holder = document.querySelector(".inventory");
        holder.innerHTML = "";
        for (let i = 0; i < this.data.length; i++) {
            let div = document.createElement('div');
            div.className = `itemHolder item-${i + 1}`;
            let img = document.createElement('img');
            img.className = "itemImg";
            img.src = this.data[i].img;
            img.draggable = false;
            let count = document.createElement('span');
            count.className = "itemCount";
            count.innerText = this.data[i].count;
            div.appendChild(img);
            div.appendChild(count);
            div.onclick = function(){
                inventory.clickHandler(this);
            }
            holder.appendChild(div);
        }
    }

    addItem(item, qty) {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].name === item) {
                this.data[i].count += qty;
            }
        }
        this.update();
    }

    removeItem(item, qty) {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].name === item) {
                this.data[i].count -= qty;
            }
        }
        this.update();
    }

    getItemCount(item) {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].name === item) {
                return this.data[i].count;
            }
        }
    }
}
let inventory = new Inventory();

class World {
    constructor(frequency = 0.002, amplitude = 0.8, seed = 0) {
        this.frequency = frequency
        this.amplitude = amplitude
        this.seed = seed
    }

    generateWorld() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if (urlParams.has('seed')) {
            this.seed = urlParams.get('seed');
            noiseSeed(this.seed);
            randomSeed(this.seed);
        }
        for (let x = 0; x < width; x += blockSize) {
            for (let y = 0; y < height; y += blockSize) {
                let noiseValue = noise(x * this.frequency, y * this.frequency) * this.amplitude;
                let node = {
                    x: x,
                    y: y,
                    density: noiseValue,
                    blockType: blocks.sky.name
                }
                grid.push(node);
                let index = grid.indexOf(node);
                this.paintTerrainTiles(node, index);
                this.paintOreTiles(node, index);
            }
        }
    }

    paintTerrainTiles(node, index) {
        let { x, y, density } = node;
        let noiseAmount = density * y;
        let yLevel = height - y;
        if (noiseAmount < yLevel) {
            grid[index].blockType = blocks.sky.name;
            fill(blocks.sky.color);
            rect(x, y, blockSize, blockSize);
        }
        if (noiseAmount > yLevel * 0.6) {
            grid[index].blockType = blocks.grass.name;
            fill(blocks.grass.color);
            rect(x, y, blockSize, blockSize);
        }
        if (noiseAmount > yLevel * 0.8) {
            grid[index].blockType = blocks.dirt.name;
            fill(blocks.dirt.color);
            rect(x, y, blockSize, blockSize);
        }
        if (noiseAmount > yLevel) {
            grid[index].blockType = blocks.stone.name;
            fill(blocks.stone.color);
            rect(x, y, blockSize, blockSize);
        }
    }

    paintOreTiles(node, index) {
        let {x, y, density} = node;
        let noiseAmo = density * y;
        let yLevel = height - y;
        //Diamonds
        if (noiseAmo > yLevel * 2 && blocks.diamond.chance > random(100)) {
            grid[index].blockType = blocks.diamond.name;
            fill(blocks.diamond.color);
            rect(x, y, blockSize, blockSize)
        }
        //Iron
        if (noiseAmo > yLevel * 2 && blocks.iron.chance > random(100)) {
            grid[index].blockType = blocks.iron.name;
            fill(blocks.iron.color);
            rect(x, y, blockSize, blockSize)
        }
    }
}
let world = new World();

class WorldHandlers {
    constructor() {
        
    }

    setAndDrawBlockType(block, blockType) {
        block.blockType = blockType;
        fill(this.getBlockTypeColor(blockType));
        rect(block.x, block.y, blockSize, blockSize);
    }

    getBlockTypeColor(blockType) {
        switch (blockType) {
            case blocks.grass.name:
                return blocks.grass.color;
            case blocks.dirt.name:
                return blocks.dirt.color;
            case blocks.stone.name:
                return blocks.stone.color;
            case blocks.iron.name:
                return blocks.iron.color;
            case blocks.diamond.name:
                return blocks.diamond.color;
            default:
                return blocks.sky.color;
        }
    }
}
let worldHandler = new WorldHandlers();

function findNode(x, y) {
    let nodeX = x - (x % blockSize);
    let nodeY = y - (y % blockSize);
    for (let i = 0; i < grid.length; i++) {
        if (grid[i].x === nodeX && grid[i].y === nodeY) {
            return grid[i];
        }
    }
}

function mousePressed() {
    myPlayer.clickHandler(mouseX, mouseY);
}