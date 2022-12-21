/* fetch 景點資料 */
function fetchAttApi() {
	currentUrlArr = window.location.href.toString().split("/");
	attId = currentUrlArr[4];
	url = `/api/attraction/${attId}`;
	fetch(url)
		.then((res) => res.json())
		.then((data) => {
			loadSection(data.data);
			loadInfo(data.data);
			loadImg(data.data);
		});
}
fetchAttApi();

/* section 中的景點資訊 */
function loadSection(data) {
	const book = document.querySelector(".book");
	//分類與捷運
	mrt = " at " + data.mrt;
	if (data.mrt === null) {
		mrt = "";
	}
	attCat = data.category + mrt;
	attCatStr = `<div class="book__attCat bodyMedium">${attCat}</div>`;
	book.insertAdjacentHTML("afterbegin", attCatStr);
	//景點名稱
	attName = data.name;
	document.title = `${attName} - 臺北一日遊`;
	attNameStr = `<div class="book__attName dialogTitleBold">${attName}</div>`;
	book.insertAdjacentHTML("afterbegin", attNameStr);
}

/* info 中的景點資訊 */
function loadInfo(data) {
	//敘述
	const info__container = document.querySelector(".info__container");
	contentStr = `<p class="info__content contentRegular">${data.description}</p>`;
	info__container.insertAdjacentHTML("afterbegin", contentStr);

	//地址
	const address = document.querySelector(".address");
	addressStr = `<div class="contentRegular">${data.address}</div>`;
	address.insertAdjacentHTML("beforeend", addressStr);

	//交通
	const trans = document.querySelector(".trans");
	transStr = `<div class="contentRegular">${data.direction}</div>`;
	trans.insertAdjacentHTML("beforeend", transStr);

	//preload 切換
	const card = document.querySelector(".card");
	const cardTemplate = document.querySelector(".card-template");
	setTimeout(() => {
		card.style.display = "flex";
		cardTemplate.style.display = "none";
	}, 500);
}

/* 處理景點照片 */
function loadImg(data) {
	const imgArr = data.images;
	const img__bar = document.querySelector(".img__bar");
	const img__dot = document.querySelector(".img__dot");
	const loading = document.querySelector(".loading");
	const loading__progress = document.querySelector(".loading__progress");
	loading__progress.textContent = "0%";

	//處理輪播下方的 dot
	for (i = 0; i < imgArr.length; i++) {
		imgDotStr = `<input class="dot dot${i}" type="radio" name="imgDot">`;
		img__dot.insertAdjacentHTML("beforeend", imgDotStr);
	}

	//計算每個景點的一張照片佔總體的比例
	let percent = parseFloat((100 / parseInt(imgArr.length)).toFixed(1));
	let upTo = 0;
	let nowLoadingLimit = 0;
	for (i = 0; i < imgArr.length; i++) {
		//處理照片
		imgStr = `<img class="img__att img${[i]}" src="${imgArr[i]}">`;
		img__bar.insertAdjacentHTML("beforeend", imgStr);

		//當前照片載入完成時，增加 loading 值
		//當 loading 爲 100% 時，將 loading 畫面移除
		const currentImg = document.querySelector(`.img${[i]}`);
		currentImg.addEventListener("load", () => {
			nowLoadingLimit += percent;
			while (upTo < nowLoadingLimit) {
				loading__progress.textContent = (upTo += 1) + "%";
				if (upTo === 100) {
					loading.style.animation = "fadeOut 1s forwards";
					setTimeout(() => {
						loading.remove();
					}, 1000);
					break;
				}
			}
		});
	}

	let lastDot = imgArr.length - 1;
	moveSideBar(lastDot);
	clickImgDot();
}

/* 點擊左右鍵切換圖片 */
function moveSideBar(lastDot) {
	const leftBtn = document.querySelector(".leftBtn");
	const rightBtn = document.querySelector(".rightBtn");
	const img__bar = document.querySelector(".img__bar");

	clickTime = 0;
	imgDotHint(clickTime); //顯示底下的 dot

	//點擊左鍵
	leftBtn.addEventListener("click", () => {
		clickTime--;
		//當 clickTime < 0代表所展示圖片爲最左邊
		if (clickTime < 0) {
			img__bar.style.transform += "translateX(" + -100 * lastDot + "%)";
			clickTime = lastDot;
			imgDotHint(clickTime);
			return;
		}
		img__bar.style.transform += "translateX(" + 100 + "%)";
		imgDotHint(clickTime);

		//清空目前累積的 style
		if (clickTime === 0) {
			img__bar.style.transform = null;
		}
	});

	//點擊右鍵
	rightBtn.addEventListener("click", () => {
		clickTime++;
		//當 clickTime > 3代表所展示圖片爲最右邊
		if (clickTime > lastDot) {
			img__bar.style.transform += "translateX(" + 100 * lastDot + "%)";
			clickTime = 0;
			img__bar.style.transform = null;
			imgDotHint(clickTime);
			return;
		}
		img__bar.style.transform += "translateX(" + -100 + "%)";
		imgDotHint(clickTime);
	});
}

