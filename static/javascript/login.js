/*  點擊登入按鈕 */
const boxBG = document.querySelector('.boxBG')
const boxContainer = document.querySelector('.boxContainer')

document.querySelector('.navLoginBtn').addEventListener('click', () => {
	boxBG.style.display = 'block'
})

function closeBox() {
	boxBG.style.display = 'none'
}

boxBG.addEventListener('click', (e) => {
	boxBG.style.display = 'none'
	stopPropagation()

}, false)