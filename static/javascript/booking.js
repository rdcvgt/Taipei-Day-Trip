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
	const headline = document.querySelector(".headline");
	headline.textContent = `您好，${userInfo.name}，待預訂的行程如下：`;
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
				showMassage(res.message, false);
				setTimeout(() => {
					window.location.href = "/";
				}, 1000);
				return;
			}
			if (res.data.length !== 0) {
				showBookingInfo();
				loadBookingInfo(res.data);
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
function loadBookingInfo(attractions) {
	//載入使用者資訊
	let userInfo = JSON.parse(sessionStorage.user);
	const contact__name = document.querySelector(".contact__name");
	const contact__email = document.querySelector(".contact__email");
	contact__name.value = userInfo.name;
	contact__email.value = userInfo.email;

	//載入使用者所有預訂行程
	const section = document.querySelector(".section");
	const cardTemplate = document.querySelector(`.card-template`);
	attractions.forEach((att) => {
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

		let attId = att.attraction.id;
		let name = att.attraction.name;
		let address = att.attraction.address;
		let url = att.attraction.image;
		let dateText = att.date;
		let priceText = att.price;
		let bookingId = att.bookingId;
		let timeText =
			att.time === "morning"
				? "早上 9 點到下午 2 點"
				: "下午 2 點到晚上 7 點";

		let block = `
		<div class="dayTrip trip${bookingId}">
			<div class="dayTrip__imgBox">
				<a class="dayTrip__imgAtt" href="/attraction/${attId}">
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
				<label class='dayTrip__checkboxLabel bodyMedium'>
					<input type="checkbox" class="dayTrip__checkbox" name="trip" value="${bookingId}" /> 選擇此行程
				</label>
				
				<div class="dayTrip__delete delete-${bookingId}">
					<img class="dayTrip__deleteIcon" src="../static/Images/components/delete.png" alt="">
				</div>
			</div>
		</div>
		`;

		section.insertAdjacentHTML("beforeend", block);

		const currentTrip = document.querySelector(`.trip${bookingId}`);
		currentTrip.style.display = "none";

		const dayTrip__img = document.querySelector(".dayTrip__img");
		dayTrip__img.addEventListener("load", () => {
			cardTemplate.style.display = "none";
			currentTrip.removeAttribute("style");
		});
	});

	updateFeeSum();
}

/* 刪除行程並且重新整理頁面 */
function deleteBookingTrip() {
	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();

	const card = document.querySelector(".card");
	card.addEventListener("click", (e) => {
		if (e.target.tagName !== "IMG") return;
		let bookingId = e.target.parentNode.className.split("-")[1];
		fetch("/api/booking", {
			method: "DELETE",
			headers: {
				authorization: `Bearer ${token}`,
				userId: `${userInfo.id}`,
				bookingId: `${bookingId}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				//登入驗證失敗導回首頁
				if (res.error === true) {
					showMassage(res.message, false);
					setTimeout(() => {
						window.location.href = "/";
					}, 1000);
					return;
				}
				//顯示移除成功訊息
				showMassage("刪除成功！", true);

				//移除已刪除的行程欄位
				const currentTrip = document.querySelector(`.trip${bookingId}`);
				currentTrip.parentNode.removeChild(currentTrip);

				//若預訂行程已完全刪除，則重新整理頁面
				const card = document.querySelector(".card");
				if (card.children.length === 1) {
					setTimeout(() => {
						window.location.reload("/booking");
					}, 1000);
				}
			});
	});
}
deleteBookingTrip();

/* 根據所選行程改變總價 */
function updateFeeSum() {
	const confirm__fee = document.querySelector(".confirm__fee");
	const dayTrip__checkbox = document.querySelectorAll(".dayTrip__checkbox");
	let feeSum = 0;
	dayTrip__checkbox.forEach((checkbox) => {
		checkbox.addEventListener("change", (e) => {
			price = parseInt(
				e.target.parentNode.parentNode.children[3].children[0].textContent.split(
					" "
				)[1]
			);
			if (e.currentTarget.checked) {
				feeSum += price;
			} else {
				feeSum -= price;
			}
			confirm__fee.textContent = `總價：新臺幣 ${feeSum} 元`;
		});
	});
}

/* 驗證頁面中所有 input，分別驗證與點擊付款時驗證 */
function examineAllInput() {
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
		let booking = examineOrder();
		if (userName && email && phone && booking) {
			primeStatus = getPrime();
			if (!primeStatus) {
				enableCardErrMessage();
			}
		}
		//todo: false 驗證
	});
}
examineAllInput();

/* 取得 prime */
function getPrime() {
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
			return false;
		}
		prime = result.card.prime;
		sendOrderToBackend(prime);
		showLoadingStatus();
	});

	return true;
}

/* 將使用用的訂單資訊及 prime 傳送至 /api/orders */
function sendOrderToBackend(prime) {
	const dayTrip__checkbox = document.querySelectorAll(
		".dayTrip__checkbox:checked"
	);

	let data = [];
	let price = 0;
	dayTrip__checkbox.forEach((trip) => {
		price += parseInt(
			trip.parentNode.parentNode.children[3].children[0].textContent.split(
				" "
			)[1]
		);
		data.push(trip.value);
	});

	let userInfo = JSON.parse(sessionStorage.user);
	const name = document.querySelector(".contact__name").value;
	const email = document.querySelector(".contact__email").value;
	const phone = document.querySelector(".contact__phone").value;
	let token = getTokenFromCookie();
	orderData = {
		prime,
		order: {
			price,
			trip: {
				data,
			},
		},
		contact: {
			name,
			email,
			phone,
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
				hideLoadingStatus();
				location.href = `/thankyou?number=${res.data.number}`;
			}
			if (res.error === true) {
				console.log("失敗"); //todo
			}
		});
}

function showLoadingStatus() {
	const loading = document.querySelector(".loading");
	loading.style.display = "flex";
	loading.style.animation = "fadeIn 0.3s forwards";
}

function hideLoadingStatus() {
	const loading = document.querySelector(".loading");
	loading.style.animation = "fadeOut 0.3s forwards";
	setTimeout(() => {
		loading.removeAttribute = "style";
	}, 300);
}

/* 驗證是否有選擇行程 */
function examineOrder() {
	const confirm__fee = document.querySelector(".confirm__fee");
	fee = confirm__fee.textContent.indexOf("0");
	if (fee === 7) {
		const bookNotice = document.querySelector(".bookNotice");
		bookNotice.style.display = "flex";
		window.scrollTo({ top: 0, behavior: "smooth" });
		return false;
	} else {
		const bookNotice = document.querySelector(".bookNotice");
		bookNotice.removeAttribute("style");
		return true;
	}
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

/* 顯示卡片提示 */
function showMassage(messageContent, status) {
	const color = status ? "#4ad27a" : "#ff4949";

	const messageCard = document.querySelector(".messageCard");
	messageCard.textContent = messageContent;
	messageCard.style.background = color;
	messageCard.style.animation = "messageCardFadeIn 0.7s both";
	setTimeout(() => {
		messageCard.style.animation = "messageCardFadeOut 0.7s both";
	}, 1200);
}
