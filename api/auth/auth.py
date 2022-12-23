from flask import Blueprint, jsonify, request, make_response
from flask_bcrypt import Bcrypt
from .models import *

import sys
sys.path.append("../../")
from packages.error_message import *
from packages.jwt_token import *

api_auth_bp = Blueprint('api_auth_bp', __name__)

#使用者註冊
@api_auth_bp.route("/api/user", methods=['POST'])
def handle_user_sign_up():
	data = request.json
	name = data["name"]
	email = data["email"]
	password = data["password"]
	if (not name or not email or not password):
		return error_message("欄位不得爲空"), 400
	if (not Regex.email_validation(email)):
		return error_message("電子郵件格式不正確"), 400

	bcrypt = Bcrypt()
	hashed_password = bcrypt.generate_password_hash(password)
	result = UserData.save_new_user_data(name, email, hashed_password)
	if (result == True):
		return jsonify({"ok": True})
	if (result == "重複註冊"):
		return error_message("電子郵件已被註冊"), 400
	if (result == "伺服器問題"):
		return error_message("伺服器出現問題，請再試一次"), 500
	
#驗證每次載入頁面時使用者的當前身份
@api_auth_bp.route("/api/user/auth", methods=['GET'])
def handle_user_validation():
	data = request.headers.get('authorization')
	token = data.split()[1]
	isValidToken = decode_token(token)
	invalidUser = jsonify({'data': None })
	if (isValidToken == False):
		return invalidUser

	data = UserData.get_user_data_by_id(isValidToken)
	if (data == False):
		return invalidUser
	return jsonify({'data': data})
		
#使用者登入
@api_auth_bp.route("/api/user/auth", methods=['PUT'])
def handle_user_sign_in():
	data = request.json
	email = data["email"]
	password = data["password"]
	if (not email or not password):
		return error_message("欄位不得爲空"), 400
	if (not Regex.email_validation(email)):
		return error_message("電子郵件格式不正確"), 400
	#todo: password regex

	try:
		result = UserData.get_user_data_by_email(email)
		if (result == "伺服器問題"):
			return error_message("伺服器出現錯誤，請再次登入"), 500
		encodedPassword = result['password']
		userId = result['id']

		bcrypt = Bcrypt()
		passwordIsValid = bcrypt.check_password_hash(encodedPassword, password)
		if (not passwordIsValid):
			return error_message("電子郵件或密碼有誤，請重新輸入"), 400
	except TypeError:
		return error_message("電子郵件或密碼有誤，請重新輸入"), 400

	#製作 JWT 並回覆登入成功訊息
	signInSuccess = jsonify({"ok": True})
	accessToken = create_access_token(userId)
	resp = make_response(signInSuccess)
	resp.set_cookie('access_token', accessToken, 60*60*24*7)
	return resp

#使用者登出
@api_auth_bp.route("/api/user/auth", methods=['DELETE'])
def deleteUserData():
	data = request.headers.get('authorization')
	token = data.split()[1]  #todo: access token
	logoutSuccess = jsonify({"ok": True})
	resp = make_response(logoutSuccess)
	resp.set_cookie('access_token', "", -1)
	return resp


	