/* 根據目前 clickTime 來決定 dot.checked 的對象 */
function imgDotHint(clickTime) {
	const img__btn = document.querySelector(".img__btn");
	let dot = `.dot${clickTime}`;
	let imgPicked = document.querySelector(dot);
	// checked 首頁載入第一張圖片
	imgPicked.checked = true;

	img__btn.addEventListener("click", () => {
		imgPicked.checked = true;
	});
}

/* 點擊 dot 也能切換圖片 */
function clickImgDot() {
	const img__dot = document.querySelector(".img__dot");
	const img__bar = document.querySelector(".img__bar");
	img__dot.addEventListener("click", (e) => {
		cutString = e.target.className.split("dot");
		dotNum = parseInt(cutString[2]);
		img__bar.style.transform = "translateX(" + -100 * dotNum + "%)";
		clickTime = dotNum;
	});
}

/* 不能選擇今天之前的日期 */
function limitDate() {
	let today = new Date();
	let yyyy = today.getFullYear();
	let mm = today.getMonth() + 1; //月份是 0-11
	let dd = today.getDate();
	today = yyyy + "-" + mm + "-" + dd;

	const book__dateInput = document.querySelector(".book__dateInput");
	book__dateInput.min = today;
}
limitDate();

/* 切換導覽時間，改變價錢 */
function changeTourTime() {
	const book__morning = document.querySelector(".book__morning");
	const book__afternoon = document.querySelector(".book__afternoon");
	const book__feeNtd = document.querySelector(".book__feeNtd");

	book__morning.addEventListener("click", () => {
		book__feeNtd.textContent = "新臺幣 2000 元";
	});

	book__afternoon.addEventListener("click", () => {
		book__feeNtd.textContent = "新臺幣 2500 元";
	});
}
changeTourTime();

/* 送出表單資訊 */
function bookingTrip() {
	const confirmBtn = document.querySelector(".confirmBtn");

	confirmBtn.addEventListener("click", (e) => {
		e.preventDefault();
		removeMessage();

		let token = document.cookie.split("=")[1];
		if (token === undefined || token === "") {
			str = `<div class="message error">抱歉！請先登入，再開始預約行程</div>`;
			confirmBtn.insertAdjacentHTML("beforeBegin", str);
			showLoginBox();
			return;
		}

		attractionId = parseInt(window.location.href.split("/")[4]);
		//確認使用者已選擇日期
		const book__dateInput = document.querySelector(".book__dateInput");
		date = book__dateInput.value;
		if (date === "") {
			str = `<div class="message error">尚未選擇日期</div>`;
			confirmBtn.insertAdjacentHTML("beforeBegin", str);
			book__dateInput.style.border = "2px solid #d20000";
			return;
		}

		let time = document.querySelector(
			"input[name=radioBtnBox]:checked"
		).value;
		let price = "";
		if (time === "morning") {
			price = 2000;
		} else if (time === "afternoon") {
			price = 2500;
		}

		data = { attractionId, date, time, price };

		let userInfo = JSON.parse(sessionStorage.user);
		fetch("/api/booking", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${token}`,
				userId: `${userInfo.id}`,
			},
			body: JSON.stringify(data),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.ok === true) {
					str = `<div class="message success">${res.message}</div>`;
					confirmBtn.insertAdjacentHTML("beforeBegin", str);
					setTimeout(() => {
						window.location.href = "/booking";
					}, "2000");
				}
				if (res.error === true) {
					str = `<div class="message error">${res.message}</div>`;
					confirmBtn.insertAdjacentHTML("beforeBegin", str);
				}
			});
	});
}
bookingTrip();

function removeMessage() {
	let message = document.querySelector(".message");
	if (message === null) return;
	if (message.parentNode) {
		message.parentNode.removeChild(message);
	}
	const book__dateInput = document.querySelector(".book__dateInput");
	book__dateInput.style.border = "none";
}
