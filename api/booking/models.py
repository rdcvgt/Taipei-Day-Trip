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
			sql = '''select * 
			from 
				user_booking 
			where 
				user_id = %s'''
			userInfo = (userId, )
			cursor.execute(sql, userInfo)
			result = cursor.fetchone()
		except:
			return False
		finally:
			close(c, cursor)

		try:
			c = conn()
			cursor = selectDb(c)
			if (result != None):
				sql = '''update user_booking 
				set 
					att_id = %s, 
					date = %s, 
					time = %s 
				where 
					user_id = %s'''
				bookingInfo = (attractionId, date, time, userId)
				cursor.execute(sql, bookingInfo)
				c.commit()
				return "已更新資料"
		except:
			return False
		finally:
			close(c, cursor)

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

	def getUserBookingTrip(userId):
		try:
			c = conn()
			cursor = selectDb(c)
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
					'id': int(result[0]),
					'name':result[1],
					'address': result[2],
					'image': result[3]
				},
				'date': result[4],
				'time': result[5],
				'price': int(result[6])
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


    