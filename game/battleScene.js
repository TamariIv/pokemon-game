// BATTLE RELATED

const battleBackgroundImg = new Image()
battleBackgroundImg.src = './img/battleBackground.png'

const battleBackground = new Sprite({
	position: {
		x: 0,
		y: 0
	},
	image: battleBackgroundImg
})



let draggle
let emby
let renderedSprites
let battleAnimationId
let queue

function initBattle() {
	document.querySelector('#battleUi').style.display = 'block'
	document.querySelector('#dialogueBox').style.display = 'none'
	document.querySelector('#enemyHealth').style.width = '100%'
	document.querySelector('#playerHealth').style.width = '100%'
	document.querySelector('#attacksBox').replaceChildren()


	draggle = new Monster(monsters.Draggle)
	emby = new Monster(monsters.Emby)
	renderedSprites = [draggle, emby]

	queue = []

	emby.attacks.forEach((attack) => {
		const button = document.createElement('button')
		button.innerHTML = attack.name
		document.querySelector('#attacksBox').append(button)
	})

	// attack buttons event listeners
document.querySelectorAll('button').forEach((button) => {
	button.addEventListener('click', (e) => {
		const selectedAttack = attacks[e.currentTarget.innerHTML]
		emby.attack({ 
			attack: selectedAttack,
			recipient: draggle,
			renderedSprites
		})

		if (draggle.health <= 0) {
			queue.push(() => {
				draggle.faint()
			})
			queue.push(() => {
				// back to map
				gsap.to('#overlappingDiv', {
					opacity: 1,
					onComplete: () => {
						cancelAnimationFrame(battleAnimationId)
						animate()
						document.querySelector('#battleUi').style.display = 'none'
						gsap.to('#overlappingDiv', {
							opacity: 0
						})

						battle.initiated = false
						audio.map.play()
					}
				})
			})
		}
		const randAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]
		queue.push(() => {
			draggle.attack({ 
				attack: randAttack,
				recipient: emby,
				renderedSprites
			})
		})

		if (emby.health <= 0) {
			queue.push(() => {
				emby.faint()
			})
			queue.push(() => {
				// back to map
				gsap.to('#overlappingDiv', {
					opacity: 1,
					onComplete: () => {
						cancelAnimationFrame(battleAnimationId)
						animate()
						document.querySelector('#battleUi').style.display = 'none'
						gsap.to('#overlappingDiv', {
							opacity: 0
						})
						battle.initiated = false
						audio.map.play()
					}
				})
			})

		}
	})

	button.addEventListener('mouseenter', (e) => {
		const selectedAttack = attacks[e.currentTarget.innerHTML]
		document.querySelector('#attackType').innerHTML = selectedAttack.type
		document.querySelector('#attackType').style.color = selectedAttack.color

	})
})
}

function animateBattle() {
	battleAnimationId = window.requestAnimationFrame(animateBattle)
	battleBackground.draw()

	renderedSprites.forEach((sprite) => {
		sprite.draw()
	})
}

animate()
// initBattle()
// animateBattle()




document.querySelector('#dialogueBox').addEventListener('click', (e) => {
	if (queue.length > 0) {
		queue[0]()
		queue.shift()
	}
	else e.currentTarget.style.display = ' none'
})
