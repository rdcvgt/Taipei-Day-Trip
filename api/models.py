import sys
sys.path.append("..")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage

#搜尋出所有（符合條件）景點
def fetch_all_atts(keyword, startAtt):
	#判斷有無關鍵字來決定 sql 語句
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

	finally:
		close(c, cursor)
		return attArray, len(result)

#搜尋符合 ID 的單一景點
def fetch_one_attraction(attractionId):
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

	finally:
		close(c, cursor)
		return data

#找出所有景點分類
def fetch_categories():
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

	finally:
		close(c, cursor)
		return data