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
keywordSearched = 0 //防止搜尋關鍵字時，pages 的資料再載入
function keyword(pageNum) {
	const searchBar = document.querySelector('.searchBar')
	const searchBtn = document.querySelector('.searchBtn')

	searchBtn.addEventListener('click', (e) => {
		keywordSearched++
		keyword = searchBar.value
		fetch(`/api/attractions?page=${pageNum}&keyword=${keyword}`)
			.then(res => res.json())
			.then(data => attClean(data))
	})
}
keyword(pageNum = 0)


/* 清除原有景點再載入 */
function attClean(data) {
	document.querySelector('.attractionGroup').innerHTML = ''
	document.querySelector('.endMessage').innerHTML = ''
	if (data.error === true) {
		loadMoreAtt(null)
		return
	}
	loadAttractions(data)

}

/* 顯示 page 0 的資料 */
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
		loadMoreAtt(null) //沒有下一頁
	)

}

/* 判斷是否已到頁尾 */
function scrollDown(pageNum) {
	let observer = new IntersectionObserver((entry) => {
		if (pageNum === null) {
			loadMoreAtt(null)
			observer.unobserve(
				document.querySelector('.footer')
			);
			return
		}

		//如果有下一頁而且已經抵達頁尾
		if (pageNum !== null && entry[0].intersectionRatio
			&& keywordSearched === 0 && document.readyState === 'complete'
		) {
			loadMoreAtt(pageNum)
			//呼叫函式後就停止觀察，避免重複載入
			observer.unobserve(
				document.querySelector('.footer')
			);
		}

	});

	if (pageNum !== null) {
		observer.observe(document.querySelector('.footer'))
	}


}

/* 載入下一頁資訊 */
function loadMoreAtt(pageNum) {
	if (pageNum === null) {
		const endMessage = document.querySelector('.endMessage')
		let endAtt = document.createElement('div')
		endAtt.innerText = '已經沒有更多景點囉！'
		endAtt.classList.add('endAtt', 'contentBold')
		endMessage.appendChild(endAtt)
		return
	}

	if (pageNum !== null) {
		//抓取 page 的資料
		PageAttractions(pageNum)
	}

}

/* 抓取 page 的資料 */
function PageAttractions(pageNum) {
	fetch(`/api/attractions?page=${pageNum}`)
		.then((res) => res.json())
		.then(data => loadAttractions(data))
}
//首頁預設爲 0
window.addEventListener("load", () => {
	PageAttractions(pageNum = 0)
});