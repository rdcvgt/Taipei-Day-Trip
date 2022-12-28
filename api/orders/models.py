import sys
sys.path.append("../../")
from packages.database import *
from icecream import ic

class Order:
	def save_order_bookings(bookingId,orderId):
		try:
			c = conn()
			cursor = selectDb(c)
			for oneBkId in bookingId:
				sql = '''
				INSERT INTO 
					order_bookings (
						order_id, 
						booking_id
				)
				VALUES (
					%s, %s
				);
				'''
				orderInfo = (
					orderId, 
					oneBkId
				)
				cursor.execute(sql, orderInfo)
				c.commit()
		except:
			return False
		finally:
			close(c, cursor)
   

	#儲存訂單，包含訂單編號、使用者資訊及付款狀況
	def save_order(paymentStatus, data, orderId):
		try:		
			status = 1 if paymentStatus == 0 else 1
			email = data['contact']['email']
			name = data['contact']['name']
			phone = data['contact']['phone']
		except:
			return None

		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			INSERT INTO 
				user_order (
					order_id, 
					payment_status,
					name,
					email,
					phone
			)
			VALUES (
				%s, %s, %s, %s, %s
			);
			'''
			orderInfo = (
				orderId, 
				status, 
				name,
				email, 
				phone
			)
			cursor.execute(sql, orderInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)

		return True

	#儲存交易資訊
	def save_payment_info(orderId, paymentInfo):
		status = paymentInfo['status']
		message = paymentInfo['msg']		
		rec_trade_id = paymentInfo['rec_trade_id'] 
		bank_transaction_id = paymentInfo['bank_transaction_id']
		auth_code = paymentInfo['auth_code']
		transaction_time_millis = paymentInfo['transaction_time_millis']

		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			INSERT INTO 
				payment (
					order_id, 
					status, 
					message,
					rec_trade_id,
					bank_transaction_id,
					auth_code,
					transaction_time_millis
			)
			VALUES (
				%s, %s, %s, %s, %s, %s, %s
			);
			'''
			paymentInfo = (
				orderId, 
				status, 
				message,
				rec_trade_id, 
				bank_transaction_id,
				auth_code, 
				transaction_time_millis
			)
			cursor.execute(sql, paymentInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)

	def save_fail_payment_info(orderId, paymentInfo):
		status = paymentInfo['status']
		message = paymentInfo['msg']		

		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			INSERT INTO 
				payment (
					order_id, 
					status, 
					message
			)
			VALUES (
				%s, %s, %s
			);
			'''
			paymentInfo = (
				orderId, 
				status, 
				message
			)
			cursor.execute(sql, paymentInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)
   
	def get_order_info(userId, orderId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
				SELECT 
					A.id,
					A.name, 
					A.address, 
					AM.url,
					UB.id AS ubID,
					UB.date, 
					UB.time, 
					UO.name AS username, 
					UO.email,
					UO.phone, 
					P.status 
				FROM
					attraction AS A, 
					user_booking AS UB,
					order_bookings AS OB, 
					user_order AS UO,
					payment AS P,
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
					) AS AM
				WHERE
					A.id = UB.att_id 
				AND
					AM.att_id = UB.att_id
				AND
					UB.id = OB.booking_id
				AND
					OB.order_id = UO.order_id
				AND
					UO.order_id = P.order_id
				AND
					UO.order_id = %s
				AND
					UB.user_id = %s
				ORDER BY 
					P.created_at DESC 
			'''
			orderData = (userId, orderId, userId)
			cursor.execute(sql, orderData)
			result = cursor.fetchall()	
		finally:
			close(c, cursor)
   
		if (not result):
			orderInfo = {
				"data": None
			}
			return orderInfo
		bookings = []
		for booking in result:
			data = {
				"price": 2000 if booking['time'] == 'morning' else 2500,
				"trip": {
				"attraction": {
					"id": booking['id'],
					"name": booking['name'],
					"address": booking['address'],
					"image": booking['url']
				},
				"bookingId": booking['ubID'],
				"date": booking['date'],
				"time": booking['time']
				}
			}
			bookings.append(data)

		orderInfo = {
			'data':bookings,
          	"contact": {
				"name": result[0]['username'],
				"email": result[0]['email'],
				"phone": result[0]['phone']
			},
			"status": result[0]['status'],
			"number": orderId
		}
		return orderInfo

   