/* 登入時驗證使用者身份 */
function onLoadPage() {
	let token = document.cookie.split('=')[1];
	if (token === undefined || token === "") {
		showLoginBox()
		return
	}
	fetch(`/api/user/auth`, {
		method: 'GET',
		headers: { 'authorization': `Bearer ${token}` }
	})
		.then(res => res.json())
		.then(data => {
			if (data.data !== null) {
				const navLoginBtn = document.querySelector('.navLoginBtn')
				navLoginBtn.classList.add('navLogoutBtn');
				const navLogoutBtn = document.querySelector('.navLogoutBtn')
				navLogoutBtn.textContent = '登出系統'
				navLogoutBtn.classList.remove('navLoginBtn');
				logout(token)
				return
			}
			showLoginBox()
		})
}
onLoadPage()

/* 登出系統 */
function logout(token) {
	const navLogoutBtn = document.querySelector('.navLogoutBtn')
	navLogoutBtn.addEventListener('click', () => {
		fetch(`/api/user/auth`, {
			method: 'Delete',
			headers: { 'authorization': `Bearer ${token}` }
		})
			.then(res => res.json())
			.then(data => {
				const navLogoutBtn = document.querySelector('.navLogoutBtn')
				navLogoutBtn.classList.add('navLoginBtn');
				const navLoginBtn = document.querySelector('.navLoginBtn')
				navLoginBtn.textContent = '登入/註冊'
				navLoginBtn.classList.remove('navLogoutBtn');
				window.location.reload()
				showLoginBox()
				return
			})
	})
}

/*  點擊右上登入/註冊按鈕 */
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
	getUserSignInInfo()
	getUserSignUpInfo()
}


/*  點擊關閉按鈕或背景來關閉登入/註冊區塊 */
function closeBox() {
	const boxBG = document.querySelector('.boxBG')
	const closeSignIn = document.querySelector('.closeSignIn')
	const closeSignUp = document.querySelector('.closeSignUp')
	const boxForSignIn = document.querySelector('.boxForSignIn')
	const boxForSignUp = document.querySelector('.boxForSignUp')
	const boxForm = document.querySelector('.boxForSignUp')

	close(boxBG)
	close(closeSignIn)
	close(closeSignUp)

	function close(clickArea) {
		clickArea.addEventListener('click', () => {
			removeMessage()
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
	const signInForm = document.querySelector('.signInForm')
	const signUpForm = document.querySelector('.signUpForm')

	goToSignUp.addEventListener('click', (e) => {
		removeMessage()
		boxForSignIn.style.display = 'none'
		boxForSignUp.style.display = 'block'
	})

	goToSignIn.addEventListener('click', (e) => {
		removeMessage()
		boxForSignUp.style.display = 'none'
		boxForSignIn.style.display = 'block'
	})
}

/* 提交用戶註冊資訊*/
function getUserSignUpInfo() {
	const signUpForm = document.querySelector('.signUpForm')
	let signUpName = document.querySelector('.signUpName')
	let signUpEmail = document.querySelector('.signUpEmail')
	let signUpPassword = document.querySelector('.signUpPassword')

	signUpForm.addEventListener('submit', (e) => {
		removeMessage()
		e.preventDefault()
		name = signUpName.value
		email = signUpEmail.value
		password = signUpPassword.value
		data = { name, email, password }
		//todo: regex
		fetch('/api/user', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(data),
		})
			.then(res => res.json())
			.then(res => {
				if (res.ok === true) {
					const signUpPassword = document.querySelector('.signUpPassword')
					str = `<div class="message success">註冊成功，請點擊下方進行登入！</div>`
					signUpPassword.insertAdjacentHTML('afterend', str)
				}
				if (res.error === true) {
					showMessage(res.message, 'signUp')
				}
			})
	})
}

/* 提交用戶登入資訊 */
function getUserSignInInfo() {
	const signInForm = document.querySelector('.signInForm')
	let signInEmail = document.querySelector('.signInEmail')
	let signInPassword = document.querySelector('.signInPassword')

	signInForm.addEventListener('submit', (e) => {
		removeMessage()
		e.preventDefault()
		email = signInEmail.value
		password = signInPassword.value
		data = { email, password }
		//todo: regex

		fetch('/api/user/auth', {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(data),
		})
			.then(res => res.json())
			.then(res => {
				if (res.ok === true) {
					window.location.reload()
					onLoadPage()
				}
				if (res.error === true) {
					showMessage(res.message, 'signIn')
				}
			})
	})
}

/*顯示錯誤訊息*/
function showMessage(Message, from) {
	const message = document.querySelector('.message')
	if (from === 'signUp') {
		const signUpPassword = document.querySelector('.signUpPassword')
		str = `<div class="message error">${Message}</div>`
		signUpPassword.insertAdjacentHTML('afterend', str)
	}

	if (from === 'signIn') {
		const signInPassword = document.querySelector('.signInPassword')
		str = `<div class="message error">${Message}</div>`
		signInPassword.insertAdjacentHTML('afterend', str)
	}
	removeSignUpMessage()
	removeSignInMessage()
	return
}

/*註冊區：點擊 input 時移除錯誤訊息*/
function removeSignUpMessage() {
	const signUpForm = document.querySelector('.signUpForm')
	const signUpName = document.querySelector('.signUpName')
	const signUpEmail = document.querySelector('.signUpEmail')
	const signUpPassword = document.querySelector('.signUpPassword')

	focusOn(signUpName, signUpForm)
	focusOn(signUpEmail, signUpForm)
	focusOn(signUpPassword, signUpForm)
}

/*登入區：點擊 input 時移除錯誤訊息*/
function removeSignInMessage() {
	const signInForm = document.querySelector('.signInForm')
	const signInEmail = document.querySelector('.signInEmail')
	const signInPassword = document.querySelector('.signInPassword')

	focusOn(signInEmail, signInForm)
	focusOn(signInPassword, signInForm)
}

/* 監聽 focus 事件 */
function focusOn(inputArea) {
	inputArea.addEventListener('focus', () => {
		removeMessage()
	})
}

/*移除錯誤訊息*/
function removeMessage() {
	let message = document.querySelector('.message')
	if (message === null) return
	if (message.parentNode) {
		message.parentNode.removeChild(message);
	}
}

// let message = document.querySelector('.message')
// if (message !== null) {
// 	form.removeChild(message)
// }
//removeMessage 待處理