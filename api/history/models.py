import sys
sys.path.append("../../")
from packages.database import *
from datetime import date
from icecream import ic

class History:
	def get_orders_by_date(userId, orderStatus):  
		try:
			c = conn()
			cursor = selectDb(c)
			sql1 = '''
			SELECT 
				UB.id,
				UB.att_id, 
				A.name, 
				A.address, 
				I.*,
				UB.date, 
				UB.time,
				UO.name AS username,
				OB.order_id
			FROM
				user_booking AS UB,
				attraction as A, 
				order_bookings AS OB,
				user_order AS UO,
				(
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
			WHERE 
				UB.user_id = %s 
			AND
				UB.att_id = A.id
			AND
				UB.att_id = I.att_id
			AND
				UB.id = OB.booking_id
			AND
				OB.order_id = UO.order_id
			'''
			sqlForUpcoming = '''
				AND
					UB.date >= %s
				ORDER BY
					UB.date,
					UB.time DESC,
					A.name   
   			'''
      
			sqlForPast = '''
				AND
					UB.date < %s
				ORDER BY
					UB.date DESC,
					UB.time DESC,
					A.name   
   			'''
			sql = sql1 + sqlForUpcoming if orderStatus == 'upcoming' else sql1 + sqlForPast
			today = date.today()
			d1 = today.strftime("%Y-%m-%d")	
			userInfo = (userId, userId, d1)
			cursor.execute(sql, userInfo)
			result = cursor.fetchall()
		except:
			return False
		finally:
			close(c, cursor)
		
		try:
			dates = []
			data = []
			for order in result:
				if order['date'] not in dates:
					dates.append(order['date'])
       
				attData = {
				"attraction": {
					"id": order['att_id'],
					"name":  order['name'],
					"address": order['address'],
					"image": order['url']
				},
				"bookingId": order['id'],
				"orderId": order['order_id'],
				"date": order['date'],
				"time": order['time'],
				"username": order['username']
				}
				data.append(attData)
    
			orderInfo = {
				'dates': dates,
				'data': data
			}
			return orderInfo
		except:
			return False
			


    