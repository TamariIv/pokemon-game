const canvas = document.querySelector('canvas') 
const c = canvas.getContext('2d')


canvas.width = 1024
canvas.height = 576

// change collisions array to a matrix
const collisionMap = []
for (let i=0; i<collisions.length; i+=70) {
	collisionMap.push(collisions.slice(i, i+70))
}

const battleZonesMap = []
for (let i=0; i<battleZonesData.length; i+=70) {
	battleZonesMap.push(battleZonesData.slice(i, i+70))
}

 
const boundaries = []
const offset = {
	x: -1650,
	y: -800
}

// drawing the boundaries
collisionMap.forEach((row, i) => {
	row.forEach((symbol, j) => {
		if (symbol === 1)
		boundaries.push(
			new Boundary({
				position: {
					x: j*Boundary.width + offset.x,
					y: i*Boundary.height + offset.y
		}}))  
	})
})


const battleZones = []
battleZonesMap.forEach((row, i) => {
	row.forEach((symbol, j) => {
		if (symbol === 1)
		battleZones.push(
			new Boundary({
				position: {
					x: j * Boundary.width + offset.x,
					y: i * Boundary.height + offset.y
		}}))  
	})
})

// LOAD IMAGES

const image = new Image()
image.src = './img/map.png'
// zoom in: 400%

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

const foregroundImage = new Image()
foregroundImage.src = './img/foregroundObjects.png'


const player = new Sprite({
	position: {
		x: canvas.width/2 - 192/4/2,
		y: canvas.height/2 - 68/2
	},
	image: playerDownImage,
	frames: {
		max: 4,
		hold: 10
	},
	sprites: {
		up: playerUpImage,
		left: playerLeftImage,
		right: playerRightImage,
		down: playerDownImage
	}
})
 
const background = new Sprite({
	position:{
		x: offset.x,
		y: offset.y
	},
	image: image
})

const foreground = new Sprite({
	position:{
		x: offset.x,
		y: offset.y
	},
	image: foregroundImage
})


// keys object determines whether a key was pressed  
const keys = {
	w: {
		pressed: false
	},
	a: {
		pressed: false
	},
	s: {
		pressed: false
	},
	d: {
		pressed: false
	}
}



const movables = [background, ...boundaries, foreground, ...battleZones]

// check if rect1 and rect2 colliding
function rectCollision({rect1, rect2}) {
	return  (
		rect1.position.x + rect1.width >= rect2.position.x &&
	 	rect1.position.x <= rect2.position.x + rect2.width &&
	 	rect1.position.y <= rect2.position.y + rect2.height &&
	 	rect1.position.y + rect1.height >= rect2.position.y
	 	)
}

const battle = {
	initiated: false
}

function animate() {
	const animationId = window.requestAnimationFrame(animate)
	background.draw()
	boundaries.forEach(boundary => {
		boundary.draw()
	})
	battleZones.forEach(battleZone => {
		battleZone.draw()
	})
	player.draw()
	foreground.draw()

	let moving = true // flag will determine if there was collision
	player.animate = false

	if (battle.initiated) return

	// activate battle 
	if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
		for (let i=0; i<battleZones.length; i++) {
			const battleZone = battleZones[i]

		const overlappingArea =
	        (Math.min(
	          player.position.x + player.width,
	          battleZone.position.x + battleZone.width
	        ) -
	          Math.max(player.position.x, battleZone.position.x)) *
	        (Math.min(
	          player.position.y + player.height,
	          battleZone.position.y + battleZone.height
	        ) -
	          Math.max(player.position.y, battleZone.position.y))

			if (
				rectCollision({
					rect1: player,
					rect2: battleZone
				})
				&& overlappingArea > (player.width * player.height) / 2
				&& Math.random() < 0.01
			) {
				window.cancelAnimationFrame(animationId)

				audio.map.stop()
				audio.initBattle.play()
				audio.battle.play()
				battle.initiated = true
				gsap.to('#overlappingDiv', {
					opacity: 1,
					repeat: 3,
					yoyo: true,
					duration: 0.4,
					onComplete() {
						gsap.to('#overlappingDiv', {
							opacity: 1,
							duration: 0.4,
							onComplete() {
								initBattle()
								animateBattle()
								gsap.to('#overlappingDiv', {
									opacity: 0,
									duration: 0.4
								})
							}
						})
					}
				})
				break
			}
		}
	}




	// detect keydowns and move player accordingly
	if (keys.w.pressed && lastKey === 'w') {
		player.animate = true
		player.image = player.sprites.up

		// detect collisions 
		for (let i=0; i<boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectCollision({
					rect1: player,
					rect2: {...boundary, position:{
						x: boundary.position.x,
						y: boundary.position.y + 3
					}}
				})
			) {
				moving = false
				break
			}
		}
		if (moving) 
			movables.forEach((movable) => {
				movable.position.y += 3
			})			
	}
	else if (keys.a.pressed && lastKey === 'a') {
		player.animate = true
		player.image = player.sprites.left

		for (let i=0; i<boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectCollision({
					rect1: player,
					rect2: {...boundary, position:{
						x: boundary.position.x + 3,
						y: boundary.position.y 
					}}
				})
			) {
				moving = false
				break
			}
		}
		if (moving)
			movables.forEach((movable) => {
				movable.position.x += 3
			})
	}
	else if (keys.s.pressed && lastKey === 's') {
		player.animate = true
		player.image = player.sprites.down

		for (let i=0; i<boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectCollision({
					rect1: player,
					rect2: {...boundary, position:{
						x: boundary.position.x,
						y: boundary.position.y - 3 
					}}
				})
			) {
				moving = false
				break
			}
		}
		if (moving)
			movables.forEach((movable) => {
			movable.position.y -= 3
			})
	}
	else if (keys.d.pressed && lastKey === 'd') {
		player.animate = true
		player.image = player.sprites.right
		
					for (let i=0; i<boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectCollision({
					rect1: player,
					rect2: {...boundary, position:{
						x: boundary.position.x - 3,
						y: boundary.position.y 
					}}
				})
			) {
				moving = false
				break
			}
		}
		if (moving)
		movables.forEach((movable) => {
			movable.position.x -= 3
		})
	}
}

// animate()




// PLAYER MOVEMENT

// listen to last keydown 
let lastKey = ''
window.addEventListener('keydown', (e ) => {
	switch (e.key){
		case 'w':
			keys.w.pressed = true
			lastKey = 'w'
			break
		case 'a':
			keys.a.pressed = true
			lastKey = 'a'
			break
		case 's':
			keys.s.pressed = true
			lastKey = 's'
			break
		case 'd':
			keys.d.pressed = true
			lastKey = 'd'
			break
	}
}
	)

// listen to keyup 
window.addEventListener('keyup', (e ) => {
	switch (e.key){
		case 'w':
			keys.w.pressed = false
			break
		case 'a':
			keys.a.pressed = false
			break
		case 's':
			keys.s.pressed = false
			break
		case 'd':
			keys.d.pressed = false
			break
	}
})


let clicked = false
addEventListener('click', () => {
	if (!clicked) {
		audio.map.play()
		clicked = true
	}
})

