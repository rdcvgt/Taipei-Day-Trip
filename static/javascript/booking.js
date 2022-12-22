/* 從 cookie 取得 JWT token */
function getTokenFromCookie() {
	let token = document.cookie.split("=")[1];
	if (!token) {
		window.location.href = "/";
		return;
	}
	return token;
}
getTokenFromCookie();

/* 顯示使用者名稱 */
function showUserName() {
	let userInfo = JSON.parse(sessionStorage.user);
	const headline_username = document.querySelector(".headline_username");
	headline_username.textContent = userInfo.name;
}
showUserName();

/* fetch 使用者預訂資料 */
function fetchUserBooking() {
	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();
	fetch("/api/booking", {
		method: "GET",
		headers: {
			authorization: `Bearer ${token}`,
			userId: `${userInfo.id}`,
		},
	})
		.then((res) => res.json())
		.then((res) => {
			//登入驗證失敗導回首頁
			if (res.error === true) {
				window.location.href = "/";
				return;
			}
			if (res.data) {
				showBookingInfo();
				loadBookingInfo(res);
			}
		});
}
fetchUserBooking();

/* 若使用者有預訂行程，顯示行程等資訊*/
function showBookingInfo() {
	const tripInfo = document.querySelector(".tripInfo");
	const noBooking = document.querySelector(".noBooking");
	tripInfo.style.display = "block";
	noBooking.style.display = "none";
}

/* 載入使用者預訂行程資料 */
function loadBookingInfo(res) {
	let userInfo = JSON.parse(sessionStorage.user);
	let id = res.data.attraction.id;
	let name = res.data.attraction.name;
	let address = res.data.attraction.address;
	let url = res.data.attraction.image;
	let date = res.data.date;
	let price = res.data.price;
	let time = res.data.time;

	const card = document.querySelector(".card");
	const cardTemplate = document.querySelector(".card-template");
	const dayTrip__info = document.querySelector(".dayTrip__info");
	const dayTrip__img = document.querySelector(".dayTrip__img");
	const dayTrip__imgAtt = document.querySelector(".dayTrip__imgAtt");
	const dayTrip__name = document.querySelector(".dayTrip__name");
	const dayTrip__date = document.querySelector(".dayTrip__date");
	const dayTrip__time = document.querySelector(".dayTrip__time");
	const dayTrip__fee = document.querySelector(".dayTrip__fee");
	const dayTrip__address = document.querySelector(".dayTrip__address");
	const contact__name = document.querySelector(".contact__name");
	const contact__email = document.querySelector(".contact__email");
	const confirm__feeSum = document.querySelector(".confirm__feeSum");

	document.title = `預訂行程 - ${name}`;
	dayTrip__imgAtt.href = `/attraction/${id}`;
	dayTrip__img.src = url;
	dayTrip__info.href = `/attraction/${id}`;
	dayTrip__name.textContent = name;
	dayTrip__date.textContent = date;
	dayTrip__fee.textContent = `新臺幣 ${price} 元`;
	dayTrip__address.textContent = address;
	contact__name.value = userInfo.name;
	contact__email.value = userInfo.email;
	confirm__feeSum.textContent = ` ${price} `;

	if (time === "morning") {
		dayTrip__time.textContent = "早上 9 點到下午 2 點";
	} else if (time === "afternoon") {
		dayTrip__time.textContent = "下午 2 點到晚上 7 點";
	}

	dayTrip__img.addEventListener("load", () => {
		card.style.display = "block";
		cardTemplate.style.display = "none";
	});

	orderData = {
		order: {
			price: time === "morning" ? 2000 : 4000,
			trip: {
				attraction: {
					id,
					name,
					address,
					image: url,
				},
				date,
				time,
			},
		},
	};

	deleteBookingTrip(id);
	examineAllInput(orderData);
}

