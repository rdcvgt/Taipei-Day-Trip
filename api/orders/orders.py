from flask import Blueprint
from flask import jsonify
from flask import request
from flask import render_template
import requests
import json
from datetime import date
import random
import math

import os
from dotenv import load_dotenv
load_dotenv()
partnerKey = os.getenv("partnerKey")

from .models import *
import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage
from modules.create_jwt import *

api_orders_bp = Blueprint('api_orders_bp', __name__)

# @api_orders_bp.route("/booking")
# def bookingPage():
# 	return render_template("booking.html")

@api_orders_bp.route("/api/orders", methods=['POST'])
def orders():
    #身份驗證
	authorization = request.headers.get('authorization')
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decodeToken(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return errorMessage("登入驗證失敗"), 403

	data = request.json
	#使用 userId, data 查詢是否有預訂行程資料，並回傳 bookingId
	bookingId = Order.getBookingId(userId, data)
	if (not bookingId):
		return errorMessage("查無預訂行程"), 400

	orderId = Order.checkOrderId(bookingId)
	#如果沒有 orderId，建立訂單編號並儲存訂單資訊
	if (not orderId):
		today = date.today()
		attId = str(data['order']['trip']['attraction']['id'])
		dateNum = today.strftime("%Y%m%d")
		randomNum = str(math.floor(random.random()*100000))
		orderId = dateNum + attId + randomNum
		result = Order.saveOrder(bookingId, data, orderId)
		if (result == None):
			return errorMessage("使用者資料不正確"), 400
		if (result == False):
			return errorMessage("訂單建立失敗"), 500
    
    #清理 request 資料，以提交 tappay 付款資訊
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
 	
	if (paymentStatus == 0):
		Order.changePaymentStatus(orderId)
	paymentMessage = {
		"data": {
		"number": orderId,
		"payment": {
			"status": paymentStatus,
			"message": "付款成功" if paymentStatus == 0 else "付款失敗"
			}
 	 	}
 	}
 
	#儲存訂單交易結果
	if (len(paymentInfo) == 2):
		Order.saveFailPaymentInfo(bookingId, paymentInfo)
		return jsonify(paymentMessage)

	Order.savePaymentInfo(bookingId, paymentInfo)
	return jsonify(paymentMessage)

@api_orders_bp.route("/api/order/<id>")
def getOrderById(id):
	authorization = request.headers.get('authorization')
	userIdFromHeader = int(request.headers.get('userId'))
	token = authorization.split()[1]
	userInfo = decodeToken(token)
	userId = int(userInfo['data']['userId'])
	if ((not userInfo) or (userIdFromHeader != userId)):
		return errorMessage("登入驗證失敗"), 403
    
	orderId = id
	orderInfo = Order.getOrderInfo(userId, orderId)
	return jsonify(orderInfo)





