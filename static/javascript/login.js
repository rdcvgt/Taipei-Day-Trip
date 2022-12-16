/* 網頁載入時驗證使用者身份是否爲登入狀態 */
function onLoadPage() {
	let token = document.cookie.split('=')[1];
	//如果 cookie 不存在 token 
	if (!token) {
		//無法進入 booking 頁面
		if (window.location.href.split('/')[3] === 'booking') {
			window.location.href = '/'
		}
		showLoginBox()
		return
	}
	fetch(`/api/user/auth`, {
		method: 'GET',
		headers: { 'authorization': `Bearer ${token}` }
	})
		.then(res => res.json())
		.then(data => {
			let userInfo = data.data
			sessionStorage.setItem('user', JSON.stringify(userInfo))
			if (userInfo !== null) {
				//修改登入按鈕爲登出
				const navLoginBtn = document.querySelector('.navLoginBtn')
				navLoginBtn.classList.add('navLogoutBtn');

				const navLogoutBtn = document.querySelector('.navLogoutBtn')
				navLogoutBtn.textContent = '登出系統'
				navLogoutBtn.classList.remove('navLoginBtn');
				clickToLogout(token)

				//可點擊預訂行程按鈕至頁面
				const navBookBtn = document.querySelector('.navBookBtn')
				navBookBtn.addEventListener('click', () => {
					window.location.href = "/booking"
				})
				return
			}
			//若使用者資料爲 null，無法進入 booking 頁面
			if (window.location.href.split('/')[3] === 'booking') {
				window.location.href = '/'
			}
			showLoginBox()
		})
}
onLoadPage()

/* 登出系統 */
function clickToLogout(token) {
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

				//如果在 booking 頁面登出，則導回首頁
				if (window.location.href.split('/')[3] === 'booking') {
					window.location.href = '/'
					return
				}
				window.location.reload()
				showLoginBox()
				return
			})
	})
}


/*  點擊「登入/註冊」按鈕 */
function showLoginBox() {
	const boxBG = document.querySelector('.boxBG')
	const boxForSignIn = document.querySelector('.boxForSignIn')
	const navLoginBtn = document.querySelector('.navLoginBtn')
	const navBookBtn = document.querySelector('.navBookBtn')

	navLoginBtn.addEventListener('click', () => {
		boxBG.style.display = 'block'
		boxForSignIn.style.display = 'block'
	})

	navBookBtn.addEventListener('click', () => {
		boxBG.style.display = 'block'
		boxForSignIn.style.display = 'block'
	})
	closeBox()
	clickToSignUpOrIn()
	getUserSignInInfo()
	getUserSignUpInfo()
	examineSignInInput()
	examineSignUpInput()
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
			disableAllSignInMessage()
			disableAllSignUpMessage()
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
	const signInEmail = document.querySelector('.signInEmail')
	const signInPassword = document.querySelector('.signInPassword')


	goToSignUp.addEventListener('click', (e) => {
		disableAllSignInMessage()
		boxForSignIn.style.display = 'none'
		boxForSignUp.style.display = 'block'
	})

	goToSignIn.addEventListener('click', (e) => {
		disableAllSignUpMessage()
		boxForSignUp.style.display = 'none'
		boxForSignIn.style.display = 'block'
	})
}


/* 提交用戶註冊資訊*/
function getUserSignUpInfo() {
	const signUpForm = document.querySelector('.signUpForm')
	const signUpName = document.querySelector('.signUpName')
	const signUpEmail = document.querySelector('.signUpEmail')
	const signUpPassword = document.querySelector('.signUpPassword')

	signUpForm.addEventListener('submit', (e) => {
		disableAllSignUpMessage()
		e.preventDefault()
		let name = signUpName.value
		let email = signUpEmail.value
		let password = signUpPassword.value
		let nameIsValid = examineName(signUpName)
		let emailIsValid = examineEmail(signUpEmail)
		let passwordIsValid = examinePassword(signUpPassword)
		if (!emailIsValid || !passwordIsValid || !nameIsValid) {
			return
		}

		data = { name, email, password }
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
					enableBackEndMessage(res.message, 'signUp')
				}
			})
	})
}


