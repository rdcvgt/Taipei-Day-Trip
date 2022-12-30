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

/* 選單開闔 */
function toggleList(dateBar) {
	const currentDateBar = document.querySelector(`#${dateBar}`);

	const downArrow = document.querySelector(`#${dateBar}__downArrow`);
	const upArrow = document.querySelector(`#${dateBar}__upArrow`);
	toggleAll(currentDateBar);
	toggleAll(downArrow);
	toggleAll(upArrow);

	function toggleAll(id) {
		id.style.display = id.style.display === "none" ? "block" : "none";
	}
}

/* fetch 使用者即將到來的行程資*/
function fetchUserUpcomingBooking() {
	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();
	currentUrl = window.location.href.toString().split("=");
	orderId = currentUrl[1];
	fetch(`/api/history/upcoming`, {
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
			if (res.data && res.data.length !== 0) {
				createDateBar(res, "upcoming");
				const upcomingTrip__card = document.querySelector(
					".upcomingTrip__card"
				);
				upcomingTrip__card.style.display = "block";
				const noOrder = document.querySelector(
					".upcomingTrip__message"
				);
				noOrder.style.display = "none";
			}
		});
}
fetchUserUpcomingBooking();

/* fetch 使用者的歷史行程*/
function fetchUserPastBooking() {
	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();
	currentUrl = window.location.href.toString().split("=");
	orderId = currentUrl[1];
	fetch(`/api/history/past`, {
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
			if (res.data && res.data.length !== 0) {
				createDateBar(res, "past");
				const noOrder = document.querySelector(".pastTrip__message");
				noOrder.style.display = "none";
			}
		});
}
fetchUserPastBooking();

function changeToPastTrip() {
	const headline__upcoming = document.querySelector(".headline__upcoming");
	const headline__past = document.querySelector(".headline__past");
	const upcomingTrip = document.querySelector(".upcomingTrip");
	const pastTrip = document.querySelector(".pastTrip");

	headline__past.style.color = "#ffffff";
	headline__past.style.background = "#448899";
	headline__upcoming.style.color = "#757575";
	headline__upcoming.style.background = "#ffffff";

	pastTrip.style.display = "block";
	upcomingTrip.style.display = "none";
}

function changeToUpcomingTrip() {
	const headline__upcoming = document.querySelector(".headline__upcoming");
	const headline__past = document.querySelector(".headline__past");
	const upcomingTrip = document.querySelector(".upcomingTrip");
	const pastTrip = document.querySelector(".pastTrip");

	headline__past.removeAttribute("style");
	headline__upcoming.removeAttribute("style");
	upcomingTrip.removeAttribute("style");
	pastTrip.removeAttribute("style");
}

/* 載入行程的日期 bar */
async function createDateBar(res, orderStatus) {
	const upcomingTrip__card = document.querySelector(".upcomingTrip__card");
	const pastTrip__card = document.querySelector(".pastTrip__card");
	const card =
		orderStatus === "upcoming" ? upcomingTrip__card : pastTrip__card;

	await res.dates.forEach((date) => {
		tripCounts = 0;
		res.data.forEach((trip) => {
			if (trip.date === date) {
				tripCounts++;
			}
		});

		block = `
		<div class="dayBlock" id="${date}">
			<div class="dateBar" onclick="toggleList('tripAt${date}')">
				<div class="dateBar__info">
					<div class="dateBar__date bodyBold">${date}</div>
					<div class="dateBar__trip">${tripCounts} 筆行程</div>
				</div>
				<div class="dateBar__imgBox">
					<img
						style="display: block"
						class="dateBar__img downArrow"
						id = "tripAt${date}__downArrow"
						src="../static/Images/components/down-arrow.png"
					/>
					<img
						style="display: none"
						class="dateBar__img upArrow"
						id = "tripAt${date}__upArrow"
						src="../static/Images/components/up-arrow.png"
					/>
				</div>
			</div>
			<div style="display: none" class="dayTrip" id='tripAt${date}'>
				<section class="card-template template-${date}"></section>
			</div>
			
		</div>
		`;

		card.insertAdjacentHTML("beforeend", block);
	});

	createTripByDate(res);
}

/* 將使用者的行程按照日期載入個別日期的 bar */
function createTripByDate(res) {
	res.dates.forEach((date) => {
		const currentTripContainer = document.querySelector(`#tripAt${date}`);

		res.data.forEach((trip) => {
			if (trip.date === date) {
				const currentCardTemplate = document.querySelector(
					`.template-${date}`
				);
				preload = `
				<div class="dayTrip__container">
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
				currentCardTemplate.insertAdjacentHTML("beforeend", preload);

				time =
					trip.time === "morning"
						? "早上 9 點到下午 2 點"
						: "下午 2 點到晚上 7 點";

				tripBlock = `
				<div style='display:none' class="dayTrip__container cardTrip" >
					<div class="dayTrip__imgBox">
						<a class="dayTrip__imgAtt">
							<img
								class="dayTrip__img cardImg"
								src="${trip.attraction.image}"
							/>
						</a>
					</div>

					<div class="dayTrip__infoBox">
						<a
							class="dayTrip__info bodyBold"
							href="/attraction/${trip.attraction.id}"
						>
							<div class="dayTrip__name">
								${trip.attraction.name}
							</div>
						</a>
						<div class="dayTrip__info bodyBold">
							聯絡人：
							<div class="dayTrip__username bodyMedium">
								${trip.username}
							</div>
						</div>
						<div class="dayTrip__info bodyBold">
							時間：
							<div class="dayTrip__time bodyMedium">
								${time}
							</div>
						</div>
						<div class="dayTrip__info bodyBold">
							地點：
							<div class="dayTrip__address bodyMedium">
								${trip.attraction.address}
							</div>
						</div>
						<a class="confirmBtn backToOrder" href="/thankyou?number=${trip.orderId}">
							查看訂單資訊
						</a>
					</div>
				</div>
				`;

				currentTripContainer.insertAdjacentHTML("beforeend", tripBlock);
				currentTripContainer.style.display = "none";

				const cardImg = document.querySelector(".cardImg");
				const cardTrips = document.querySelectorAll(".cardTrip");
				cardImg.addEventListener("load", () => {
					currentCardTemplate.style.display = "none";
					cardTrips.forEach((cardTrip) => {
						cardTrip.removeAttribute("style");
					});
				});
			}
		});
	});
}
