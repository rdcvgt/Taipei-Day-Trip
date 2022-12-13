/* 從 cookie 取得 JWT token */
function getTokenFromCookie() {
	let token = document.cookie.split('=')[1];
	if (!token) {
		window.location.href = '/'
		return
	}
	return token
}


/* 顯示使用者名稱 */
function showUserName() {
	let userInfo = JSON.parse(sessionStorage.user)
	const headline_username = document.querySelector('.headline_username')
	headline_username.textContent = userInfo.name
}
showUserName()


/* fetch 使用者預訂資料 */
function fetchUserBooking() {
	let userInfo = JSON.parse(sessionStorage.user)
	let token = getTokenFromCookie()
	fetch('/api/booking', {
		method: 'GET',
		headers: {
			'authorization': `Bearer ${token}`,
			'userId': `${userInfo.id}`
		},
	})
		.then(res => res.json())
		.then(res => {
			//登入驗證失敗導回首頁
			if (res.error === true) {
				window.location.href = '/'
				return
			}
			if (res.data) {
				showBookingInfo()
				loadBookingInfo(res)
				// examineInput()
			}
		})
}
fetchUserBooking()


/* 若使用者有預訂行程，顯示行程等資訊*/
function showBookingInfo() {
	const tripInfo = document.querySelector('.tripInfo')
	const noBooking = document.querySelector('.noBooking')
	tripInfo.style.display = 'block'
	noBooking.style.display = 'none'


}



/* 載入使用者預訂行程資料 */
function loadBookingInfo(res) {
	let userInfo = JSON.parse(sessionStorage.user)
	let id = res.data.attraction.id
	let name = res.data.attraction.name
	let address = res.data.attraction.address
	let url = res.data.attraction.image
	let date = res.data.date
	let price = res.data.price
	let time = res.data.time

	const card = document.querySelector('.card')
	const cardTemplate = document.querySelector('.card-template')
	const dayTrip__info = document.querySelector('.dayTrip__info')
	const dayTrip__img = document.querySelector('.dayTrip__img')
	const dayTrip__name = document.querySelector('.dayTrip__name')
	const dayTrip__date = document.querySelector('.dayTrip__date')
	const dayTrip__time = document.querySelector('.dayTrip__time')
	const dayTrip__fee = document.querySelector('.dayTrip__fee')
	const dayTrip__address = document.querySelector('.dayTrip__address')
	const contact__name = document.querySelector('.contact__name')
	const contact__email = document.querySelector('.contact__email')
	const confirm__feeSum = document.querySelector('.confirm__feeSum')


	document.title = `預訂行程 - ${name}`
	dayTrip__img.src = url
	dayTrip__info.href = `/attraction/${id}`
	dayTrip__name.textContent = name
	dayTrip__date.textContent = date
	dayTrip__fee.textContent = `新臺幣 ${price} 元`
	dayTrip__address.textContent = address
	contact__name.value = userInfo.name
	contact__email.value = userInfo.email
	confirm__feeSum.textContent = ` ${price} `

	if (time === 'morning') {
		dayTrip__time.textContent = '早上 9 點到下午 2 點'
	} else if (time === 'afternoon') {
		dayTrip__time.textContent = '下午 2 點到晚上 7 點'
	}

	dayTrip__img.addEventListener('load', () => {
		card.style.display = 'block'
		cardTemplate.style.display = 'none'
	})
	deleteBookingTrip(id)
	examineAllInput()


}

/* 刪除行程並且重新整理頁面 */
function deleteBookingTrip(id) {
	let userInfo = JSON.parse(sessionStorage.user)
	let token = getTokenFromCookie()

	const dayTrip__delete = document.querySelector('.dayTrip__delete')
	dayTrip__delete.addEventListener('click', () => {
		fetch('/api/booking', {
			method: 'DELETE',
			headers: {
				'authorization': `Bearer ${token}`,
				'userId': `${userInfo.id}`
			},
		})
			.then(res => res.json())
			.then(res => {
				//登入驗證失敗導回首頁
				if (res.error === true) {
					window.location.href = '/'
					return
				}
				window.location.reload('/booking')
			})
	})
}


