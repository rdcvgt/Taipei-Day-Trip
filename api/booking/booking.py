from flask import Blueprint, jsonify, request, render_template
from .models import *

import sys
sys.path.append("../../")
from packages.error_message import *
from packages.jwt_token import *

api_booking_bp = Blueprint('api_booking_bp', __name__)

@api_booking_bp.route("/booking")
def booking_page():
	return render_template("booking.html")

@api_booking_bp.route("/api/booking", methods=['GET'])
def get_booking_info():
	authorization = request.headers.get('authorization')
	if (not authorization):
		return error_message("登入驗證失敗"), 403
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decode_token(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return error_message("登入驗證失敗"), 403

	#若目前沒有行程，或是訂單尚未付款
	data = Booking.get_user_booking_trip(userId)
	if (not data):
		return jsonify({'data': None})
	
	return jsonify(data)

@api_booking_bp.route("/api/booking", methods=['POST'])
def booking_trip():
	authorization = request.headers.get('authorization')
	if (not authorization):
		return error_message("登入驗證失敗"), 403
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decode_token(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return error_message("登入驗證失敗"), 403

	userId = int(userInfo['data']['userId'])
	data = request.json
	status = Booking.save_user_booking_trip(data, userId)
	if (status == None):
		return error_message("輸入資訊不正確，請再試一次"), 400
	if (status == False):
		return error_message("伺服器出現問題，請再試一次"), 500
	if (status == "已新增資料"):
		return jsonify({"ok": True, "message": "已成功加入預訂行程！"})	


@api_booking_bp.route("/api/booking", methods=['DELETE'])
def delete_booking():
	authorization = request.headers.get('authorization')
	if (not authorization):
		return error_message("登入驗證失敗"), 403
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decode_token(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return error_message("登入驗證失敗"), 403

	bookingId = int(request.headers.get('bookingId'))
	status = Booking.delete_user_booking_trip(userId, bookingId)
	if (status == False):
		return error_message("登入驗證失敗"), 403
	return jsonify({"ok": True})
