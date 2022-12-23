import sys
sys.path.append("../../")
from packages.database import *

class Booking:
	def save_user_booking_trip(data, userId):
		try:
			attractionId = data['attractionId']
			date = data['date']
			time = data['time']
		except:
			return None

		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
   			INSERT INTO 
      			user_booking (
					user_id, 
					att_id, 
					date, 
					time
			) 
			VALUES (%s, %s, %s, %s)
   			'''
			bookingInfo = (userId, attractionId, date, time) 
			cursor.execute(sql, bookingInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)

		return "已新增資料"

	def check_booking_Trip(userId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			SELECT  
				UO.payment_status
			FROM
				user_order AS UO
			RIGHT JOIN
				user_booking AS UB
				ON UO.booking_id = UB.id
			WHERE 
				UB.user_id = %s
			ORDER BY
				UB.created_at desc
			LIMIT
   				1
			'''
			userInfo = (userId, )
			cursor.execute(sql, userInfo)
			result = cursor.fetchone()
			
			#如果 payment_status 爲 Null 則代表尚未建立訂單
			if(not result['payment_status']):
				return True

			#如果 payment_status 爲 0 則代表尚未付款完成
			if (result['payment_status'] == 0):
				return True
			return False
		except:
			return False
		finally:
			close(c, cursor)
		

	def get_user_booking_trip(userId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			SELECT 
				UB.att_id, 
				A.name, 
				A.address, 
				AI.url,
				UB.date, 
				UB.time, 
				BP.price
			FROM
				user_booking AS UB 
			INNER JOIN 
				booking_price AS BP 
				ON UB.time = BP.time 
			INNER JOIN 
				attraction AS A 
				ON UB.att_id = A.id
			INNER JOIN 
				attraction_img AS AI 
				ON UB.att_id = AI.att_id
			WHERE 
				UB.user_id = %s
			ORDER BY
				UB.created_at desc
			LIMIT 
   				1
			'''
			userInfo = (userId, )
			cursor.execute(sql, userInfo)
			result = cursor.fetchone()
		except:
			return False
		finally:
			close(c, cursor)
   
		try:
			bookingInfo = {
				'data':{
				'attraction':{
					'id': result['att_id'],
					'name':result['name'],
					'address': result['address'],
					'image': result['url']
				},
				'date': result['date'],
				'time': result['time'],
				'price': result['price']
				}
			}
			return bookingInfo
		except:
			return False
			
	def delete_user_booking_trip(userId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
   			DELETE FROM 
      			user_booking
			WHERE 
   				user_id  = %s'''
			userInfo = (userId, )
			cursor.execute(sql, userInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)
			return True


    