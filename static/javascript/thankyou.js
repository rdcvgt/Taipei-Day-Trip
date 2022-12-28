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

/* fetch 使用者預訂資料 */
function fetchUserBooking() {
	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();
	currentUrl = window.location.href.toString().split("=");
	orderId = currentUrl[1];
	fetch(`/api/order/${orderId}`, {
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
				if (res.status === 0) {
					showSuccessOrderMessage();
				} else {
					showFailOrderMessage();
				}
			}
			const noOrder = document.querySelector(".noOrder");
			noOrder.textContent = `查找不到訂單編號爲「${orderId}」的資料`;
		});
}
fetchUserBooking();

// /* 若使用者有預訂行程，顯示行程等資訊*/
function showBookingInfo() {
	const tripInfo = document.querySelector(".tripInfo");
	const noOrder = document.querySelector(".noOrder");
	tripInfo.style.display = "block";
	noOrder.style.display = "none";
}

/* 載入使用者預訂行程資料 */
function loadBookingInfo(res) {
	console.log(res);
	let orderId = res.number;
	let email = res.contact.email;
	let userName = res.contact.name;
	let phone = res.contact.phone;

	const dayTrip__orderId = document.querySelector(".dayTrip__orderId");
	const dayTrip__username = document.querySelector(".dayTrip__username");
	const dayTrip__phone = document.querySelector(".dayTrip__phone");
	const dayTrip__email = document.querySelector(".dayTrip__email");

	dayTrip__orderId.textContent = orderId;
	dayTrip__email.textContent = email;
	dayTrip__username.textContent = userName;
	dayTrip__phone.textContent = phone;

	const tripSection = document.querySelector(".trip-section");
	const cardTemplate = document.querySelector(`.card-template`);
	res.data.forEach((att) => {
		preload = `
		<div class="dayTrip">
			<div class="dayTrip__imgBox">
				<img class="dayTrip__img skeleton">
			</div>
			<div class="dayTrip__infoBox">
				<div class="dayTrip__skeleton ">
					<div class="skeleton skeleton-text"></div>
					<div class="skeleton skeleton-text"></div>
					<div class="skeleton skeleton-text"></div>
					<div class="skeleton skeleton-text"></div>
					<div class="skeleton skeleton-text"></div>
					<div class="skeleton skeleton-text"></div>
				</div>
			</div>
		</div>
		`;
		cardTemplate.insertAdjacentHTML("beforeend", preload);

		let attId = att.trip.attraction.id;
		let name = att.trip.attraction.name;
		let address = att.trip.attraction.address;
		let url = att.trip.attraction.image;
		let dateText = att.trip.date;
		let priceText = att.price;
		let bookingId = att.trip.bookingId;
		let timeText =
			att.trip.time === "morning"
				? "早上 9 點到下午 2 點"
				: "下午 2 點到晚上 7 點";

		let block = `
		<div class="dayTrip trip${bookingId}">
			<div class="dayTrip__imgBox">
				<a class="dayTrip__imgAtt" href="/trip.attraction/${attId}">
					<img class="dayTrip__img" src=${url}>
				</a>
			</div>
			<div class="dayTrip__infoBox">
				<a class="dayTrip__info bodyBold" href="/attraction/${attId}">
					<div class="dayTrip__name">${name}</div>
				</a>
				<div class="dayTrip__info bodyBold">
					日期：
					<div class="dayTrip__date bodyMedium">${dateText}</div>
				</div>
				<div class="dayTrip__info bodyBold">
					時間：
					<div class="dayTrip__time bodyMedium">${timeText}</div>
				</div>
				<div class="dayTrip__info bodyBold">
					費用：
					<div class="dayTrip__fee bodyMedium">新臺幣 ${priceText} 元</div>
				</div>
				<div class="dayTrip__info bodyBold">
					地點：
					<div class="dayTrip__address bodyMedium">${address}</div>
				</div>
			</div>
		</div>
		`;

		tripSection.insertAdjacentHTML("beforeend", block);

		const currentTrip = document.querySelector(`.trip${bookingId}`);
		currentTrip.style.display = "none";

		const dayTrip__img = document.querySelector(".dayTrip__img");
		dayTrip__img.addEventListener("load", () => {
			cardTemplate.style.display = "none";
			currentTrip.removeAttribute("style");
		});
	});
}

function showSuccessOrderMessage() {
	const orderMessage = document.querySelector(".order-message");
	orderMessage.textContent = "訂購完成！";

	const dayTrip__statusImg = document.querySelector(".dayTrip__statusImg");
	dayTrip__statusImg.src = "../static/Images/components/success.png";
}

function showFailOrderMessage() {
	const orderMessage = document.querySelector(".order-message");
	orderMessage.textContent = "訂單失敗，";

	const dayTrip__statusImg = document.querySelector(".dayTrip__statusImg");
	dayTrip__statusImg.src = "../static/Images/components/fail.png";

	const backToBooking = document.querySelector(".backToBooking");
	backToBooking.style.display = "block";
}

function buttonRedirect() {
	const backToHomePage = document.querySelector(".backToHomePage");
	backToHomePage.addEventListener("click", () => {
		window.location.href = "/";
	});

	const backToBooking = document.querySelector(".backToBooking");
	backToBooking.addEventListener("click", () => {
		window.location.href = "/booking";
	});
}
buttonRedirect();
