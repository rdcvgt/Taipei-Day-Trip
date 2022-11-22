/*  點擊登入按鈕 */
const boxBG = document.querySelector('.boxBG')
const boxContainer = document.querySelector('.boxContainer')

document.querySelector('.navLoginBtn').addEventListener('click', () => {
	boxBG.style.display = 'block'

})

function closeBox() {
	boxBG.style.display = 'none'
}


/* 載入輸入欄位景點分類 */
fetch('/api/categories')
	.then((res) => res.json())
	.then(data => loadCategories(data))

function loadCategories(data) {
	const cat = data.data

	for (i = 0; i < cat.length; i++) {
		let str = `<div class="list categoryListMedium">${cat[i]}</div>`
		document.querySelector('.categoryList').insertAdjacentHTML("beforeend", str)
	}
}

/* 將景點分類文字呈現在搜尋欄位中 */
function clickList() {
	document.querySelector('.categoryList').addEventListener('click', (e) => {
		document.querySelector('.searchBar').value = e.target.innerText
	})
}
clickList()

/* 清除網頁中的景點資料 */
function cleanNode() {
	const attractionGroup = document.querySelector('.attractionGroup')
	const endMessage = document.querySelector('.endMessage')
	const endAtt = document.querySelector('.endAtt')
	while (attractionGroup.firstChild) {
		attractionGroup.removeChild(attractionGroup.firstChild);
	}
	if (endAtt) {
		endMessage.removeChild(endAtt);
	}
}


/* 點擊搜尋，利用關鍵字去抓資料 */
let keyword = null
const regex = /[%^&'',;=?$\x22]/
function getKeyword(pageNum) {
	const searchBar = document.querySelector('.searchBar')
	const searchBtn = document.querySelector('.searchBtn')

	searchBtn.addEventListener('click', (e) => {
		keywordPageNum = 0
		console.log(keywordPageNum)
		keyword = searchBar.value
		if (regex.test(keyword) || keyword === "") {
			cleanNode()
			showEndMessage(`找不到與「${keyword}」相關的景點`)
		} else {
			fetch(`/api/attractions?page=${pageNum}&keyword=${keyword}`)
				.then(res => res.json())
				.then(data => attClean(data, keyword))
		}
	})
}
getKeyword(pageNum = 0)


/* 清除原有景點，再載入資料 */
function attClean(data, keyword) {
	cleanNode()
	if (data.error === true) {
		showEndMessage(`找不到與「${keyword}」相關的景點`)
		return
	} else {
		loadAttractions(data)
	}
}

/* 載入首頁 */
window.addEventListener("load", () => {
	fetch(`/api/attractions?page=0`)
		.then((res) => res.json())
		.then(data => loadAttractions(data))

});

/* 抓取 page 的資料 */
function pageAttractions(pageNumber) {
	//如果沒有 keyword 才以 page 搜尋
	fetch(`/api/attractions?page=${pageNumber}`)
		.then((res) => res.json())
		.then(data => {
			if (data.error === true) { return }
			loadAttractions(data)
		})
}

/* 抓取 keyword 的資料 */
function keywordAttractions(keywordPageNum) {
	//如果有 keyword
	fetch(`/api/attractions?page=${keywordPageNum}&keyword=${keyword}`)
		.then((res) => res.json())
		.then(data => {
			if (data.error === true) { return }
			loadAttractions(data)
		})
}

/* 載入抓取到的資料 */
function loadAttractions(data) {

	attArray = data.data
	if (attArray === undefined) { return }
	str = ``
	attractionGroup = document.querySelector('.attractionGroup')
	for (i = 0; i < attArray.length; i++) {
		str = `
		<div class="attContainer">
			<div class="attMain">
				<img class="attImg " src="${attArray[i].images[0]}" alt="景點照片">
				<div class="attNameArea">
					<div class="attName bodyBold">${attArray[i].name}</div>
				</div>
			</div>
			<div class="attInfo bodyMedium">
				<div class="attInfoTrans">${attArray[i].mrt}</div>
				<div class="attInfoCat">${attArray[i].category}</div>
			</div>
		</div>
		`

		attractionGroup.insertAdjacentHTML("beforeend", str)

	}
	let nextpage = data.nextpage
	console.log('nextpage', nextpage)
	if (nextpage === null) {
		showEndMessage('已經沒有更多景點囉！')
		return
	} else {
		scrollDown()
	}
}

/* 判斷是否已到頁尾 */
let pageNumber = 0
let keywordPageNum = 0
function scrollDown() {
	let observer = new IntersectionObserver((entry) => {
		//以是否有 keyword 作爲判斷
		if (keyword && entry[0].intersectionRatio && document.readyState === 'complete'
		) {
			console.log('hello')
			keywordPageNum++
			keywordAttractions(keywordPageNum)
			observer.unobserve(
				document.querySelector('.footer')
			);
		} else if (!keyword && entry[0].intersectionRatio && document.readyState === 'complete'
		) {
			pageNumber++
			pageAttractions(pageNumber)
			observer.unobserve( //呼叫函式後就停止觀察，避免頁面滾動重複載入
				document.querySelector('.footer')
			);
		}
	});
	observer.observe(document.querySelector('.footer'))
}


/* 頁尾訊息 */
function showEndMessage(message) {
	const endMessage = document.querySelector('.endMessage')
	let str = `<div class="endAtt contentBold">${message}</div>`
	endMessage.insertAdjacentHTML("beforeend", str)
}