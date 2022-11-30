from flask import Blueprint
from flask import jsonify
from flask import request

from .models import *
import sys
sys.path.append("..")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage


api_bp = Blueprint('api_bp', __name__)



# API
@api_bp.route("/api/attractions")
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

	data = fetch_all_atts(keyword, startAtt)
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

@api_bp.route("/api/attraction/<attractionId>")
def useIdFindAttraction(attractionId):
	data = fetch_one_attraction(attractionId)
	attraction = jsonify({'data': data})
	return attraction

@api_bp.route("/api/categories")
def categories():
	data = fetch_categories()
	category = jsonify({'data': data})
	return category