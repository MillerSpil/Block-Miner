//Setting the canvas to the size of the window.
const width = window.innerWidth;
const height = window.innerHeight * 0.9;

//Setting to check if you would like to keep playing after winning.
let continuePlaying = false;

//Getting the inventory containers at top of screen.
let grassContainer = document.getElementById("grass");
let dirtContainer = document.getElementById("dirt");
let stoneContainer = document.getElementById("stone");
let ironContainer = document.getElementById("iron");
let diamondContainer = document.getElementById("diamond");
let restartButton = document.getElementById("restart");

//Setting the starting active container.
let activeContainer = grassContainer;

//This is the map storage. (An array of all map nodes)
let grid = [];

//This is all of the player data.
let player = {
    x: 0,
    y: 0,
    isFalling: false,
    inventory: {
        grass: 0,
        dirt: 0,
        stone: 0,
        diamond: 0,
        iron: 0
    },
    selectedBlockType: blocks.grass.name,
}

//This is game setup.
function setup() {
    frameRate(15);
    setSeed();
    createCanvas(width, height);
    generateTerrain();
    doEventListeners();
    setActiveContainer(grassContainer);
}

//This is a draw function that is called every frame.
function draw() {
    doPlayerMovement();
    updatePlayerInventory();
    checkIfPlayerWon();
}

//This is checking if the player has won the game.
function checkIfPlayerWon() {
    if (continuePlaying) {
        return;
    }
    if (
        player.inventory.diamond >= blocks.diamond.toCollect ||
        player.inventory.iron >= blocks.iron.toCollect ||
        player.inventory.stone >= blocks.stone.toCollect ||
        player.inventory.dirt >= blocks.dirt.toCollect ||
        player.inventory.grass >= blocks.grass.toCollect
    ) {
        continuePlaying = true;
        if (window.confirm("You Won! Play Again?")) {
            restart();
        }
    }
}

//This is updating the current selected block type.
function doEventListeners() {
    restartButton.addEventListener('click', () => {
        restart();
    })
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    grassContainer.addEventListener("click", () => {
        player.selectedBlockType = blocks.grass.name;
        setActiveContainer(grassContainer);
    });
    dirtContainer.addEventListener("click", () => {
      player.selectedBlockType = blocks.dirt.name;
      setActiveContainer(dirtContainer);
    });
    stoneContainer.addEventListener("click", () => {
      player.selectedBlockType = blocks.stone.name;
      setActiveContainer(stoneContainer);
    });
    ironContainer.addEventListener("click", () => {
      player.selectedBlockType = blocks.iron.name;
      setActiveContainer(ironContainer);
    });
    diamondContainer.addEventListener("click", () => {
        player.selectedBlockType = blocks.diamond.name;
        setActiveContainer(diamondContainer);
    });

}

//This is the function that is called when the player selects a block type.
function setActiveContainer(container) {
    activeContainer.classList.remove('active');
    container.classList.add('active');
    activeContainer = container;
}

//This restarts the game on win.
function restart() {
    let url = window.location.href;
    window.location.href = url.substring(0, url.lastIndexOf('/')) + '/index.html';
    console.log(url);
    console.log(url.substring(0, url.lastIndexOf('/')) + '/index.html');
}

//This is updating the seed off of the current url parameters.
function setSeed() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('seed')) {
        seed = urlParams.get('seed');
        noiseSeed(seed);
        randomSeed(seed);
    }
}

//This is the main function that generates the terrain.
function generateTerrain() {
    for (let x = 0; x < width; x += blockSize) {
        for (let y = 0; y < height; y += blockSize) {
            let noiseValue = noise(x * frequency, y * frequency) * amplitude;
            let node = {
                x: x,
                y: y,
                density: noiseValue,
                blockType: blocks.sky.name
            }
            grid.push(node);
            let index = grid.indexOf(node);
            paintTerrainTiles(node, index);
            paintOreTiles(node, index);
        }
    }
}

