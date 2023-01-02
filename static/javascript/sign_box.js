/* 網頁載入時驗證使用者身份是否爲登入狀態 */
function onLoadPage() {
	let token = document.cookie.split("=")[1];
	//如果 cookie 不存在 token
	if (!token) {
		//無法進入 booking 頁面
		if (window.location.href.split("/")[3] === "booking") {
			window.location.href = "/";
		}
		showLoginBox();
		return;
	}
	fetch(`/api/user/auth`, {
		method: "GET",
		headers: { authorization: `Bearer ${token}` },
	})
		.then((res) => res.json())
		.then((data) => {
			let userInfo = data.data;
			sessionStorage.setItem("user", JSON.stringify(userInfo));
			const navLoginBtn = document.querySelector(".navLoginBtn");
			const menuBtn = document.querySelector(".menuBtn");

			if (userInfo !== null) {
				//隱藏登入按鈕，開啓 menuBtn
				navLoginBtn.removeAttribute("style");
				menuBtn.removeAttribute("style");

				//啓動登出按鈕
				clickToLogout(token);

				//可點擊預訂行程按鈕至頁面
				const navBookBtn = document.querySelector(".navBookBtn");
				navBookBtn.addEventListener("click", () => {
					window.location.href = "/booking";
				});

				//串接使用者資料
				showNavUserData(data);
				return;
			}
			//若使用者資料爲 null，無法進入 booking 頁面
			if (window.location.href.split("/")[3] === "booking") {
				window.location.href = "/";
			}
			showLoginBox();
		});
}
onLoadPage();

function toggleSubMenu() {
	const menuBtn = document.querySelector(".menuBtn");
	const subMenu = document.querySelector(".subMenu");
	document.addEventListener("click", (e) => {
		if (menuBtn.contains(e.target)) {
			subMenu.style.display = "block";
			subMenu.style.animation = "fadeInMenu 0.3s forwards";
		} else if (!menuBtn.contains(e.target)) {
			subMenu.style.animation = "fadeOutMenu 0.3s forwards";
			setTimeout(() => {
				subMenu.removeAttribute("style");
			}, 300);
		}
	});
}
toggleSubMenu();

function showNavUserData(info) {
	const username = document.querySelector(".username");
	username.textContent = info.data.name;

	const photo = document.querySelector(".photo");
	photo.src =
		info.data.photo !== null
			? `../static/Images/user_photo/${info.data.photo}`
			: `../static/Images/components/user.png`;

	const bookingCount = document.querySelector(".bookingCount");
	count = info.bookings;
	if (count > 0) {
		bookingCount.removeAttribute("style");
		bookingCount.textContent = count > 99 ? "99+" : count;
	}
}

