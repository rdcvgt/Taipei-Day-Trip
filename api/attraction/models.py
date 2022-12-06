import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage
from icecream import ic

class Attraction:
	#搜尋出所有（符合條件）景點
	def fetch_all(keyword, startAtt):
		#判斷有無關鍵字來決定 sql 語句
		if (keyword == None):
			sql = '''SELECT A.*, C.category, M.mrt, I.url
			FROM attraction as A
			INNER JOIN attraction_category as C 
			ON A.id = C.att_id
			INNER JOIN attraction_mrt as M
			ON A.id = M.att_id
			RIGHT JOIN ( SELECT att_id, GROUP_CONCAT(url) as url 
			FROM attraction_img GROUP BY att_id) as I
			ON A.id = I.att_id
			limit %s, 13'''
			startAttFrom = (startAtt, )

		if (keyword != None):
			sql = '''SELECT A.*, C.category, M.mrt, I.url
			FROM attraction as A
			INNER JOIN attraction_category as C 
			ON A.id = C.att_id
			INNER JOIN attraction_mrt as M
			ON A.id = M.att_id
			RIGHT JOIN ( SELECT att_id, GROUP_CONCAT(url) as url 
			FROM attraction_img GROUP BY att_id) as I
			ON A.id = I.att_id
			where (A.name like %s or C.category = %s) 
			limit %s, 13'''
			startAttFrom = ('%'+keyword+'%', keyword, startAtt)

		try:
			c = conn()
			cursor = selectDb(c)
			cursor.execute(sql, startAttFrom)
			result = cursor.fetchall()
			attArray = []
			imgUrlArr = []
			start = 0
			end = 12
			while (start < end): 
				if (start > len(result)-1):  #當索引值大於資料長度
					break
				attraction = {
					'id': result[start][0],
					'name': result[start][1],
					'category': result[start][7],
					'description': result[start][6],
					'address':result[start][2],
					'direction': result[start][3],
					'mrt': result[start][8],
					'lat': float(result[start][5]),
					'lng': float(result[start][4]),
					'images':(result[start][9]).split(',')
				}
				attArray.append(attraction)
				start+= 1
			return attArray, len(result)
		except:
			return False	
		finally:
			close(c, cursor)
			

	#搜尋符合 ID 的單一景點
	def fetch_one(attractionId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''SELECT A.*, C.category, M.mrt, I.url
			FROM attraction as A
			INNER JOIN attraction_category as C 
			ON A.id = C.att_id
			INNER JOIN attraction_mrt as M
			ON A.id = M.att_id
			RIGHT JOIN ( SELECT att_id, GROUP_CONCAT(url) as url 
			FROM attraction_img GROUP BY att_id) as I
			ON A.id = I.att_id
			where A.id = %s'''
			attId = (int(attractionId), )
			cursor.execute(sql, attId)
			result = cursor.fetchone()
		except ValueError:
			return "編號錯誤"
		except:
			return False
		finally:
			close(c, cursor)
		
		try:
			attraction = {
				'id': result[0],
				'name': result[1],
				'category': result[7],
				'description': result[6],
				'address':result[2],
				'direction': result[3],
				'mrt': result[8],
				'lat': float(result[5]),
				'lng': float(result[4]),
				'images':result[9].split(',')
			}
			return attraction
		except TypeError:
			return None
		except:
			return False		


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
			return False
		finally:
			close(c, cursor)
			return data