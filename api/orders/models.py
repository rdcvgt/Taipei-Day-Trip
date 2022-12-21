import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage
from icecream import ic

class Order:
	#檢查是否有 booking 資訊，並回傳 booking_id
	def getBookingId(userId, data):
		try:		
			att_id = data['order']['trip']['attraction']['id']
			date = data['order']['trip']['date']
			time = data['order']['trip']['time']
		except:
			return None

		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			select
				id 
			from 
				user_booking as UB
			where 
				user_id = %s and
				att_id = %s and
				date = %s and
				time = %s
			order by
				UB.created_at desc
			limit 1
			'''
			userInfo = (userId, att_id, date, time)
			cursor.execute(sql, userInfo)
			result = cursor.fetchone()
			if (not result):
				return None

			bookingId = result[0] 
			return bookingId
		except:
			return None
		finally:
			close(c, cursor)


	def checkOrderId(bookingId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			select
				order_id 
			from 
				user_order 
			where 
				booking_id = %s;
			'''
			orderInfo = (bookingId, )
			cursor.execute(sql, orderInfo)
			result = cursor.fetchone()
			if (not result):
				return None

			orderId = result[0]
		except:
			return None
		finally:
			close(c, cursor)
		
		return orderId


	#儲存訂單，包含訂單編號、使用者資訊及付款狀況
	def saveOrder(bookingId, data, orderId):
		try:		
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
					booking_id, 
					order_id, 
					payment_status,
					name,
					email,
					phone
			)
			VALUES (
				%s, %s, %s, %s, %s, %s
			);
			'''
			orderInfo = (
				bookingId, 
				orderId, 
				0, 
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
	def savePaymentInfo(bookingId, paymentInfo):
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
					booking_id, 
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
				bookingId, 
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

	def saveFailPaymentInfo(bookingId, paymentInfo):
		status = paymentInfo['status']
		message = paymentInfo['msg']		

		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			INSERT INTO 
				payment (
					booking_id, 
					status, 
					message
			)
			VALUES (
				%s, %s, %s
			);
			'''
			paymentInfo = (
				bookingId, 
				status, 
				message
			)
			cursor.execute(sql, paymentInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)
   
	
	def changePaymentStatus(orderId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			UPDATE 
   				user_order
			SET 
   				payment_status = %s
			WHERE
   				order_id= %s;
			'''
			orderInfo = (
				1, orderId
			)
			cursor.execute(sql, orderInfo)
			c.commit()
		finally:
			close(c, cursor)
   
	def getOrderInfo(userId, orderId):
		try:
			c = conn()
			cursor = c.cursor(dictionary=True)
			cursor.execute("use taipei_trip;") 
			sql = '''
			select 
				A.id,
				A.name, 
				A.address, 
				AM.url, 
				UB.date, 
				UB.time, 
				UO.name as username, 
				UO.email,
				UO.phone, 
				P.status 
			from
				user_order as UO
			inner join 
				user_booking as UB 
				on UO.booking_id = UB.id
			inner join
				attraction as A 
				on UB.att_id = A.id 
			inner join 
				attraction_img as AM 
				on UB.att_id = AM.att_id
			inner join 
				payment as P 
				on UO.booking_id = P.booking_id
			where 
				UO.order_id = %s 
				and
				UB.user_id = %s
			order by 
				P.created_at desc 
			limit 1 ;
			'''
			orderData = (orderId, userId)
			cursor.execute(sql, orderData)
			result = cursor.fetchone()	
			
			if (not result):
				orderInfo = {
					"data": None
				}
				return orderInfo
			orderInfo = {
				"data": {
					"number": orderId,
					"price": 2000 if result['time'] == 'morning' else 2500,
					"trip": {
					"attraction": {
						"id": result['id'],
						"name": result['name'],
						"address": result['address'],
						"image": result['url']
					},
					"date": result['date'],
					"time": result['time']
					},
					"contact": {
					"name": result['username'],
					"email": result['email'],
					"phone": result['phone']
					},
					"status": result['status']
				}
			}
			return orderInfo
		finally:
			close(c, cursor)
   