/* 登出系統 */
function clickToLogout(token) {
	const navLogoutBtn = document.querySelector(".navLogoutBtn");
	navLogoutBtn.addEventListener("click", () => {
		fetch(`/api/user/auth`, {
			method: "Delete",
			headers: { authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => {
				//如果在 booking 頁面登出，則導回首頁
				if (window.location.href.split("/")[3] === "booking") {
					window.location.href = "/";
					return;
				}
				window.location.reload();
				showLoginBox();
				return;
			});
	});
}

/*  點擊「登入/註冊」按鈕 */
function showLoginBox() {
	const boxBG = document.querySelector(".boxBG");
	const signIn = document.querySelector(".signIn");
	const navLoginBtn = document.querySelector(".navLoginBtn");
	const navBookBtn = document.querySelector(".navBookBtn");

	navLoginBtn.addEventListener("click", () => {
		boxBG.style.display = "block";
		signIn.style.display = "block";
		boxBG.style.animation = "fadeIn 0.3s forwards";
		signIn.style.animation = "fadeIn 0.4s forwards";
	});

	navBookBtn.addEventListener("click", () => {
		boxBG.style.display = "block";
		signIn.style.display = "block";
		boxBG.style.animation = "fadeIn 0.3s forwards";
		signIn.style.animation = "fadeIn 0.4s forwards";
	});
	closeBox();
	clickToSignUpOrIn();
	getUserSignInInfo();
	getUserSignUpInfo();
	examineSignInInput();
	examineSignUpInput();
}

/*  點擊關閉按鈕或背景來關閉登入/註冊區塊 */
function closeBox() {
	const boxBG = document.querySelector(".boxBG");
	const signIn__closeBtn = document.querySelector(".signIn__closeBtn");
	const signUp__closeBtn = document.querySelector(".signUp__closeBtn");
	const signIn = document.querySelector(".signIn");
	const signUp = document.querySelector(".signUp");

	close(boxBG);
	close(signIn__closeBtn);
	close(signUp__closeBtn);

	function close(clickArea) {
		clickArea.addEventListener("click", () => {
			disableAllSignInMessage();
			disableAllSignUpMessage();
			boxBG.style.animation = "fadeOut 0.3s forwards";
			signIn.style.animation = "fadeOut 0.2s forwards";
			signUp.style.animation = "fadeOut 0.2s forwards";
			setTimeout(() => {
				boxBG.style.display = "none";
				signIn.style.display = "none";
				signUp.style.display = "none";
			}, 400);
		});
	}
}

/* 切換至註冊或登入 */
function clickToSignUpOrIn() {
	const goToSignUp = document.querySelector(".goToSignUp");
	const goToSignIn = document.querySelector(".goToSignIn");
	const signIn = document.querySelector(".signIn");
	const signUp = document.querySelector(".signUp");

	goToSignUp.addEventListener("click", (e) => {
		disableAllSignInMessage();
		setTimeout(() => {
			signIn.style.display = "none";
		}, 400);

		signUp.style.display = "block";
		signUp.style.animation = "fadeIn 0.4s forwards";
	});

	goToSignIn.addEventListener("click", (e) => {
		disableAllSignUpMessage();
		signIn.style.display = "block";
		signIn.style.animation = "fadeIn 0.3s forwards";
		signUp.style.animation = "fadeOut 0.5s forwards";
		setTimeout(() => {
			signUp.style.display = "none";
		}, 500);
	});
}

/* 提交用戶註冊資訊*/
function getUserSignUpInfo() {
	const signUp__form = document.querySelector(".signUp__form");
	const signUp__Name = document.querySelector(".signUp__Name");
	const signUp__Email = document.querySelector(".signUp__Email");
	const signUp__password = document.querySelector(".signUp__password");

	signUp__form.addEventListener("submit", (e) => {
		disableAllSignUpMessage();
		e.preventDefault();
		let name = signUp__Name.value;
		let email = signUp__Email.value;
		let password = signUp__password.value;
		let nameIsValid = examineName(signUp__Name);
		let emailIsValid = examineEmail(signUp__Email);
		let passwordIsValid = examinePassword(signUp__password);
		if (!emailIsValid || !passwordIsValid || !nameIsValid) {
			return;
		}

		data = { name, email, password };
		fetch("/api/user", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(data),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.ok === true) {
					const signUp__password =
						document.querySelector(".signUp__password");
					str = `<div class="message success">註冊成功，請點擊下方進行登入！</div>`;
					signUp__password.insertAdjacentHTML("afterend", str);
				}
				if (res.error === true) {
					enableBackEndMessage(res.message, "signUp");
				}
			});
	});
}

/* 提交用戶登入資訊 */
function getUserSignInInfo() {
	const signIn__form = document.querySelector(".signIn__form");
	const signIn__Email = document.querySelector(".signIn__Email");
	const signIn__password = document.querySelector(".signIn__password");

	signIn__form.addEventListener("submit", (e) => {
		disableBackEndSignInMessage();
		e.preventDefault();
		let email = signIn__Email.value;
		let password = signIn__password.value;
		let emailIsValid = examineEmail(signIn__Email);
		let passwordIsValid = examinePassword(signIn__password);
		if (!emailIsValid || !passwordIsValid) {
			return;
		}

		data = { email, password };
		fetch("/api/user/auth", {
			method: "PUT",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(data),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.ok === true) {
					window.location.reload();
					onLoadPage();
				}
				if (res.error === true) {
					enableBackEndMessage(res.message, "signIn");
				}
			});
	});
}

/* 檢查登入區的所有 input 輸入內容是否正確*/
function examineSignInInput() {
	const signIn__Email = document.querySelector(".signIn__Email");
	signIn__Email.addEventListener("blur", () => {
		examineEmail(signIn__Email);
	});

	const signIn__password = document.querySelector(".signIn__password");
	signIn__password.addEventListener("blur", () => {
		examinePassword(signIn__password);
	});
}

/* 檢查註冊區的所有 input 輸入內容是否正確*/
function examineSignUpInput() {
	const signUp__Name = document.querySelector(".signUp__Name");
	signUp__Name.addEventListener("blur", () => {
		examineName(signUp__Name);
	});

	const signUp__Email = document.querySelector(".signUp__Email");
	signUp__Email.addEventListener("blur", () => {
		examineEmail(signUp__Email);
	});

	const signUp__password = document.querySelector(".signUp__password");
	signUp__password.addEventListener("blur", () => {
		examinePassword(signUp__password);
	});
}

/* 姓名欄位的驗證細節 */
function examineName(className) {
	input = className.value;
	if (!input) {
		enableNotice(className, "請輸入您的姓名");
		return false;
	}
	let regex = /^[\u4e00-\u9fa5A-Za-z]+$/.test(input);
	if (!regex) {
		enableNotice(className, "姓名限用中文或英文組成");
		return false;
	}
	disableNotice(className);
	return true;
}

