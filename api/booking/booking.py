from flask import Blueprint
from flask import jsonify
from flask import request
from flask import render_template

from .models import *
import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage
from modules.create_jwt import *

api_booking_bp = Blueprint('api_booking_bp', __name__)

@api_booking_bp.route("/booking")
def bookingPage():
	return render_template("booking.html")

@api_booking_bp.route("/api/booking", methods=['GET'])
def getBooking():
	authorization = request.headers.get('authorization')
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decodeToken(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return errorMessage("登入驗證失敗"), 403

	data = Booking.getUserBookingTrip(userId)
	if (not data):
		return jsonify({'data': None})
	
	return jsonify(data)

@api_booking_bp.route("/api/booking", methods=['POST'])
def booking():
	authorization = request.headers.get('authorization')
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decodeToken(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return errorMessage("登入驗證失敗"), 403

	userId = int(userInfo['data']['userId'])
	data = request.json
	status = Booking.saveUserBookingTrip(data, userId)
	if (status == None):
		return errorMessage("輸入資訊不正確，請再試一次"), 400
	if (status == False):
		return errorMessage("伺服器出現問題，請再試一次"), 500
	if (status == "已更新資料"):
		return jsonify({"ok": True, "message": "已成功更新您的預約，2 秒後將跳轉至預訂行程頁面..."})
	if (status == "已新增資料"):
		return jsonify({"ok": True, "message": "預約成功！2 秒後將跳轉至預訂行程頁面..."})	

@api_booking_bp.route("/api/booking", methods=['DELETE'])
def deleteBooking():
	authorization = request.headers.get('authorization')
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decodeToken(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return errorMessage("登入驗證失敗"), 403

	status = Booking.deleteUserBookingTrip(userId)
	if (status == False):
		return errorMessage("登入驗證失敗"), 403
	return jsonify({"ok": True})
