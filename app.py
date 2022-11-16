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

	c = conn()
	cursor = selectDb(c)
	try:	
		startAtt = int(page)*12
		sql = 'select count(id) from attraction'
		cursor.execute(sql)
		totalData = cursor.fetchone()
		
	except:
		close(c, cursor)
		return errorMessage("請輸入正確頁數"), 500

	if (startAtt+1 > totalData[0]):
		close(c, cursor)
		return errorMessage("已無資料可顯示"), 500

	attArray = []
	if (keyword == None):
		i = startAtt +1
		while (i < startAtt+13): 
			sql = 'SELECT A.*, Cat.category FROM attraction as A INNER JOIN attraction_category as Cat ON A.att_id = Cat.att_id where A.id = %s'
			startAttFrom = (i, )
			try:
				cursor.execute(sql, startAttFrom)
				result = cursor.fetchone()
			except:
				close(c, cursor)
				return errorMessage("關鍵字或頁數有誤"), 500

			if (not result):
				break
			
			attraction = {
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

			attArray.append(attraction)
			i+= 1
				
	if (keyword != None):
		i = startAtt
		sql = "SELECT A.*, Cat.category FROM attraction as A INNER JOIN attraction_category as Cat ON A.att_id = Cat.att_id where (A.name like %s or Cat.category = %s)"
		startAttFrom = ('%'+keyword+'%', keyword)

		try:
			cursor.execute(sql, startAttFrom)
			result = cursor.fetchall()
		except:
			close(c, cursor)
			return errorMessage("關鍵字或頁數有誤"), 500

		while (i < startAtt+12): 
			if (i > len(result)-1):
				break
			
			attraction = {
				'id': result[i][0],
				'name': result[i][2],
				'category': result[i][10],
				'description': result[i][8],
				'address':result[i][3],
				'direction': result[i][5],
				'mrt': result[i][4],
				'lat': float(result[i][7]),
				'lng': float(result[i][6]),
				'images': eval(result[i][9])
			}

			attArray.append(attraction)
			i+= 1

	if (attArray == []):
		close(c, cursor)
		return errorMessage("查無資料"), 500
	
	try:
		if (keyword == None):
			nextpage = int(page)+1 if int(page)+1 <= (totalData[0] //12) else None
		if (keyword != None):
			nextpage = int(page)+1 if int(page)+1 <= (len(result) //12) else None
		attractions = jsonify({
			'nextpage': nextpage,
			'data': attArray
		})
		return attractions

	finally:
		close(c, cursor)

@app.route("/api/attraction/<attractionId>")
def useIdFindAttraction(attractionId):
	try:
		c = conn()
		cursor = selectDb(c)
		sql = 'SELECT A.*, Cat.category FROM attraction as A INNER JOIN attraction_category as Cat ON A.att_id = Cat.att_id where A.id = %s'
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