/* 提交用戶登入資訊 */
function getUserSignInInfo() {
	const signInForm = document.querySelector('.signInForm')
	const signInEmail = document.querySelector('.signInEmail')
	const signInPassword = document.querySelector('.signInPassword')

	signInForm.addEventListener('submit', (e) => {
		disableBackEndSignInMessage()
		e.preventDefault()
		let email = signInEmail.value
		let password = signInPassword.value
		let emailIsValid = examineEmail(signInEmail)
		let passwordIsValid = examinePassword(signInPassword)
		if (!emailIsValid || !passwordIsValid) {
			return
		}

		data = { email, password }
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
					enableBackEndMessage(res.message, 'signIn')
				}
			})
	})
}

/* 檢查登入區的所有 input 輸入內容是否正確*/
function examineSignInInput() {
	const signInEmail = document.querySelector('.signInEmail')
	signInEmail.addEventListener('blur', () => {
		examineEmail(signInEmail)
	})

	const signInPassword = document.querySelector('.signInPassword')
	signInPassword.addEventListener('blur', () => {
		examinePassword(signInPassword)
	})
}

/* 檢查註冊區的所有 input 輸入內容是否正確*/
function examineSignUpInput() {
	const signUpName = document.querySelector('.signUpName')
	signUpName.addEventListener('blur', () => {
		examineName(signUpName)
	})

	const signUpEmail = document.querySelector('.signUpEmail')
	signUpEmail.addEventListener('blur', () => {
		examineEmail(signUpEmail)
	})

	const signUpPassword = document.querySelector('.signUpPassword')
	signUpPassword.addEventListener('blur', () => {
		examinePassword(signUpPassword)
	})
}

/* 姓名欄位的驗證細節 */
function examineName(className) {
	input = className.value
	if (!input) {
		enableNotice(className, '請輸入您的姓名')
		return false
	}
	let regex = /^[\u4e00-\u9fa5A-Za-z]+$/.test(input)
	if (!regex) {
		enableNotice(className, '姓名限用中文或英文組成')
		return false
	}
	disableNotice(className)
	return true
}

/* 檢查 email 欄位 */
function examineEmail(className) {
	let input = className.value
	if (!input) {
		enableNotice(className, '請輸入您的電子郵件')
		return false
	}
	let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input)
	if (!regex) {
		enableNotice(className, '抱歉！您所輸入的電子信箱格式不正確')
		return false
	}
	disableNotice(className)
	return true
}

/* 檢查密碼欄位 */
function examinePassword(className) {
	let input = className.value
	if (!input) {
		enableNotice(className, '請輸入您的密碼')
		return false
	}
	if (input.length < 8) {
		enableNotice(className, '抱歉！密碼應至少 8 個字元，請再檢查一次')
		return false
	}
	let regex1 = /^[a-zA-Z0-9]+$/.test(input)
	if (!regex1) {
		enableNotice(className, '抱歉！密碼不應包含特殊符號，請再檢查一次')
		return false
	}

	let regex2 = /^(?=.*[A-Za-z])([A-Za-z0-9]+)$/.test(input)
	if (!regex2) {
		enableNotice(className, '抱歉！密碼應至少包含一個英文字母')
		return false
	}

	let regex3 = /^^(?=.*[0-9])([A-Za-z0-9]+)$$/.test(input)
	if (!regex3) {
		enableNotice(className, '抱歉！密碼應至少包含一個數字')
		return false
	}
	disableNotice(className)
	return true
}

/* 顯示 input 驗證提示 */
function enableNotice(className, message) {
	className.nextElementSibling.textContent = message
	className.nextElementSibling.style.display = 'block'
	className.style.border = '1px solid #d20000'
}


/* 消除 input 驗證提示 */
function disableNotice(className) {
	className.nextElementSibling.textContent = ''
	className.nextElementSibling.style.display = 'none'
	className.removeAttribute('style')
}

/*顯示後端回傳錯誤提示*/
function enableBackEndMessage(Message, from) {
	if (from === 'signUp') {
		const signUpBtn = document.querySelector('.signUpBtn')
		const signUpName = document.querySelector('.signUpName')
		const signUpEmail = document.querySelector('.signUpEmail')
		const signUpPassword = document.querySelector('.signUpPassword')

		signUpBtn.previousElementSibling.textContent = Message
		signUpBtn.previousElementSibling.style.display = 'block'
		if (Message === '電子郵件已被註冊' || Message === '電子郵件格式不正確') {
			signUpEmail.style.border = '1px solid #d20000'
			return
		}

		signUpName.style.border = '1px solid #d20000'
		signUpEmail.style.border = '1px solid #d20000'
		signUpPassword.style.border = '1px solid #d20000'
	}

	if (from === 'signIn') {
		const signInBtn = document.querySelector('.signInBtn')
		const signInEmail = document.querySelector('.signInEmail')
		const signInPassword = document.querySelector('.signInPassword')
		signInBtn.previousElementSibling.textContent = Message
		signInBtn.previousElementSibling.style.display = 'block'
		signInEmail.style.border = '1px solid #d20000'
		signInPassword.style.border = '1px solid #d20000'
	}
	return
}

