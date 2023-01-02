import re  #regex
from icecream import ic

class Regex:
	#email 需符合格式
	def email_validation(email):
		regex = re.compile(r"([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+")
		result = re.fullmatch(regex, email)
		if not result:
			return "Email 不符合格式"
		return True

	#姓名限用中文或英文組成
	def name_validation(name):
		regex = re.compile(r"^[\u4e00-\u9fa5A-Za-z]*$")
		result = re.match(regex, name)
		if not result:
			return "姓名限由中、英文組成"
		return True

	#手機號碼需爲 09 開頭的十碼數字
	def phone_validation(phone):
		if (len(phone) != 10 ):
			return "電話號碼需爲 10 碼"
		
		regex = re.compile(r"^09\d{8}$")
		result = re.match(regex, phone)
		if not result:
			return "電話號碼需爲 09 開頭"
		return True

	#密碼驗證
	def password_validation(password):
		if (len(password) <8 ):
			return "密碼長度不足"
    
		regex1 = re.compile(r"^[a-zA-Z0-9]+$")
		result1 = re.match(regex1, password)
		if not result1:
			return "密碼僅能由數字及英文組成"

		regex2 = re.compile(r"^(?=.*[A-Za-z])([A-Za-z0-9]+)$")
		result2 = re.match(regex2, password)
		if not result2:
			return "密碼應包含至少一個英文字母"

		regex3 = re.compile(r"^(?=.*[0-9])([A-Za-z0-9]+)$")
		result3 = re.match(regex3, password)
		if not result3:
			return "密碼應包含至少一個數字"

		return True