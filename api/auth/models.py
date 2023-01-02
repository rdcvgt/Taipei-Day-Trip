import mysql.connector

import sys
sys.path.append("../../")
from packages.database import *

from icecream import ic


class UserData:
	#加入新註冊資料
	def save_new_user_data(name, email, hashed_password):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
   			INSERT INTO 
      			user (
             		name, 
               		email, 
                 	password
                ) 
			VALUES 
   				(%s, %s, %s)
   			'''
			userInfo = (name, email, hashed_password) 
			cursor.execute(sql, userInfo)
			c.commit()
		except mysql.connector.Error:
			return "重複註冊"
		except:
			return "伺服器問題"
		finally:
			close(c, cursor)
		return True

	#查詢 request 資料
	def get_user_data_by_id(isValidToken):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
   			SELECT 
      			id, 
         		name, 
           		email,
				phone_number,
				user_photo
        	FROM 
         		user 
           	WHERE 
            	id = %s
            '''
			userId = isValidToken['data']['userId']
			userInfo = (userId,) 
			cursor.execute(sql, userInfo)
			result = cursor.fetchone() 
			data = {
				'id': result['id'],
				'name': result['name'],
				'email': result['email'],
				'phone': result['phone_number'],
				'photo': result['user_photo']
			}
			return data	
		except:
			return False
		finally:
			close(c, cursor)
   
	def get_booking_count(userId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			SELECT 
				COUNT(UB.id) 
			FROM
				user_booking AS UB 
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
            '''
			userInfo = (userId,) 
			cursor.execute(sql, userInfo)
			result = cursor.fetchone() 
			count = result['COUNT(UB.id)']
			return count	
		except:
			return False
		finally:
			close(c, cursor)
        

	#查詢使用者登入資訊
	def get_user_data_by_email(email):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
   			SELECT 
      			password, 
         		id 
           	FROM 
            	user 
            WHERE 
            	email = %s
            '''
			userInfo = (email,) 
			cursor.execute(sql, userInfo)
			result = cursor.fetchone()
			return result
		except :
			return "伺服器問題"
		finally:
			close(c, cursor)




	# def nameIsValid(name):
	# 	regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
	# 	if re.fullmatch(regex, name):
	# 		return True
	# 	return False