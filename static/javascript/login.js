/*  點擊登入按鈕 */
function showLoginBox() {
	const boxBG = document.querySelector('.boxBG')
	const boxForSignIn = document.querySelector('.boxForSignIn')
	const navLoginBtn = document.querySelector('.navLoginBtn')

	navLoginBtn.addEventListener('click', () => {
		boxBG.style.display = 'block'
		boxForSignIn.style.display = 'block'
	})
	closeBox()
	clickToSignUpOrIn()
}
showLoginBox()

/*  點擊按鈕或背景來關閉登入程式 */
function closeBox() {
	const boxBG = document.querySelector('.boxBG')
	const closeSignIn = document.querySelector('.closeSignIn')
	const closeSignUp = document.querySelector('.closeSignUp')
	const boxForSignIn = document.querySelector('.boxForSignIn')
	const boxForSignUp = document.querySelector('.boxForSignUp')

	close(boxBG)
	close(closeSignIn)
	close(closeSignUp)

	function close(clickArea) {
		clickArea.addEventListener('click', () => {
			boxBG.style.display = 'none'
			boxForSignIn.style.display = 'none'
			boxForSignUp.style.display = 'none'
		})
	}
}

/* 切換至註冊或登入 */
function clickToSignUpOrIn() {
	const goToSignUp = document.querySelector('.goToSignUp')
	const goToSignIn = document.querySelector('.goToSignIn')
	const boxForSignIn = document.querySelector('.boxForSignIn')
	const boxForSignUp = document.querySelector('.boxForSignUp')

	goToSignUp.addEventListener('click', (e) => {
		boxForSignIn.style.display = 'none'
		boxForSignUp.style.display = 'block'
	})

	goToSignIn.addEventListener('click', (e) => {
		boxForSignUp.style.display = 'none'
		boxForSignIn.style.display = 'block'
	})
}