//This is the function that will paint all of the terrain tiles that you see on screen.
function paintTerrainTiles(node, index) {
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

//This will handle the paint functions for all ore tiles.
function paintOreTiles(node, index) {
    paintDiamonds(node, index);
    paintIron(node, index);
}

//This will generate and paint all diamond ore tiles.
function paintDiamonds(node, index) {
    let {x, y, density} = node;
    let noiseAmo = density * y;
    let yLevel = height - y;
    if (noiseAmo > yLevel * 2 && blocks.diamond.chance > random(100)) {
        grid[index].blockType = blocks.diamond.name;
        fill(blocks.diamond.color);
        rect(x, y, blockSize, blockSize)
    }
}

//This will generate and paint all iron ore tiles.
function paintIron(node, index) {
    let {x, y, density} = node;
    let noiseAmo = density * y;
    let yLevel = height - y;
    if (noiseAmo > yLevel * 2 && blocks.iron.chance > random(100)) {
        grid[index].blockType = blocks.iron.name;
        fill(blocks.iron.color);
        rect(x, y, blockSize, blockSize)
    }
}

//This is the function that handles the player movement. (We break it up into smaller functions for readability.)
function doPlayerMovement() {
    drawPlayer();
    doPlayerMoveLeft();
    doPlayerMoveRight();
    doPlayerFall();
    if (!player.isFalling) {
        doPlayerJump();
    }
}

//Handleing jumping.
function doPlayerJump() {
    for (let i = 0; i < jumpHeight; i++) {
        if (
            keyIsDown(32) &&
            findNode(player.x, player.y - blockSize).blockType === blocks.sky.name
        ) {
            updatePlayerPosition(player.x, player.y - blockSize)
        }
    }
}

//Drawing the player to canvas.
function drawPlayer() {
    fill(playerColor);
    rect(player.x, player.y, blockSize, blockSize);
}

//Handling gravity for the player.
function doPlayerFall() {
    if (player.y + blockSize > height) {
        player.isFalling = false;
        return;
    }
    let node = findNode(player.x, player.y + blockSize);
    if (node.blockType === blocks.sky.name) {
        player.isFalling = true;
        updatePlayerPosition(player.x, player.y + blockSize);
    } else {
        player.isFalling = false;
    }
}

//Handling left movement.
function doPlayerMoveLeft () {
    if (player.x - blockSize < 0) {
        return;
    }
    if (
        keyIsDown(65) &&
        findNode(player.x - blockSize, player.y).blockType === blocks.sky.name
    ) {
        updatePlayerPosition(player.x - blockSize, player.y);
    }
}

//Handling right movement.
function doPlayerMoveRight() {
    if (player.x + blockSize > width) {
        return;
    }
    if (
        keyIsDown(68) &&
        findNode(player.x + blockSize, player.y).blockType === blocks.sky.name
    ) {
        updatePlayerPosition(player.x + blockSize, player.y);
    }
}

//This is the function that finds the node at a given x and y position.
function findNode(x, y) {
    let nodeX = x - (x % blockSize);
    let nodeY = y - (y % blockSize);
    for (let i = 0; i < grid.length; i++) {
        if (grid[i].x === nodeX && grid[i].y === nodeY) {
            return grid[i];
        }
    }
}

//This is the direction function that will update the player's position. (Move right and left uses this.)
function updatePlayerPosition(newX, newY) {
    setPreviousPlayerPosition();
    player.x = newX;
    player.y = newY;
    setNewPlayerPosition();
}

//Theese are fixing a bug that was cloneing the player's position on movement.
////////////////////////////////////////////////////////////
function setPreviousPlayerPosition() {
    fill(blocks.sky.color);
    rect(player.x, player.y, blockSize, blockSize);
}
function setNewPlayerPosition() {
    fill(playerColor);
    rect(player.x, player.y, blockSize, blockSize);
}
////////////////////////////////////////////////////////////

//This is handling the players mouse input. (Checking the location of the mouse)
function mousePressed() {
    let node = findNode(mouseX, mouseY);
    if (node && playerCanInteractWithBlock(node)) {
        interactWithBlock(node)
    }
}

//Checing if the player can interact with said block.
function playerCanInteractWithBlock(node) {
    let distance = dist(node.x, node.y, player.x, player.y);
    return distance <= blockSize * blockInteractionDistance;
}

//This is checking for left, right and middle click. (This is for interacting with the block.)
function interactWithBlock(node) {
    if (mouseButton == LEFT && node.blockType !== blocks.sky.name) {
        mineBlock(node);
        return;
    }
    if (mouseButton == RIGHT && node.blockType === blocks.sky.name) {
        placeBlock(node);
        return;
    }
    if (mouseButton == CENTER && node.blockType !== blocks.sky.name) {
        let container = getContainerByBlockType(node.blockType);
        setActiveContainer(container);
        player.selectedBlockType = node.blockType;
    }
}

//Theese are the functions that handle the mining and placing of a block.
////////////////////////////////////////////////////////////
function mineBlock(node) {
    let blockType = node.blockType;
    addBlockTypeToInventory(blockType);
    setAndDrawBlockType(node, blocks.sky.name);
}
function placeBlock(node) {
    let blockType = player.selectedBlockType;
    if (playerHasEnoughtResources(blockType)) {
        player.inventory[blockType]--;
        setAndDrawBlockType(node, blockType);
    }
}
////////////////////////////////////////////////////////////

//This function is checking if the player has enough resources to place a block.
function playerHasEnoughtResources(blockType) {
    switch (blockType) {
        case blocks.grass.name:
            return player.inventory.grass > 0;
        case blocks.dirt.name:
            return player.inventory.dirt > 0;
        case blocks.stone.name:
            return player.inventory.stone > 0;
        case blocks.iron.name:
            return player.inventory.iron > 0;
        case blocks.diamond.name:
            return player.inventory.diamond > 0;
        default:
            return false;
    }
}

//This function helps with adding a block type to the player's inventory.
function addBlockTypeToInventory(blockType) {
    switch (blockType) {
        case blocks.grass.name:
            player.inventory.grass++;
            break;
        case blocks.dirt.name:
            player.inventory.dirt++;
            break;
        case blocks.stone.name:
            player.inventory.stone++;
            break;
        case blocks.iron.name:
            player.inventory.iron++;
            break;
        case blocks.diamond.name:
            player.inventory.diamond++;
            break;
        default:
            break;
    }

}

//This function will draw all blocks to the canvas. (This is for drawing the grid.)
function setAndDrawBlockType(node, blockType) {
    node.blockType = blockType;
    fill(getBlockTypeColor(blockType));
    rect(node.x, node.y, blockSize, blockSize);
}

//This is a helper function that will return the color of a block type.
function getBlockTypeColor(blockType) {
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

//This is the function that will set the container values to the player's inventory.
function updatePlayerInventory() {
    grassContainer.innerHTML = player.inventory.grass;
    dirtContainer.innerHTML = player.inventory.dirt;
    stoneContainer.innerHTML = player.inventory.stone;
    ironContainer.innerHTML = player.inventory.iron;
    diamondContainer.innerHTML = player.inventory.diamond;
}

//This is a helper function that will return the container of a block type.
function getContainerByBlockType(blockType) {
    switch (blockType) {
        case blocks.grass.name:
            return grassContainer;
        case blocks.dirt.name:
            return dirtContainer;
        case blocks.stone.name:
            return stoneContainer;
        case blocks.iron.name:
            return ironContainer;
        case blocks.diamond.name:
            return diamondContainer;
        default:
            return grassContainer;
    }
}