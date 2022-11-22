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

const categoryList = document.querySelector('.categoryList')
function loadCategories(data) {
	const cat = data.data

	for (i = 0; i < cat.length; i++) {
		let list = document.createElement('div')
		list.classList.add('list', 'categoryListMedium')
		list.innerText = cat[i]
		categoryList.appendChild(list)
	}
}

/* 將景點分類文字呈現在搜尋欄位中 */
function clickList() {
	document.querySelector('.categoryList').addEventListener('click', (e) => {
		document.querySelector('.searchBar').value = e.target.innerText
	})
}
clickList()

/* 利用關鍵字去 fetch 資料 */
let keyword = ""//防止搜尋關鍵字時，pages 的資料再載入
const regex = /[%^&'',;=?$\x22]/
function getKeyword(pageNum) {
	const searchBar = document.querySelector('.searchBar')
	const searchBtn = document.querySelector('.searchBtn')

	searchBtn.addEventListener('click', (e) => {
		keyword = searchBar.value
		if (regex.test(keyword)) {
			document.querySelector('.attractionGroup').innerHTML = ''
			document.querySelector('.endMessage').innerHTML = ''
			showEndMessage(`找不到與「${keyword}」相關的景點`)
		} else {
			fetch(`/api/attractions?page=${pageNum}&keyword=${keyword}`)
				.then(res => res.json())
				.then(data => attClean(data, keyword))
		}
	})
}
getKeyword(pageNum = 0)


/* 清除原有景點再載入 */
function attClean(data, keyword) {
	document.querySelector('.attractionGroup').innerHTML = ''
	document.querySelector('.endMessage').innerHTML = ''

	if (data.error === true) {
		showEndMessage(`找不到與「${keyword}」相關的景點`)
		return
	}
	loadAttractions(data)
}

/* 載入 page 的資料 */
function loadAttractions(data) {
	attArray = data.data
	str = ``
	for (i = 0; i < attArray.length; i++) {
		str += `
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
	}
	document.querySelector('.attractionGroup').innerHTML += str

	let nextpage = data.nextpage
	if (nextpage !== null) {
		scrollDown(data.nextpage)
	} else (
		showEndMessage('已經沒有更多景點囉！')
	)

}

/* 判斷是否已到頁尾 */
function scrollDown(pageNum) {
	let observer = new IntersectionObserver((entry) => {

		if (entry[0].intersectionRatio && document.readyState === 'complete'
		) {
			PageAttractions(pageNum)
			//呼叫函式後就停止觀察，避免重複載入
			observer.unobserve(
				document.querySelector('.footer')
			);
		}
	});
	observer.observe(document.querySelector('.footer'))
}


/* 抓取 page 的資料 */
function PageAttractions(pageNum = 0) {
	//如果沒有 keyword 才以 page 搜尋
	if (!keyword) {
		fetch(`/api/attractions?page=${pageNum}`)
			.then((res) => res.json())
			.then(data => loadAttractions(data))

	} else {
		fetch(`/api/attractions?page=${pageNum}&keyword=${keyword}`)
			.then((res) => res.json())
			.then(data => loadAttractions(data))
	}

}
//首頁預設爲 0
window.addEventListener("load", () => {
	PageAttractions(0)
});

/* 頁尾訊息 */
function showEndMessage(message) {
	const endMessage = document.querySelector('.endMessage')
	let endAtt = document.createElement('div')
	endAtt.innerText = message
	endAtt.classList.add('endAtt', 'contentBold')
	endMessage.appendChild(endAtt)
}