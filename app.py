from flask import *
import json
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True



# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

# API
@app.route("/api/attractions")
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

	if (keyword == None):
		sql = '''SELECT A.*, Cat.category FROM attraction as A INNER JOIN attraction_category as Cat 
		ON A.att_id = Cat.att_id limit %s, 13'''
		startAttFrom = (startAtt, )

	if (keyword != None):
		sql = '''SELECT A.*, C.category FROM attraction as A INNER JOIN attraction_category as 
				C ON A.att_id = C.att_id where (A.name like %s or C.category = %s) limit %s, 13'''
		startAttFrom = ('%'+keyword+'%', keyword, startAtt)



	try:
		c = conn()
		cursor = selectDb(c)
		cursor.execute(sql, startAttFrom)
		result = cursor.fetchall()
		attArray = []
		start = 0
		end = 12
		while (start < end): 
			if (start > len(result)-1):  #當索引值大於資料長度
				break
			attraction = {
				'id': result[start][0],
				'name': result[start][2],
				'category': result[start][10],
				'description': result[start][8],
				'address':result[start][3],
				'direction': result[start][5],
				'mrt': result[start][4],
				'lat': float(result[start][7]),
				'lng': float(result[start][6]),
				'images': eval(result[start][9])
			}

			attArray.append(attraction)
			start+= 1
	except:
		close(c, cursor)
		return errorMessage("關鍵字或頁數有誤"), 500

	if (attArray == []):
		close(c, cursor)
		return errorMessage("查無資料"), 500
	
	try:
		if (len(result)== 13):  #確定是否有第十三筆（下一頁）資料
			nextpage = int(page)+1
		else:
			nextpage = None
		attractions = jsonify({
			'nextpage': nextpage,
			'data': attArray
		})
		return attractions

	finally:
		close(c, cursor)

@app.route("/api/attraction/<attractionId>")
def useIdFindAttraction(attractionId):
	print(attractionId, 'hey')
	try:
		c = conn()
		cursor = selectDb(c)
		sql = '''SELECT A.*, Cat.category FROM attraction as A INNER JOIN 
			attraction_category as Cat ON A.att_id = Cat.att_id where A.id = %s'''
		attId = (int(attractionId), )
		cursor.execute(sql, attId)
		result = cursor.fetchone()
	except ValueError:
		close(c, cursor)
		return errorMessage("請輸入正確編號"), 400
	except:
		close(c, cursor)
		return errorMessage("伺服器出現錯誤"), 500
	
	try:
		data = {
			'id': result[0],
			'name': result[2],
			'category': result[10],
			'description': result[8],
			'address':result[3],
			'direction': result[5],
			'mrt': result[4],
			'lat': float(result[7]),
			'lng': float(result[6]),
			'images': eval(result[9])
		}
	except TypeError:
		close(c, cursor)
		return errorMessage("查無此編號"), 400
	except:
		close(c, cursor)
		return errorMessage("伺服器出現錯誤"), 500

	try:
		attraction = jsonify({
			'data': data
		})
		return attraction

	finally:
		close(c, cursor)

@app.route("/api/categories")
def categories():
	try:
		c = conn()
		cursor = selectDb(c)
		sql = 'select distinct category from attraction_category'
		cursor.execute(sql)
		result = cursor.fetchall()
		data = []
		for i in result:
			data.append(i[0])

	except:
		close(c, cursor)
		return errorMessage("伺服器出現錯誤"), 500

	try:
		category = jsonify({
			'data': data
		})
		return category

	finally:
		close(c, cursor)
		
	

app.run(port=3000)