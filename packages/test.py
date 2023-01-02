import re  #regex

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



result = password_validation('ddddd')
print(result)