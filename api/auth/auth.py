from flask import Blueprint
from flask import jsonify
from flask import request
from flask_bcrypt import Bcrypt
from flask import make_response

from .models import *
import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage
from modules.create_jwt import *

api_auth_bp = Blueprint('api_auth_bp', __name__)

#使用者註冊
@api_auth_bp.route("/api/user", methods=['POST'])
def handleUserSignUpData():
	data = request.json
	name = data["name"]
	email = data["email"]
	password = data["password"]
	if (not name or not email or not password):
		return errorMessage("欄位不得爲空"), 400
	if (not Regex.emailIsValid(email)):
		return errorMessage("電子郵件格式不正確"), 400

	bcrypt = Bcrypt()
	hashed_password = bcrypt.generate_password_hash(password)
	result = UserData.post(name, email, hashed_password)
	if (result == True):
		return jsonify({"ok": True})
	if (result == "重複註冊"):
		return errorMessage("電子郵件已被註冊"), 400
	if (result == "伺服器問題"):
		return errorMessage("伺服器出現問題，請再試一次"), 500
	
#驗證使用者當前身份
@api_auth_bp.route("/api/user/auth", methods=['GET'])
def handleValidateStatus():
	data = request.headers.get('authorization')
	token = data.split()[1]
	isValidToken = decodeToken(token)
	invalidUser = jsonify({'data': None })
	if (isValidToken == False):
		return invalidUser

	data = UserData.get(isValidToken)
	if (data == False):
		return invalidUser
	return jsonify({'data': data})
		
#使用者登入
@api_auth_bp.route("/api/user/auth", methods=['PUT'])
def handleUserSignInData():
	data = request.json
	email = data["email"]
	password = data["password"]
	if (not email or not password):
		return errorMessage("欄位不得爲空"), 400
	if (not Regex.emailIsValid(email)):
		return errorMessage("電子郵件格式不正確"), 400
	#todo: password regex

	try:
		result = UserData.put(email)
		if (result == "伺服器問題"):
			return errorMessage("伺服器出現錯誤，請再次登入"), 500
		encodedPassword = result[0]
		userId = result[1]

		bcrypt = Bcrypt()
		passwordIsValid = bcrypt.check_password_hash(encodedPassword, password)
		if (not passwordIsValid):
			return errorMessage("電子郵件或密碼有誤，請重新輸入"), 400
	except TypeError:
		return errorMessage("電子郵件或密碼有誤，請重新輸入"), 400

	#製作 JWT 並回覆登入成功訊息
	signInSuccess = jsonify({"ok": True})
	refreshToken = createRefreshToken(userId)
	resp = make_response(signInSuccess)
	resp.set_cookie('refresh_token', refreshToken, 60*60*24*7)
	# accessToken = createAccessToken(userId)
	# resp.set_cookie('access_token', accessToken)
	#todo: 之後回來做較複雜的 access token
	#todo: refresh token 存入 DB
	return resp

#使用者登出
@api_auth_bp.route("/api/user/auth", methods=['DELETE'])
def deleteUserData():
	data = request.headers.get('authorization')
	token = data.split()[1]  #todo: access token
	logoutSuccess = jsonify({"ok": True})
	resp = make_response(logoutSuccess)
	resp.set_cookie('refresh_token', "", -1)
	return resp


	