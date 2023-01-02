import sys
sys.path.append("../../")
from packages.database import *

class Attraction:
	#搜尋出所有（符合條件）景點
	def get_all_attractions(keyword, startAtt):
		#判斷有無關鍵字來決定 sql 語句
		if (keyword == None):
			sql = '''
   			SELECT 
      			A.*, 
         		C.category,
           		M.mrt, 
             	I.url
			FROM 
   				attraction AS A
			INNER JOIN 
   				attraction_category AS C 
				ON A.id = C.att_id
			INNER JOIN 
   				attraction_mrt AS M
				ON A.id = M.att_id
			RIGHT JOIN (
				SELECT 
					att_id, 
					GROUP_CONCAT(url) AS url 
				FROM 
					attraction_img 
				GROUP BY att_id
         	) AS I
				ON A.id = I.att_id
			LIMIT
   				%s, 13
   			'''
			startAttFrom = (startAtt, )

		if (keyword != None):
			sql = '''
   			SELECT 
      			A.*, 
         		C.category, 
           		M.mrt, I.url
			FROM 
   				attraction AS A
			INNER JOIN 
   				attraction_category AS C 
				ON A.id = C.att_id
			INNER JOIN 
   				attraction_mrt AS M
				ON A.id = M.att_id
			RIGHT JOIN (
				SELECT 
					att_id, 
					GROUP_CONCAT(url) AS url 
				FROM 
					attraction_img 
				GROUP BY
					att_id
         	) AS I
				ON A.id = I.att_id
			WHERE (
       			A.name LIKE %s OR 
            	C.category = %s
            ) 
			LIMIT 
   				%s, 13
       		'''
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
					'id': result[start]['id'],
					'name': result[start]['name'],
					'category': result[start]['category'],
					'description': result[start]['description'],
					'address':result[start]['address'],
					'direction': result[start]['direction'],
					'mrt': result[start]['mrt'],
					'lat': float(result[start]['latitude']),
					'lng': float(result[start]['longitude']),
					'images':(result[start]['url']).split(',')
				}
				attArray.append(attraction)
				start+= 1
			return attArray, len(result)
		except:
			return False	
		finally:
			
			close(c, cursor)
			

	#搜尋符合 ID 的單一景點
	def get_one_attraction(attractionId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
   			SELECT 
      			A.*, 
         		C.category, 
           		M.mrt, 
             	I.url
			FROM 
   				attraction AS A
			INNER JOIN 
   				attraction_category AS C 
				ON A.id = C.att_id
			INNER JOIN 
   				attraction_mrt AS M
				ON A.id = M.att_id
			RIGHT JOIN (
       			SELECT 
          			att_id, 
             		GROUP_CONCAT(url) AS url 
				FROM 
					attraction_img 
     			GROUP BY
        			att_id
        	) AS I
				ON A.id = I.att_id
			WHERE 
   				A.id = %s
       		'''
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
				'id': result['id'],
				'name': result['name'],
				'category': result['category'],
				'description': result['description'],
				'address':result['address'],
				'direction': result['direction'],
				'mrt': result['mrt'],
				'lat': float(result['latitude']),
				'lng': float(result['longitude']),
				'images':result['url'].split(',')
			}
			return attraction
			
		except TypeError:
			return None
		except:
			return False		


	#找出所有景點分類
	def get_categories():
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
   			SELECT 
      			DISTINCT category 
         	FROM 
          		attraction_category
            '''
			cursor.execute(sql)
			result = cursor.fetchall()
			data = []
			for i in result:
				data.append(i['category'])
		except:
			return False
		finally:
			close(c, cursor)
			return data