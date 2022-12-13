/* 取得使用者預訂行程 */
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
	dayTrip__info.href = `/attraction/${id}`
	dayTrip__img.src = url
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

	deleteBookingTrip(id)
}


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
				//block
			})
	})
}

function getTokenFromCookie() {
	let token = document.cookie.split('=')[1];
	if (!token) {
		window.location.href = '/'
		return
	}
	return token
}
