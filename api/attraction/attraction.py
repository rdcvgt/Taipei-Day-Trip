from flask import Blueprint, jsonify, request, render_template
from .models import *
import sys
sys.path.append("../../")
from packages.error_message import *

api_attraction_bp = Blueprint('api_attraction_bp', __name__)

@api_attraction_bp.route("/attraction/<id>")
def attraction_page(id):
	return render_template("attraction.html")

#找所有（或符合關鍵字）的景點
@api_attraction_bp.route("/api/attractions")
def get_attractions():
	page = request.args.get("page")
	keyword = request.args.get("keyword")
	if (page == None or page == ""):
		return error_message("請指定頁數"), 500
	if (keyword == ""):
		return error_message("請輸入關鍵字"), 500

	try:	
		startAtt = int(page)*12
	except:
		return error_message("請輸入正確頁數"), 500

	data = Attraction.get_all_attractions(keyword, startAtt)
	if(data == False):
		return error_message("伺服器出現問題"), 500
	attArray = data[0]
	allAttNum = data[1]
	if (attArray == []):
		return error_message("查無資料"), 500

	#確定是否有第十三筆（下一頁）資料
	if (allAttNum == 13):  
		nextPage = int(page)+1
	else:
		nextPage = None

	attractions = jsonify({
		'nextpage': nextPage,
		'data': attArray
	})
	return attractions

#根據 ID 尋找景點
@api_attraction_bp.route("/api/attraction/<attractionId>")
def get_attraction_by_id(attractionId):
	data = Attraction.get_one_attraction(attractionId)
	if(data == False):
		return error_message("伺服器出現問題"), 500
	if(data == None):
		return error_message("查無此編號"), 400
	if(data == "編號錯誤"):
		return error_message("請輸入正確編號"), 400

	attraction = jsonify({'data': data})
	return attraction

#找出所有分類
@api_attraction_bp.route("/api/categories")
def categories():
	data = Attraction.get_categories()
	if(data == False):
		return error_message("伺服器出現問題"), 500
	category = jsonify({'data': data})
	return category