/* 驗證頁面中所有 input，分別驗證與點擊付款時驗證 */
function examineAllInput() {
	//姓名欄位
	const contact__name = document.querySelector('.contact__name')
	contact__name.addEventListener('blur', () => {
		examineName(contact__name)
	})

	//email 欄位
	const contact__email = document.querySelector('.contact__email')
	contact__email.addEventListener('blur', () => {
		examineEmail(contact__email)
	})

	//手機欄位
	const contact__phone = document.querySelector('.contact__phone')
	contact__phone.addEventListener('blur', () => {
		examinePhone(contact__phone)
	})

	//信用卡號欄位
	const payment__card = document.querySelector('.payment__card')
	//使用者在輸入每四個數字時會動加上一個 dash 符號
	payment__card.addEventListener('keyup', (e) => {
		let value = e.target.value
		if ((value.length === 4 ||
			value.length === 9 ||
			value.length === 14) &&
			value[value.length - 1] !== "-"
		) {
			event.target.value = value + "-";
		}
	})
	payment__card.addEventListener('blur', () => {
		examineCard(payment__card)
	})

	//信用卡效期欄位
	const payment__validTime = document.querySelector('.payment__validTime')
	//使用者在輸入完月份時會自動加上 / 符號
	payment__validTime.addEventListener('keyup', (e) => {
		let value = e.target.value
		if (value.length === 2 &&
			value[value.length - 1] !== "/"
		) {
			event.target.value = value + "/";
		}
	})
	payment__validTime.addEventListener('blur', () => {
		examineValidTime(payment__validTime)
	})

	//信用卡驗證碼欄位
	const payment__cvv = document.querySelector('.payment__cvv')
	payment__cvv.addEventListener('blur', () => {
		examineCVV(payment__cvv)
	})

	//點擊付款按鈕時檢查所有欄位
	const confirmBtn = document.querySelector('.confirmBtn')
	confirmBtn.addEventListener('click', () => {
		examineName(contact__name)
		examineEmail(contact__email)
		examinePhone(contact__phone)
		examineCard(payment__card)
		examineValidTime(payment__validTime)
		examineCVV(payment__cvv)
	})
}


/* 姓名欄位的驗證細節 */
function examineName(contact__name) {
	input = contact__name.value
	if (!input) {
		enableNotice(contact__name, '請輸入您的姓名')
		return
	}
	regex = /^[\u4e00-\u9fa5a-zA-Z]*$/.test(input)
	if (!regex) {
		enableNotice(contact__name, '請勿輸入數字或特殊符號')
		return
	}
	disableNotice(contact__name)
}

function examineEmail(contact__email) {
	input = contact__email.value
	if (!input) {
		enableNotice(contact__email, '請輸入您的電子郵件')
		return
	}
	regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input)
	if (!regex) {
		enableNotice(contact__email, '抱歉！您所輸入的電子信箱格式不正確')
		return
	}
	disableNotice(contact__email)
}

function examinePhone(contact__phone) {
	input = contact__phone.value
	if (!input) {
		enableNotice(contact__phone, '請輸入您的手機號碼')
		return
	}
	regex = /^09\d{8}$/.test(input)
	if (!regex) {
		enableNotice(contact__phone, '抱歉！您所輸入的手機格式不正確，需爲 09 開頭的十碼數字')
		return
	}
	disableNotice(contact__phone)
}

function examineCard(payment__card) {
	input = payment__card.value
	if (!input) {
		enableNotice(payment__card, '請輸入您的信用卡號碼')
		return
	}
	regex = /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(input)
	if (!regex) {
		enableNotice(payment__card, '請輸入完整信用卡號碼')
		return
	}
	disableNotice(payment__card)
}

function examineValidTime(payment__validTime) {
	input = payment__validTime.value
	if (!input) {
		enableNotice(payment__validTime, '請輸入您的信用卡有效期限')
		return
	}
	regex = /^\d{2}\/\d{2}$/.test(input)
	if (!regex) {
		enableNotice(payment__validTime, '請輸入正確的有效期限格式 MM/YY')
		return
	}
	//驗證月份只能是數字 01-12
	regexMonth = /^(1[0-2]|0[1-9])\/\d{2}$/.test(input)
	if (!regexMonth) {
		enableNotice(payment__validTime, '抱歉，月份輸入有誤，請再檢查一次')
		return
	}
	disableNotice(payment__validTime)
}

function examineCVV(payment__cvv) {
	input = payment__cvv.value
	if (!input) {
		enableNotice(payment__cvv, '請輸入您的信用卡驗證密碼')
		return
	}
	regex = /^\d{3}$/.test(input)
	if (!regex) {
		enableNotice(payment__cvv, '請輸入完整的信用卡驗證密碼')
		return
	}
	disableNotice(payment__cvv)
}





/* 顯示驗證提示 */
function enableNotice(className, message) {
	className.nextElementSibling.textContent = message
	className.nextElementSibling.style.display = 'block'
	className.style.border = '1px solid #d20000'
}


/* 消除驗證提示 */
function disableNotice(className) {
	className.nextElementSibling.textContent = ''
	className.nextElementSibling.style.display = 'none'
	className.removeAttribute('style')
}

