/* fetch景點分類 */
function fetchCategories() {
	fetch('/api/categories')
		.then((res) => res.json())
		.then(data => loadCategories(data))
}
fetchCategories()

/* 載入景點分類 */
function loadCategories(data) {
	const cat = data.data

	for (i = 0; i < cat.length; i++) {
		let str = `<div class="list categoryListMedium">${cat[i]}</div>`
		document.querySelector('.categoryList').insertAdjacentHTML("beforeend", str)
	}
	clickListText()
}

/* 將景點分類文字呈現在搜尋欄位中 */
function clickListText() {
	const categoryList = document.querySelector('.categoryList')
	const searchBar = document.querySelector('.searchBar')

	categoryList.addEventListener('click', (e) => {
		searchBar.value = e.target.innerText
	})
}

/* 點擊後，拿到輸入欄位的 keyword進行判斷 */
let keyword = null
const regex = /[%^&'',;=?$\x22]/
function catchKeyword() {
	const searchBar = document.querySelector('.searchBar')
	const searchBtn = document.querySelector('.searchBtn')

	searchBtn.addEventListener('click', (e) => {
		keyword = searchBar.value
		nowPageNum = 0  //全域變數，隨頁尾滾動而增加，點擊後歸零計算
		if (regex.test(keyword) || keyword === "") {
			cleanNode()
			showEndMessage(`找不到與「${keyword}」相關的景點`)
			return
		}
		fetchKeyword1stPage()
	})
}
catchKeyword()

/* fetch keyword 第一頁資料 */
function fetchKeyword1stPage() {
	fetch(`/api/attractions?page=0&keyword=${keyword}`)
		.then(res => res.json())
		.then(data => {
			cleanNode()
			if (data.error === true) {
				showEndMessage(`找不到與「${keyword}」相關的景點`)
				return
			}
			loadAttractions(data)
		})
		.catch(err => showEndMessage(`找不到與「${keyword}」相關的景點`))
}

/* 用來清除景點資料與頁尾的函式 */
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

/* 首頁載入總景點的第一頁資料  */
window.addEventListener("load", () => {
	fetch(`/api/attractions?page=0`)
		.then((res) => res.json())
		.then(data => loadAttractions(data))
});

/* 將 data 新增至 html，並判斷是否還有下一頁 */
function loadAttractions(data) {
	let attArray = data.data
	let str = ``
	const attractionGroup = document.querySelector('.attractionGroup')

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
	if (nextpage === null) {
		showEndMessage('已經沒有更多景點囉！')
		return
	}
	scrollDown()
}

/* 判斷是否已到頁尾 */
let nowPageNum = 0
function scrollDown() {
	const footer = document.querySelector('.footer')
	let observer = new IntersectionObserver((entry) => {
		let footerRatio = entry[0].intersectionRatio
		let isLoading = document.readyState

		if (footerRatio && isLoading === 'complete'
		) {
			nowPageNum++
			fetchAttApi(nowPageNum)
			observer.unobserve(footer);
		}
	});
	observer.observe(footer)
}

/* 以是否有 keyword 來決定要 fetch 的網址 */
function fetchAttApi(pageNum) {
	url = `/api/attractions?page=${pageNum}`
	if (keyword) {
		url += `&keyword=${keyword}`
	}

	fetch(url)
		.then((res) => res.json())
		.then(data => {
			if (data.error === true) return
			loadAttractions(data)
		})
}

/* 頁尾訊息 */
function showEndMessage(message) {
	const endMessage = document.querySelector('.endMessage')
	let str = `<div class="endAtt contentBold">${message}</div>`
	endMessage.insertAdjacentHTML("beforeend", str)
}