/* fetch 景點資料 */
function fetchAttApi() {
	currentUrlArr = window.location.href.toString().split('/')
	attId = currentUrlArr[4]
	url = `/api/attraction/${attId}`
	fetch(url)
		.then(res => res.json())
		.then(data => {
			loadSection(data.data)
			loadInfo(data.data)
			loadImg(data.data)
		})
}
fetchAttApi()

/* section 中的景點資訊 */
function loadSection(data) {
	const bookingBox = document.querySelector('.bookingBox')
	//分類與捷運
	mrt = " at " + data.mrt
	if (data.mrt === null) {
		mrt = ""
	}
	attCat = data.category + mrt
	attCatStr = `<div class="attCat bodyMedium">${attCat}</div>`
	bookingBox.insertAdjacentHTML("afterbegin", attCatStr)
	//景點名稱
	attName = data.name
	attNameStr = `<div class="attName dialogTitleBold">${attName}</div>`
	bookingBox.insertAdjacentHTML("afterbegin", attNameStr)
}

/* info 中的景點資訊 */
function loadInfo(data) {
	//敘述
	const infoContainer = document.querySelector('.infoContainer')
	contentStr = `<p class="content contentRegular">${data.description}</p>`
	infoContainer.insertAdjacentHTML("afterbegin", contentStr)

	//地址
	const address = document.querySelector('.address')
	addressStr = `<div class="contentRegular">${data.address}</div>`
	address.insertAdjacentHTML("beforeend", addressStr)

	//交通
	const trans = document.querySelector('.trans')
	transStr = `<div class="contentRegular">${data.direction}</div>`
	trans.insertAdjacentHTML("beforeend", transStr)
}

/* 處理景點照片 */
function loadImg(data) {
	const imgArr = data.images
	const imgBar = document.querySelector('.imgBar')
	const imgDot = document.querySelector('.imgDot')

	for (i = 0; i < imgArr.length; i++) {
		//處理照片
		imgStr = `<img class="attImg" src="${imgArr[i]}">`
		imgBar.insertAdjacentHTML("beforeend", imgStr)

		//處理輪播下方的 dot 
		imgDotStr = `<input class="dot dot${i}" type="radio" name="imgDot">`
		imgDot.insertAdjacentHTML("beforeend", imgDotStr)
	}

	let lastDot = imgArr.length - 1
	moveSideBar(lastDot)
	clickImgDot()
}


/* 點擊左右鍵切換圖片 */
function moveSideBar(lastDot) {
	const leftBtn = document.querySelector('.leftBtn')
	const rightBtn = document.querySelector('.rightBtn')
	const imgBar = document.querySelector('.imgBar')

	clickTime = 0
	imgDotHint(clickTime) //顯示底下的 dot 

	//點擊左鍵
	leftBtn.addEventListener('click', () => {
		clickTime--
		//當 clickTime < 0代表所展示圖片爲最左邊
		if (clickTime < 0) {
			imgBar.style.transform += "translateX(" + (-100 * lastDot) + "%)";
			clickTime = lastDot
			imgDotHint(clickTime)
			return
		}
		imgBar.style.transform += "translateX(" + (100) + "%)";
		imgDotHint(clickTime)

		//清空目前累積的 style
		if (clickTime === 0) {
			imgBar.style.transform = null;
		}
	})

	//點擊右鍵
	rightBtn.addEventListener('click', () => {
		clickTime++
		//當 clickTime > 3代表所展示圖片爲最右邊
		if (clickTime > lastDot) {
			imgBar.style.transform += "translateX(" + (100 * lastDot) + "%)";
			clickTime = 0
			imgBar.style.transform = null;
			imgDotHint(clickTime)
			return
		}
		imgBar.style.transform += "translateX(" + (-100) + "%)";
		imgDotHint(clickTime)
	})
}

/* 根據目前 clickTime 來決定 dot.checked 的對象 */
function imgDotHint(clickTime) {
	const imgBar = document.querySelector('.imgBtn')
	let dot = `.dot${clickTime}`
	let imgPicked = document.querySelector(dot)
	// checked 首頁載入第一張圖片
	imgPicked.checked = true

	imgBar.addEventListener('click', () => {
		imgPicked.checked = true
	})
}

/* 點擊 dot 也能切換圖片 */
function clickImgDot() {
	const imgDot = document.querySelector('.imgDot')
	const imgBar = document.querySelector('.imgBar')
	imgDot.addEventListener('click', (e) => {
		cutString = e.target.className.split('dot')
		dotNum = parseInt(cutString[2])
		imgBar.style.transform = "translateX(" + (-100 * dotNum) + "%)"
		clickTime = dotNum
	})
}

/* 不能選擇今天之前的日期 */
function limitDate() {
	let today = new Date()
	let yyyy = today.getFullYear()
	let mm = today.getMonth() + 1  //月份是 0-11
	let dd = today.getDate()
	today = yyyy + "-" + mm + "-" + dd

	const bookDateSelector = document.querySelector('.bookDateSelector')
	bookDateSelector.min = today
}
limitDate()



/* 切換導覽時間，改變價錢 */
function changeTourTime() {
	const bookMorning = document.querySelector('.bookMorning')
	const bookAfternoon = document.querySelector('.bookAfternoon')
	const bookFeeNtd = document.querySelector('.bookFeeNtd')

	bookMorning.addEventListener('click', () => {
		bookFeeNtd.textContent = "新臺幣 2000 元"
	})

	bookAfternoon.addEventListener('click', () => {
		bookFeeNtd.textContent = "新臺幣 2500 元"
	})
}
changeTourTime()