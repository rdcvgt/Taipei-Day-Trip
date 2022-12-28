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
// function showUserName() {
// 	let userInfo = JSON.parse(sessionStorage.user);
// 	const headline_username = document.querySelector(".headline_username");
// 	headline_username.textContent = userInfo.name;
// }
// showUserName();

/* fetch 使用者預訂資料 */
// function fetchUserBooking() {
// 	let userInfo = JSON.parse(sessionStorage.user);
// 	let token = getTokenFromCookie();
// 	currentUrl = window.location.href.toString().split("=");
// 	orderId = currentUrl[1];
// 	fetch(`/api/order/${orderId}`, {
// 		method: "GET",
// 		headers: {
// 			authorization: `Bearer ${token}`,
// 			userId: `${userInfo.id}`,
// 		},
// 	})
// 		.then((res) => res.json())
// 		.then((res) => {
// 			//登入驗證失敗導回首頁
// 			if (res.error === true) {
// 				window.location.href = "/";
// 				return;
// 			}
// 			if (res.data) {
// 				showBookingInfo();
// 				loadBookingInfo(res.data);
// 				if (res.data.status === 0) {
// 					showSuccessOrderMessage();
// 				} else {
// 					showFailOrderMessage();
// 				}
// 			}
// 			const noOrder = document.querySelector(".noOrder");
// 			noOrder.textContent = `查找不到訂單編號爲「${orderId}」的資料`;
// 		});
// }
// fetchUserBooking();

/* 若使用者有預訂行程，顯示行程等資訊*/
function showBookingInfo() {
	const tripInfo = document.querySelector(".tripInfo");
	const noOrder = document.querySelector(".noOrder");
	tripInfo.style.display = "block";
	noOrder.style.display = "none";
}

/* 載入使用者預訂行程資料 */
function loadBookingInfo(res) {
	let orderId = res.number;
	let email = res.contact.email;
	let userName = res.contact.name;
	let phone = res.contact.phone;

	let id = res.trip.attraction.id;
	let name = res.trip.attraction.name;
	let address = res.trip.attraction.address;
	let url = res.trip.attraction.image;
	let date = res.trip.date;
	let price = res.price;
	let time = res.trip.time;

	const card = document.querySelector(".card");
	const cardTemplate = document.querySelector(".card-template");
	const dayTrip__orderId = document.querySelector(".dayTrip__orderId");
	const dayTrip__username = document.querySelector(".dayTrip__username");
	const dayTrip__phone = document.querySelector(".dayTrip__phone");
	const dayTrip__email = document.querySelector(".dayTrip__email");

	const attLink = document.querySelector(".attLink");
	const dayTrip__img = document.querySelector(".dayTrip__img");
	const dayTrip__imgAtt = document.querySelector(".dayTrip__imgAtt");
	const dayTrip__name = document.querySelector(".dayTrip__name");
	const dayTrip__date = document.querySelector(".dayTrip__date");
	const dayTrip__time = document.querySelector(".dayTrip__time");
	const dayTrip__address = document.querySelector(".dayTrip__address");
	const dayTrip__fee = document.querySelector(".dayTrip__fee");

	document.title = `訂單資訊 - ${name}`;
	dayTrip__orderId.textContent = orderId;
	dayTrip__email.textContent = email;
	dayTrip__username.textContent = userName;
	dayTrip__phone.textContent = phone;

	dayTrip__imgAtt.href = `/attraction/${id}`;
	dayTrip__img.src = url;
	attLink.href = `/attraction/${id}`;
	dayTrip__name.textContent = name;
	dayTrip__date.textContent = date;
	dayTrip__address.textContent = address;
	dayTrip__fee.textContent = `新臺幣 ${price} 元`;

	if (time === "morning") {
		dayTrip__time.textContent = "早上 9 點到下午 2 點";
	} else if (time === "afternoon") {
		dayTrip__time.textContent = "下午 2 點到晚上 7 點";
	}

	dayTrip__img.addEventListener("load", () => {
		card.style.display = "block";
		cardTemplate.style.display = "none";
	});
}

function showSuccessOrderMessage() {
	const orderMessage = document.querySelector(".order-message");
	orderMessage.textContent = "付款成功！";

	const dayTrip__statusImg = document.querySelector(".dayTrip__statusImg");
	dayTrip__statusImg.src = "../static/Images/components/success.png";
}

function showFailOrderMessage() {
	const orderMessage = document.querySelector(".order-message");
	orderMessage.textContent = "付款失敗，";

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
