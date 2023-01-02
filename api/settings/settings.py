from flask import Blueprint, jsonify, request, render_template
from .models import * 
from datetime import datetime

import sys
sys.path.append("../../")
from packages.error_message import *
from packages.jwt_token import *
from packages.regular_expression import *

api_settings_bp = Blueprint('api_settings_bp', __name__)

@api_settings_bp.route("/settings")
def settings_page():
	return render_template("settings.html")

@api_settings_bp.route("/api/settings", methods=['POST'])
def save_user_photo():
	authorization = request.headers.get('authorization')
	if (not authorization):
		return error_message("登入驗證失敗"), 403
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decode_token(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return error_message("登入驗證失敗"), 403

	file = request.files['photo']
	if (not file):
		return error_message("上傳失敗"), 403
	timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
	fileExtension = os.path.splitext(file.filename)[1]
	newFilename = str(userId)+ timestamp + fileExtension
	#將檔案以新檔名存取到 static 中（使用絕對路徑）
	file.save(os.path.join(os.getcwd(), 'static/Images/user_photo/' + newFilename))
 
	#搜尋出 user_photo 檔名並且刪除路徑下的檔案
	try:
		oldFileName = Settings.get_user_photo(userId)
		if(oldFileName):
			filePath = os.path.join(os.getcwd(), 'static/Images/user_photo/' + oldFileName)
			os.remove(filePath)
	except FileNotFoundError:
		pass

	#儲存照片檔名
	result = Settings.save_user_photo_name(userId, newFilename)
	if (result):
		return jsonify({'ok': True})
	return error_message("上傳失敗"), 403
	
	

@api_settings_bp.route("/api/settings", methods=['GET'])
def get_user_data():
	authorization = request.headers.get('authorization')
	if (not authorization):
		return error_message("登入驗證失敗"), 403
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decode_token(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return error_message("登入驗證失敗"), 403

	data = Settings.get_user_data(userId)
	if (not data ):
		return error_message("伺服器出現問題，請再試一次"), 500
	return jsonify({'data': data})
	

@api_settings_bp.route("/api/settings", methods=['DELETE'])
def delete_user_photo():
	authorization = request.headers.get('authorization')
	if (not authorization):
		return error_message("登入驗證失敗"), 403
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decode_token(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return error_message("登入驗證失敗"), 403

	#搜尋出 user_photo 檔名並且刪除路徑下的檔案
	fileName = Settings.get_user_photo(userId)
	if(not fileName):
		return jsonify({"ok": True})
	filePath = os.path.join(os.getcwd(), 'static/Images/user_photo/' + fileName)
	os.remove(filePath)
 
	#更新 user 資料表中的 user_photo 欄位爲 NULL
	status = Settings.update_user_photo_to_null(userId)
	if (not status):
		return error_message("照片刪除失敗"), 500
	return jsonify({"ok": True})


@api_settings_bp.route("/api/settings", methods=['PUT'])
def update_user_Data():
	authorization = request.headers.get('authorization')
	if (not authorization):
		return error_message("登入驗證失敗"), 403
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decode_token(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return error_message("登入驗證失敗"), 403

	#input 資料驗證
	userData = request.json
	name = userData['name']
	email = userData['email']
	phone = userData['phone']
	if (not name or not email):
		return error_message("名稱與電子郵件爲必填欄位"), 400
	nameResult = Regex.name_validation(name)
	if (nameResult != True):
		return error_message(nameResult), 400
	emailResult = Regex.email_validation(email)
	if (emailResult != True):
		return error_message(emailResult), 400

	if (phone):
		phoneResult = Regex.phone_validation(phone)
		if (phoneResult != True):
			return error_message(phoneResult), 400
 
	#搜尋出 user_photo 檔名並且刪除路徑下的檔案
	status = Settings.update_user_data(userId, userData)
	if (not status):
		return error_message("資料更新失敗"), 500
 
	return jsonify({"ok": True})

