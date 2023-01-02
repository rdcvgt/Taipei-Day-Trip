/* fetch景點分類 */
function fetchCategories() {
	fetch("/api/categories")
		.then((res) => res.json())
		.then((data) => loadCategories(data));
}
fetchCategories();

/* 載入景點分類，將景點分類文字呈現在搜尋欄位中 */
function loadCategories(data) {
	const cat = data.data;

	for (i = 0; i < cat.length; i++) {
		let str = `<div class="category__list categoryListMedium">${cat[i]}</div>`;
		document
			.querySelector(".category")
			.insertAdjacentHTML("beforeend", str);
	}

	const category = document.querySelector(".category");
	const search__bar = document.querySelector(".search__bar");

	category.addEventListener("click", (e) => {
		search__bar.value = e.target.innerText;
	});
}

/* 點擊後，拿到輸入欄位的 keyword進行判斷 */
let keyword = null;
const regex = /[%^&'',;=?$\x22]/;
function catchKeyword() {
	const search__bar = document.querySelector(".search__bar");
	const search__btn = document.querySelector(".search__btn");

	search__btn.addEventListener("click", (e) => {
		keyword = search__bar.value;
		nowPageNum = 0; //全域變數，隨頁尾滾動而增加，點擊後歸零計算
		if (regex.test(keyword) || keyword === "") {
			cleanNode();
			showEndMessage(`找不到與「${keyword}」相關的景點`);
			return;
		}
		fetchKeyword1stPage();
	});
}
catchKeyword();

/* search keyword fetch 第一頁資料 */
function fetchKeyword1stPage() {
	fetch(`/api/attractions?page=0&keyword=${keyword}`)
		.then((res) => res.json())
		.then((data) => {
			cleanNode();
			if (data.error === true) {
				showEndMessage(`找不到與「${keyword}」相關的景點`);
				return;
			}
			loadAttractions(data);
		})
		.catch((err) => showEndMessage(`找不到與「${keyword}」相關的景點`));
}

/* 用來清除景點資料與頁尾的函式 */
function cleanNode() {
	const att = document.querySelector(".att");
	const endMessage = document.querySelector(".endMessage");
	const endAtt = document.querySelector(".endAtt");

	while (att.firstChild) {
		att.removeChild(att.firstChild);
	}
	if (endAtt) {
		endMessage.removeChild(endAtt);
	}
}

/* 首頁載入總景點的第一頁資料  */
function fetchFirstPageData() {
	fetch(`/api/attractions?page=0`)
		.then((res) => res.json())
		.then((data) => loadAttractions(data));
}
fetchFirstPageData();

/* 將 data 新增至 html，並判斷是否還有下一頁 */
function loadAttractions(data) {
	let attArray = data.data;
	let str = ``;

	//載入 preload
	const att = document.querySelector(".att");
	for (i = 0; i < attArray.length; i++) {
		str = `
		<a class="att__container card-template">
			<div class="att__topInfo">
				<img class="att__Img skeleton">
				<div class="att__nameArea skeleton-edit">
					<div class="att__name skeleton skeleton-text"></div>
				</div>
			</div>
			<div class="att__btmInfo">
				<div class="att__trans skeleton skeleton-text"></div>
				<div class="att__category skeleton skeleton-text"></div>
			</div>
		</a>
		`;
		att.insertAdjacentHTML("beforeend", str);
	}

	//載入頁面 data
	let isLoaded = 0;
	for (i = 0; i < attArray.length; i++) {
		mrt = attArray[i].mrt;
		if (mrt === null) {
			mrt = "無捷運站";
		}
		str = `
		<a class="att__container card" href="/attraction/${attArray[i].id}">
			<div class="att__topInfo">
				<img class="att__Img img${attArray[i].id}" src="${attArray[i].images[0]}" alt="景點照片">
				<div class="att__nameArea">
					<div class="att__name bodyBold">${attArray[i].name}</div>
				</div>
			</div>
			<div class="att__btmInfo bodyMedium">
				<div class="att__trans">${mrt}</div>
				<div class="att__category">${attArray[i].category}</div>
			</div>
		</a>
		`;
		att.insertAdjacentHTML("beforeend", str);

		//判斷當前景點照片是否載入完成
		const currentImg = document.querySelector(`.img${attArray[i].id}`);
		currentImg.addEventListener("load", () => {
			isLoaded++; //載入完成則 isLoaded+1

			//如果載入次數等於目前 data 景點的資料量
			if (isLoaded === attArray.length) {
				//移除所有當前的 preload
				const cardTemplates =
					document.querySelectorAll(`.card-template`);
				cardTemplates.forEach((cardTemplate) => {
					cardTemplate.remove();
				});

				//顯示當前所有載入完成的景點
				const cards = document.querySelectorAll(`.card`);
				cards.forEach((card) => {
					card.style.display = "grid";
				});
				scrollDown();
			}
		});
	}

	let nextpage = data.nextpage;
	if (nextpage === null) {
		showEndMessage("已經沒有更多景點囉！");
		return;
	}
}

/* 判斷是否已到頁尾 */
let nowPageNum = 0;
function scrollDown() {
	const footer = document.querySelector(".footer");
	let observer = new IntersectionObserver((entry) => {
		let footerRatio = entry[0].intersectionRatio;
		let isLoading = document.readyState;

		if (footerRatio && isLoading === "complete") {
			nowPageNum++;
			fetchAttApi(nowPageNum);
			observer.unobserve(footer);
		}
	});
	observer.observe(footer);
}

/* 以是否有 keyword 來決定要 fetch 的網址 */
function fetchAttApi(pageNum) {
	url = `/api/attractions?page=${pageNum}`;
	if (keyword) {
		url += `&keyword=${keyword}`;
	}

	fetch(url)
		.then((res) => res.json())
		.then((data) => {
			if (data.error === true) return;
			loadAttractions(data);
		});
}

/* 頁尾訊息 */
function showEndMessage(message) {
	const endMessage = document.querySelector(".endMessage");
	let str = `<div class="endAtt contentBold">${message}</div>`;
	endMessage.insertAdjacentHTML("beforeend", str);
}
