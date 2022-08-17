let blockSize = 25;

let blocks = {
    sky: {
        name: 'sky',
        color: [212, 241, 249],
        toCollect: null
    },
    grass: {
        name: 'grass',
        color: [0, 180, 0],
        toCollect: 3
    },
    dirt: {
        name: 'dirt',
        color: [115, 118, 83],
        toCollect: 64
    },
    stone: {
        name: 'stone',
        color: [58, 50, 50],
        toCollect: 32
    },
    iron: {
        name: 'iron',
        color: [161, 157, 148],
        toCollect: 16,
        chance: 8
    },
    diamond: {
        name: 'diamond',
        color: [69, 172, 165],
        toCollect: 8,
        chance: 5
    }
}