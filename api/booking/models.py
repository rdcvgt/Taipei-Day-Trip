import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage
from icecream import ic

class Booking:
	def saveUserBookingTrip(data, userId):
		try:
			attractionId = data['attractionId']
			date = data['date']
			time = data['time']
		except:
			return None

		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''insert into user_booking 
			(
				user_id, 
				att_id, 
				date, 
				time
			) 
				values (%s, %s, %s, %s)'''
			bookingInfo = (userId, attractionId, date, time) 
			cursor.execute(sql, bookingInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)

		return "已新增資料"

	def checkBookingTrip(userId):
		try:
			c = conn()
			cursor = c.cursor(dictionary=True)
			cursor.execute("use taipei_trip;") 
			sql = '''
			select 
				UO.payment_status
			from
				user_order as UO
			right join
				user_booking as UB
				on UO.booking_id = UB.id
			where 
				UB.user_id = %s
			order by
				UB.created_at desc
			limit 1
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
		

	def getUserBookingTrip(userId):
		try:
			c = conn()
			cursor = c.cursor(dictionary=True)
			cursor.execute("use taipei_trip;") 
			sql = '''
			select 
				UB.att_id, 
				A.name, 
				A.address, 
				AI.url,
				UB.date, 
				UB.time, 
				BP.price
			from
				user_booking as UB 
			inner join 
				booking_price as BP 
				on UB.time = BP.time 
			inner join 
				attraction as A 
				on UB.att_id = A.id
			inner join 
				attraction_img as AI 
				on UB.att_id = AI.att_id
			where 
				UB.user_id = %s
			order by
				UB.created_at desc
			limit 1
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
			
	def deleteUserBookingTrip(userId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''delete from user_booking
			where user_id  = %s'''
			userInfo = (userId, )
			cursor.execute(sql, userInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)
			return True


    