from flask import Blueprint
from flask import jsonify
from flask import request

from .models import *
import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage


api_attraction_bp = Blueprint('api_attraction_bp', __name__)

#找所有（或符合關鍵字）的景點
@api_attraction_bp.route("/api/attractions")
def attractions():
	page = request.args.get("page")
	keyword = request.args.get("keyword")
	if (page == None or page == ""):
		return errorMessage("請指定頁數"), 500
	if (keyword == ""):
		return errorMessage("請輸入關鍵字"), 500

	try:	
		startAtt = int(page)*12
	except:
		return errorMessage("請輸入正確頁數"), 500

	data = Attraction.fetch_all(keyword, startAtt)
	if(data == False):
		return errorMessage("伺服器出現問題"), 500
	attArray = data[0]
	allAttNum = data[1]
	if (attArray == []):
		return errorMessage("查無資料"), 500

	#確定是否有第十三筆（下一頁）資料
	if (allAttNum == 13):  
		nextpage = int(page)+1
	else:
		nextpage = None

	attractions = jsonify({
		'nextpage': nextpage,
		'data': attArray
	})
	return attractions

#根據 ID 尋找景點
@api_attraction_bp.route("/api/attraction/<attractionId>")
def useAttractionId(attractionId):
	data = Attraction.fetch_one(attractionId)
	if(data == False):
		return errorMessage("伺服器出現問題"), 500
	if(data == None):
		return errorMessage("查無此編號"), 400
	if(data == "編號錯誤"):
		return errorMessage("請輸入正確編號"), 400

	attraction = jsonify({'data': data})
	return attraction

#找出所有分類
@api_attraction_bp.route("/api/categories")
def categories():
	data = Attraction.fetch_categories()
	if(data == False):
		return errorMessage("伺服器出現問題"), 500
	category = jsonify({'data': data})
	return category