/* 檢查 email 欄位 */
function examineEmail(className) {
	let input = className.value;
	if (!input) {
		enableNotice(className, "請輸入您的電子郵件");
		return false;
	}
	let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input);
	if (!regex) {
		enableNotice(className, "抱歉！您所輸入的電子信箱格式不正確");
		return false;
	}
	disableNotice(className);
	return true;
}

/* 檢查密碼欄位 */
function examinePassword(className) {
	let input = className.value;
	if (!input) {
		enableNotice(className, "請輸入您的密碼");
		return false;
	}
	if (input.length < 8) {
		enableNotice(className, "抱歉！密碼應至少 8 個字元，請再檢查一次");
		return false;
	}
	let regex1 = /^[a-zA-Z0-9]+$/.test(input);
	if (!regex1) {
		enableNotice(className, "抱歉！密碼不應包含特殊符號，請再檢查一次");
		return false;
	}

	let regex2 = /^(?=.*[A-Za-z])([A-Za-z0-9]+)$/.test(input);
	if (!regex2) {
		enableNotice(className, "抱歉！密碼應至少包含一個英文字母");
		return false;
	}

	let regex3 = /^^(?=.*[0-9])([A-Za-z0-9]+)$$/.test(input);
	if (!regex3) {
		enableNotice(className, "抱歉！密碼應至少包含一個數字");
		return false;
	}
	disableNotice(className);
	return true;
}

/* 顯示 input 驗證提示 */
function enableNotice(className, message) {
	className.nextElementSibling.textContent = message;
	className.nextElementSibling.style.display = "block";
	className.style.border = "1px solid #d20000";
}

/* 消除 input 驗證提示 */
function disableNotice(className) {
	className.nextElementSibling.textContent = "";
	className.nextElementSibling.style.display = "none";
	className.removeAttribute("style");
}

/*顯示後端回傳錯誤提示*/
function enableBackEndMessage(Message, from) {
	if (from === "signUp") {
		const signUp__btn = document.querySelector(".signUp__btn");
		const signUp__Name = document.querySelector(".signUp__Name");
		const signUp__Email = document.querySelector(".signUp__Email");
		const signUp__password = document.querySelector(".signUp__password");

		signUp__btn.previousElementSibling.textContent = Message;
		signUp__btn.previousElementSibling.style.display = "block";
		if (
			Message === "電子郵件已被註冊" ||
			Message === "電子郵件格式不正確"
		) {
			signUp__Email.style.border = "1px solid #d20000";
			return;
		}

		signUp__Name.style.border = "1px solid #d20000";
		signUp__Email.style.border = "1px solid #d20000";
		signUp__password.style.border = "1px solid #d20000";
	}

	if (from === "signIn") {
		const signIn__btn = document.querySelector(".signIn__btn");
		const signIn__Email = document.querySelector(".signIn__Email");
		const signIn__password = document.querySelector(".signIn__password");
		signIn__btn.previousElementSibling.textContent = Message;
		signIn__btn.previousElementSibling.style.display = "block";
		signIn__Email.style.border = "1px solid #d20000";
		signIn__password.style.border = "1px solid #d20000";
	}
	return;
}

/* 消除後端回傳在登入區的提示 */
function disableBackEndSignInMessage() {
	const signIn__btn = document.querySelector(".signIn__btn");
	const signIn__Email = document.querySelector(".signIn__Email");
	const signIn__password = document.querySelector(".signIn__password");
	signIn__btn.previousElementSibling.textContent = "";
	signIn__btn.previousElementSibling.style.display = "none";
	signIn__Email.removeAttribute("style");
	signIn__password.removeAttribute("style");
}

/* 消除後端回傳在註冊區的提示 */
function disableBackEndSignInMessage() {
	const signUp__btn = document.querySelector(".signUp__btn");
	const signUp__Name = document.querySelector(".signUp__Name");
	const signUp__Email = document.querySelector(".signUp__Email");
	const signUp__password = document.querySelector(".signUp__password");
	signUp__btn.previousElementSibling.textContent = "";
	signUp__btn.previousElementSibling.style.display = "none";
	signUp__Name.removeAttribute("style");
	signUp__Email.removeAttribute("style");
	signUp__password.removeAttribute("style");
}

/* 消除所有登入區的提示 */
function disableAllSignInMessage() {
	const signIn__Email = document.querySelector(".signIn__Email");
	const signIn__password = document.querySelector(".signIn__password");
	disableBackEndSignInMessage();
	disableNotice(signIn__Email);
	disableNotice(signIn__password);
}

/* 消除所有註冊區的提示 */
function disableAllSignUpMessage() {
	const signUp__Name = document.querySelector(".signUp__Name");
	const signUp__Email = document.querySelector(".signUp__Email");
	const signUp__password = document.querySelector(".signUp__password");
	disableBackEndSignInMessage();
	disableNotice(signUp__Name);
	disableNotice(signUp__Email);
	disableNotice(signUp__password);
}
