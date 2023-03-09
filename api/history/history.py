from flask import Blueprint, jsonify, request, render_template
from .models import *

import sys
sys.path.append("../../")
from packages.error_message import *
from packages.jwt_token import *

api_history_bp = Blueprint('api_history_bp', __name__)

@api_history_bp.route("/history")
def history_page():
	return render_template("history.html")

@api_history_bp.route("/api/history/upcoming", methods=['GET'])
def get_history_upcoming_orders():
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
	data = History.get_orders_by_date(userId, 'upcoming')
	if (not data):
		return jsonify({'data': None})
	
	return jsonify(data)

@api_history_bp.route("/api/history/past", methods=['GET'])
def get_history_past_orders():
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
	data = History.get_orders_by_date(userId, 'past')
	if (not data):
		return jsonify({'data': None})
	
	return jsonify(data)

