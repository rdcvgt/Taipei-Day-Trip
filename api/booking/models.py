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

	def get_user_booking_trip(userId):
		try:
			c = conn()
			cursor = selectDb(c)
			#選擇出使用者預訂景點資訊，
  			#需符合使用者 id 並且該預訂行程尚未建立訂單
			#或是已建立訂單但付款尚未成功
			sql = '''
			SELECT 
				UB.id,
				UB.att_id, 
				A.name, 
				A.address, 
				I.*,
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
			RIGHT JOIN (
				SELECT 
					AI.att_id,
					MAX(AI.url) as url
				FROM 
					attraction_img AS AI
				INNER JOIN
					user_booking AS UB
					ON UB.att_id = AI.att_id
				WHERE 
					UB.user_id = %s
				GROUP BY	
					AI.att_id
			) AS I
				ON UB.att_id = I.att_id
			WHERE 
				UB.user_id = %s 
    		AND
				(UB.id NOT IN (
					SELECT 
						booking_id 
					FROM 
						order_bookings
				) 
    		OR
				UB.id IN(
					SELECT id FROM (
						SELECT
							UB.id,
							OB.order_id,
							UO.payment_status
						FROM 
							user_order AS UO,
							user_booking AS UB,
							order_bookings AS OB
						WHERE
							UO.order_id = OB.order_id AND
							OB.booking_id = UB.id
						ORDER BY
							OB.created_at DESC
						LIMIT 1
					) AS P 
					WHERE 
						P.payment_status = 0
				))
			ORDER BY
				UB.created_at DESC
			'''
			userInfo = (userId, userId )
			cursor.execute(sql, userInfo)
			result = cursor.fetchall()
		except:
			return False
		finally:
			close(c, cursor)
   
		try:
			data = []
			for att in result:
				attData = {
				'bookingId':att['id'],
				'attraction':{
					'id': att['att_id'],
					'name':att['name'],
					'address': att['address'],
					'image': att['url']
				},
				'date': att['date'],
				'time': att['time'],
				'price': att['price']
				}
				data.append(attData)
    
			bookingInfo = {
				'data': data
			}
			return bookingInfo

			
		except:
			return False
			
	def delete_user_booking_trip(userId, bookingId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
   			DELETE FROM 
      			user_booking
			WHERE 
   				user_id = %s and
				id = %s
       		'''
			userInfo = (userId, bookingId)
			cursor.execute(sql, userInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)
			return True


    