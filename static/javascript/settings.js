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

/* fetch 使用者資料 */
function fetchUserData() {
	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();

	fetch("/api/settings", {
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
			if (res.data) {
				showUserData(res.data);
				cancelEditUserData(res.data);
			}
		});
}
fetchUserData();

function showUserData(data) {
	const contact__name = document.querySelector(".contact__name");
	const contact__email = document.querySelector(".contact__email");
	const contact__phone = document.querySelector(".contact__phone");
	const contact__photo = document.querySelector(".contact__photo");

	contact__name.value = data.name;
	contact__email.value = data.email;
	contact__phone.value = data.phone;
	contact__photo.src =
		data.photo !== null
			? `../static/Images/user_photo/${data.photo}`
			: `../static/Images/components/user.png`;
}

function cancelEditUserData(data) {
	const contact__name = document.querySelector(".contact__name");
	const contact__email = document.querySelector(".contact__email");
	const contact__phone = document.querySelector(".contact__phone");
	const cancel = document.querySelector(".cancel");

	cancel.addEventListener("click", () => {
		contact__name.value = data.name;
		contact__email.value = data.email;
		contact__phone.value = data.phone;
		showMassage("已恢復編輯前的資料", true);
	});
}

/* 使用者上傳照片 */
function uploadPhoto() {
	const contact__upload = document.querySelector(".contact__upload");
	const contact__photo = document.querySelector(".contact__photo");
	contact__upload.click();

	contact__upload.addEventListener("change", (e) => {
		let userPhoto = e.target.files;
		photoURL = window.URL.createObjectURL(userPhoto[0]);
		contact__photo.src = photoURL;

		let formData = new FormData();
		formData.append("photo", userPhoto[0]);
		savePhotoURL(formData);
	});

	function savePhotoURL(formData) {
		let userInfo = JSON.parse(sessionStorage.user);
		let token = getTokenFromCookie();
		fetch("/api/settings", {
			method: "POST",
			headers: {
				authorization: `Bearer ${token}`,
				userId: `${userInfo.id}`,
			},
			body: formData,
		})
			.then((res) => res.json())
			.then((res) => {
				showMassage("照片更換成功", true);
				//登入驗證失敗導回首頁
				if (res.error === true) {
					showMassage(res.message, false);
					return;
				}
			});
	}
}

/* 點擊刪除照片 */
function deletePhoto() {
	//先確認目前預覽照面是否爲預設圖片，若爲預設圖片則 return
	const contact__photo = document.querySelector(".contact__photo");
	defaultPhoto = "components/user.png";
	if (/user.png/.test(contact__photo.src)) {
		showMassage("目前沒有可刪除的照片", false);
		return;
	}

	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();
	fetch("/api/settings", {
		method: "DELETE",
		headers: {
			authorization: `Bearer ${token}`,
			userId: `${userInfo.id}`,
		},
	})
		.then((res) => res.json())
		.then((res) => {
			//確定刪除後換回預設圖片
			if (res.ok === true) {
				contact__photo.src = `../static/Images/components/user.png`;
				showMassage("照片刪除成功", true);
			}
			if (res.error === true) {
				showMassage(res.message, false);
				return;
			}
		});
}

/* 驗證頁面中所有 input */
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
	const save = document.querySelector(".save");
	save.addEventListener("click", () => {
		let userName = examineName(contact__name);
		let email = examineEmail(contact__email);
		let phone = examinePhone(contact__phone);

		if (userName && email && phone) {
			updateUserData();
		}
	});
}
examineAllInput();

/* 更新資料 */
function updateUserData() {
	const name = document.querySelector(".contact__name").value;
	const email = document.querySelector(".contact__email").value;
	const phoneValue = document.querySelector(".contact__phone").value;
	const phone = phoneValue === "" ? null : phoneValue;

	data = { name, email, phone };
	let userInfo = JSON.parse(sessionStorage.user);
	let token = getTokenFromCookie();
	fetch("/api/settings", {
		method: "PUT",
		headers: {
			authorization: `Bearer ${token}`,
			userId: `${userInfo.id}`,
			"content-type": "application/json",
		},
		body: JSON.stringify(data),
	})
		.then((res) => res.json())
		.then((res) => {
			if (res.ok === true) {
				showMassage("個人檔案更新成功", true);
			}
			if (res.error === true) {
				showMassage(res.message, false);
				return;
			}
		});
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
	if (input === "") return true;
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