/* 刪除行程並且重新整理頁面 */
function deleteBookingTrip(id) {
	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();

	const dayTrip__delete = document.querySelector(".dayTrip__delete");
	dayTrip__delete.addEventListener("click", () => {
		fetch("/api/booking", {
			method: "DELETE",
			headers: {
				authorization: `Bearer ${token}`,
				userId: `${userInfo.id}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				//登入驗證失敗導回首頁
				if (res.error === true) {
					window.location.href = "/";
					return;
				}
				window.location.reload("/booking");
			});
	});
}

/* 驗證頁面中所有 input，分別驗證與點擊付款時驗證 */
function examineAllInput(orderData) {
	//姓名欄位
	const contact__name = document.querySelector(".contact__name");
	contact__name.addEventListener("blur", () => {
		examineName(contact__name);
	});

	//email 欄位
	const contact__email = document.querySelector(".contact__email");
	contact__email.addEventListener("blur", () => {
		examineEmail(contact__email);
	});

	//手機欄位
	const contact__phone = document.querySelector(".contact__phone");

	contact__phone.addEventListener("blur", () => {
		examinePhone(contact__phone);
	});

	//點擊付款按鈕時檢查所有欄位
	const confirmBtn = document.querySelector(".confirmBtn");
	confirmBtn.addEventListener("click", () => {
		disableCardErrMessage();
		let userName = examineName(contact__name);
		let email = examineEmail(contact__email);
		let phone = examinePhone(contact__phone);
		let phoneNumber = contact__phone.value;

		if (userName && email && phone) {
			primeStatus = getPrime(orderData, phoneNumber);
			console.log(primeStatus);
			if (!primeStatus) {
				enableCardErrMessage();
			}
		}
		//todo: false 驗證
	});
}

/* 取得 prime */
function getPrime(orderData, phoneNumber) {
	// 取得 TapPay Fields 的 status
	const tappayStatus = TPDirect.card.getTappayFieldsStatus();

	// 確認是否可以 getPrime
	if (tappayStatus.canGetPrime === false) {
		return false;
	}
	// Get prime
	let prime;
	TPDirect.card.getPrime((result) => {
		if (result.status !== 0) {
			// console.log("get prime error " + result.msg);
			return false;
		}
		prime = result.card.prime;
		sendOrderToBackend(prime, orderData, phoneNumber);
	});

	return true;
}

/* 將使用用的訂單資訊及 prime 傳送至 /api/orders */
function sendOrderToBackend(prime, { order }, phoneNumber) {
	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();
	orderData = {
		prime,
		order,
		contact: {
			name: userInfo.name,
			email: userInfo.email,
			phone: phoneNumber,
		},
	};

	fetch("/api/orders", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${token}`,
			userId: `${userInfo.id}`,
		},
		body: JSON.stringify(orderData),
	})
		.then((res) => res.json())
		.then((res) => {
			if (res.data) {
				location.href = `/thankyou?number=${res.data.number}`;
			}
			if (res.error === true) {
				console.log("失敗"); //todo
			}
		});
}

/* 姓名欄位的驗證細節 */
function examineName(contact__name) {
	input = contact__name.value;
	if (!input) {
		enableNotice(contact__name, "請輸入您的姓名");
		return false;
	}
	regex = /^[\u4e00-\u9fa5A-Za-z]*$/.test(input);
	if (!regex) {
		enableNotice(contact__name, "姓名限用中文或英文組成");
		return false;
	}
	disableNotice(contact__name);
	return true;
}

/* 信箱欄位的驗證細節 */
function examineEmail(contact__email) {
	input = contact__email.value;
	if (!input) {
		enableNotice(contact__email, "請輸入您的電子郵件");
		return false;
	}
	regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input);
	if (!regex) {
		enableNotice(contact__email, "抱歉！您所輸入的電子信箱格式不正確");
		return false;
	}
	disableNotice(contact__email);
	return true;
}

/* 手機號碼欄位的驗證細節 */
function examinePhone(contact__phone) {
	input = contact__phone.value;
	if (!input) {
		enableNotice(contact__phone, "請輸入您的手機號碼");
		return false;
	}
	regex = /^09\d{8}$/.test(input);
	if (!regex) {
		enableNotice(
			contact__phone,
			"抱歉！您所輸入的手機格式不正確，需爲 09 開頭的十碼數字"
		);
		return false;
	}
	disableNotice(contact__phone);
	return true;
}

function enableCardErrMessage() {
	const tpfields = document.querySelectorAll(".tpfield");
	tpfields.forEach((tpfield) => {
		tpfield.style.border = "1px solid #d20000";
	});

	const cardNotice = document.querySelector(".cardNotice");
	cardNotice.style.display = "flex";
}

function disableCardErrMessage() {
	const tpfields = document.querySelectorAll(".tpfield");
	tpfields.forEach((tpfield) => {
		tpfield.removeAttribute("style");
	});

	const cardNotice = document.querySelector(".cardNotice");
	cardNotice.removeAttribute("style");
}

/* 顯示驗證提示 */
function enableNotice(className, message) {
	className.nextElementSibling.textContent = message;
	className.nextElementSibling.style.display = "block";
	className.style.border = "1px solid #d20000";
}

/* 消除驗證提示 */
function disableNotice(className) {
	className.nextElementSibling.textContent = "";
	className.nextElementSibling.style.display = "none";
	className.removeAttribute("style");
}
