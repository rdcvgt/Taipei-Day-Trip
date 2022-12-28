import sys
sys.path.append("../../")
from packages.database import *
from icecream import ic

class Order:
	#檢查是否有 booking 資訊，並回傳 booking_id
	def get_booking_id(userId, data):
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
			SELECT
				id 
			FROM 
				user_booking AS UB
			WHERE 
				user_id = %s and
				att_id = %s and
				date = %s and
				time = %s
			ORDER BY
				UB.created_at DESC
			LIMIT 1
			'''
			userInfo = (userId, att_id, date, time)
			cursor.execute(sql, userInfo)
			result = cursor.fetchone()
			if (not result):
				return None
			bookingId = result['id'] 
			return bookingId
		except:
			return None
		finally:
			close(c, cursor)


	# def check_order_id(bookingId):
	# 	try:
	# 		c = conn()
	# 		cursor = selectDb(c)
	# 		sql = '''
	# 		SELECT
	# 			order_id 
	# 		FROM 
	# 			user_order 
	# 		WHERE 
	# 			booking_id = %s;
	# 		'''
	# 		orderInfo = (bookingId, )
	# 		cursor.execute(sql, orderInfo)
	# 		result = cursor.fetchone()
	# 		if (not result):
	# 			return None
	# 		ic(result)
	# 		orderId = result['order_id']
	# 	except:
	# 		return None
	# 	finally:
	# 		close(c, cursor)
		
	# 	return orderId

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
   
	
	# def change_payment_status(orderId):
	# 	try:
	# 		c = conn()
	# 		cursor = selectDb(c)
	# 		sql = '''
	# 		UPDATE 
   	# 			user_order
	# 		SET 
   	# 			payment_status = %s
	# 		WHERE
   	# 			order_id= %s;
	# 		'''
	# 		orderInfo = (
	# 			1, orderId
	# 		)
	# 		cursor.execute(sql, orderInfo)
	# 		c.commit()
	# 	finally:
	# 		close(c, cursor)
   
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
				UB.date, 
				UB.time, 
				UO.name AS username, 
				UO.email,
				UO.phone, 
				P.status 
			FROM
				user_order AS UO
			INNER JOIN 
				user_booking AS UB 
				ON UO.booking_id = UB.id
			INNER JOIN
				attraction AS A 
				ON UB.att_id = A.id 
			INNER JOIN 
				attraction_img AS AM 
				ON UB.att_id = AM.att_id
			INNER JOIN 
				payment AS P 
				ON UO.booking_id = P.booking_id
			WHERE 
				UO.order_id = %s 
				and
				UB.user_id = %s
			ORDER BY 
				P.created_at DESC 
			LIMIT 1 ;
			'''
			orderData = (orderId, userId)
			cursor.execute(sql, orderData)
			result = cursor.fetchone()	
		finally:
			close(c, cursor)
   
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

   