/* 消除後端回傳在登入區的提示 */
function disableBackEndSignInMessage() {
	const signInBtn = document.querySelector('.signInBtn')
	const signInEmail = document.querySelector('.signInEmail')
	const signInPassword = document.querySelector('.signInPassword')
	signInBtn.previousElementSibling.textContent = ''
	signInBtn.previousElementSibling.style.display = 'none'
	signInEmail.removeAttribute('style')
	signInPassword.removeAttribute('style')
}

/* 消除後端回傳在註冊區的提示 */
function disableBackEndSignInMessage() {
	const signUpBtn = document.querySelector('.signUpBtn')
	const signUpName = document.querySelector('.signUpName')
	const signUpEmail = document.querySelector('.signUpEmail')
	const signUpPassword = document.querySelector('.signUpPassword')
	signUpBtn.previousElementSibling.textContent = ''
	signUpBtn.previousElementSibling.style.display = 'none'
	signUpName.removeAttribute('style')
	signUpEmail.removeAttribute('style')
	signUpPassword.removeAttribute('style')
}

/* 消除所有登入區的提示 */
function disableAllSignInMessage() {
	const signInEmail = document.querySelector('.signInEmail')
	const signInPassword = document.querySelector('.signInPassword')
	disableBackEndSignInMessage()
	disableNotice(signInEmail)
	disableNotice(signInPassword)
}

/* 消除所有註冊區的提示 */
function disableAllSignUpMessage() {
	const signUpName = document.querySelector('.signUpName')
	const signUpEmail = document.querySelector('.signUpEmail')
	const signUpPassword = document.querySelector('.signUpPassword')
	disableBackEndSignInMessage()
	disableNotice(signUpName)
	disableNotice(signUpEmail)
	disableNotice(signUpPassword)
}

//todo：註冊區
// 1. 檢查註冊區的所有 input 輸入內容是否正確  v
// 2. 新增檢查姓名欄位  v
// 3. 密碼 email 函式參數修改  v
// 4. 顯示後端回傳錯誤提示(註冊) v
// 5. 消除後端回傳在註冊區的提示 v
// 6. 消除所有登入區的提示 v
// 7. 提交用戶註冊資訊時判斷 v
// 8. 關閉 box 時判斷 v
// 9. 切換到登入時消除提示的判斷 



//--------------------------------------
/*註冊區：點擊 input 時移除錯誤訊息*/
// function removeSignUpMessage() {
// 	const signUpForm = document.querySelector('.signUpForm')
// 	const signUpName = document.querySelector('.signUpName')
// 	const signUpEmail = document.querySelector('.signUpEmail')
// 	const signUpPassword = document.querySelector('.signUpPassword')

// 	focusOn(signUpName, signUpForm)
// 	focusOn(signUpEmail, signUpForm)
// 	focusOn(signUpPassword, signUpForm)
// }


/*登入區：點擊 input 時移除錯誤訊息*/
// function removeSignInMessage() {
// 	const signInForm = document.querySelector('.signInForm')
// 	const signInEmail = document.querySelector('.signInEmail')
// 	const signInPassword = document.querySelector('.signInPassword')

// 	focusOn(signInEmail, signInForm)
// 	focusOn(signInPassword, signInForm)
// }


/* 監聽 focus 事件 */
// function focusOn(inputArea) {
// 	inputArea.addEventListener('focus', () => {
// 		removeMessage()
// 	})
// }


/*移除錯誤訊息*/
// function removeMessage() {
// 	let message = document.querySelector('.message')
// 	if (message === null) return
// 	if (message.parentNode) {
// 		message.parentNode.removeChild(message);
// 	}
// }


// let message = document.querySelector('.message')
// if (message !== null) {
// 	form.removeChild(message)
// }
//removeMessage 待處理