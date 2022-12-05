from flask import jsonify
import mysql.connector
import re  #regex
from flask_bcrypt import Bcrypt
from flask import make_response

import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage
from modules.create_jwt import *

#處理使用者註冊
def handleUserSignUpData(data):
	name = data["name"]
	email = data["email"]
	password = data["password"]
	
	if (not name or not email or not password):
		return errorMessage("欄位不得爲空"), 400
	if (not emailIsValid(email)):
		return errorMessage("電子郵件格式不正確"), 400
	#todo: name password regex

	bcrypt = Bcrypt()
	hashed_password = bcrypt.generate_password_hash(password)

	try:
		c = conn()
		cursor = selectDb(c)
		sql = '''insert into user (name, email, password) 
		values (%s, %s, %s)'''
		userInfo = (name, email, hashed_password) 
		cursor.execute(sql, userInfo)
		c.commit()
	except mysql.connector.Error:
		return errorMessage("電子郵件已註冊過"), 400
	except:
		return errorMessage("伺服器出現問題，請再試一次"), 500
	finally:
		close(c, cursor)

	signUpSuccess = jsonify({"ok": True})
	return signUpSuccess

def handleValidateStatus(token):
	isValidToken = decodeToken(token)
	if (isValidToken == False):
		return jsonify({
		'data': None
	})
	
	try:
		userId = isValidToken['data']['userId']
		c = conn()
		cursor = selectDb(c)
		sql = '''select id, name, email from user where id = %s '''
		userInfo = (userId,) 
		cursor.execute(sql, userInfo)
		result = cursor.fetchone() 
		data = {
			'id': result[0],
			'name': result[1],
			'email': result[2]
		}
		return jsonify({
		'data': data
	})
	except:
		return jsonify({
		'data': None
	})

	finally:
		close(c, cursor)
		

#處理使用者登入
def handleUserSignInData(data):
	email = data["email"]
	password = data["password"]
	if (not email or not password):
		return errorMessage("欄位不得爲空"), 400
	if (not emailIsValid(email)):
		return errorMessage("電子郵件格式不正確"), 400
	#todo: password regex

	try:
		c = conn()
		cursor = selectDb(c)
		sql = '''select password, id from user where email = %s '''
		userInfo = (email,) 
		
		cursor.execute(sql, userInfo)
		result = cursor.fetchone()
		encodedPassword = result[0]
		userId = result[1]

		bcrypt = Bcrypt()
		passwordIsValid = bcrypt.check_password_hash(encodedPassword, password)
		if (not passwordIsValid):
			return errorMessage("電子郵件或密碼有誤，請重新輸入"), 400
	except TypeError:
		return errorMessage("電子郵件輸入錯誤，請重新輸入"), 400
	except :
		return errorMessage("伺服器出現錯誤，請再次登入"), 500
	finally:
		close(c, cursor)

	#製作 JWT 並回覆登入成功訊息
	signInSuccess = jsonify({"ok": True})
	# accessToken = createAccessToken(userId)
	refreshToken = createRefreshToken(userId)
	resp = make_response(signInSuccess)
	# resp.set_cookie('access_token', accessToken)

	#todo: 之後回來做較複雜的 access token
	resp.set_cookie('refresh_token', refreshToken, 60*60*24*7)
	#todo: refresh token 存入 DB
	return resp

def emailIsValid(email):
	regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
	if re.fullmatch(regex, email):
		return True
	return False

# def nameIsValid(name):
# 	regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
# 	if re.fullmatch(regex, name):
# 		return True
# 	return False

#處理使用者登出
def handleLogout(token):
	logoutSuccess = jsonify({"ok": True})
	resp = make_response(logoutSuccess)
	resp.set_cookie('refresh_token', "", -1)
	
	return resp