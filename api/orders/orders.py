from flask import Blueprint, jsonify, request, render_template
from datetime import date
import requests, json, random, math

import os
from dotenv import load_dotenv
load_dotenv()
partnerKey = os.getenv("partnerKey")

from .models import *
import sys
sys.path.append("../../")
from packages.error_message import *
from packages.jwt_token import *

from icecream import ic

api_orders_bp = Blueprint('api_orders_bp', __name__)

@api_orders_bp.route("/thankyou")
def thankyou_page():
	return render_template("thankyou.html")

@api_orders_bp.route("/api/orders", methods=['POST'])
def orders():
    #身份驗證
	authorization = request.headers.get('authorization')
	if (not authorization):
		return error_message("登入驗證失敗"), 403
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decode_token(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return error_message("登入驗證失敗"), 403

	#使用 userId, data 查詢是否有預訂行程資料，並回傳 bookingId
	# try:
		
	# 	data = request.json
		
	# 	bookingId = data['order']['trip']['data']
	# 	ic(bookingId)
	# except:
	# 	return error_message("訂單建立失敗"), 400
	# bookingId = 
	# bookingId = Order.get_booking_id(userId, data)
	# if (not bookingId):
	# 	return error_message("查無預訂行程"), 400

	#如果沒有 orderId，建立訂單編號並儲存訂單資訊
	# orderId = Order.check_order_id(bookingId)
	today = date.today()
	dateNum = today.strftime("%Y%m%d")
	randomNum = str(math.floor(random.random()*100000))
	orderId = dateNum + str(userId) + randomNum
    
    #清理 request 資料，以提交 tappay 付款資訊
	data = request.json
	price = int(data['order']['price'])
	phone = '+886' + data['contact']['phone'][1:]
	name =  data['contact']['name']
	email = data['contact']['email']
	prime = data['prime'] 
	userData = {
			"prime": prime,
			"partner_key": partnerKey,
			"merchant_id": "rdcvgt_NCCC",
			"details":"trip",
			"amount": price,
			"cardholder": {
				"phone_number": phone,
				"name": name,
				"email": email,
			}
   		}
	userOrder = json.dumps(userData)  #不能用 jsonify，會無法讀取格式
	url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
	headers = {'Content-type': 'application/json', 'x-api-key': partnerKey};
	response = requests.post(url, data=userOrder, headers=headers)
 
	#如果 status 是 0 則更新 order 資料表當中的 payment_status
	paymentInfo = json.loads(response.text)
	paymentStatus = paymentInfo['status']
	# if (paymentStatus == 0):
	# 	Order.change_payment_status(orderId)
	paymentMessage = {
		"data": {
		"number": orderId,
		"payment": {
			"status": paymentStatus,
			"message": "付款成功" if paymentStatus == 0 else "付款失敗"
			}
 	 	}
 	}

	#儲存此筆訂單所包含的預訂行程編號
	try:
		bookingId = data['order']['trip']['data']
		Order.save_order_bookings(bookingId,orderId)
  
	except:
		return error_message("訂單建立失敗"), 400

	#儲存訂單，包含訂單編號、使用者資訊及付款狀況
	result = Order.save_order(paymentStatus, data, orderId)
	if (result == None):
		return error_message("使用者資料不正確"), 400
	if (result == False):
		return error_message("訂單建立失敗"), 500
 
	#儲存訂單交易結果
	if (len(paymentInfo) == 2):
		Order.save_fail_payment_info(orderId, paymentInfo)
		return jsonify(paymentMessage)

	Order.save_payment_info(orderId, paymentInfo)
	return jsonify(paymentMessage)

@api_orders_bp.route("/api/order/<id>")
def get_order_by_id(id):
    #身份驗證
	authorization = request.headers.get('authorization')
	if (not authorization):
		return error_message("登入驗證失敗"), 403
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decode_token(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return error_message("登入驗證失敗"), 403
    
    #獲取訂單資訊並回傳給前端
	orderId = id
	orderInfo = Order.get_order_info(userId, orderId)
	return jsonify(orderInfo)





