import sys
sys.path.append("../../")
from packages.database import *

from icecream import ic

class Settings:
	def save_user_photo_name(userId, filename):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			UPDATE 
   				user
			SET 
   				user_photo = %s
			WHERE 
   				id = %s;
   			'''
			userInfo = (filename, userId) 
			cursor.execute(sql, userInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)

		return True

	def get_user_data(userId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			SELECT 
				name, 
				email,
				phone_number,
				user_photo
			FROM
				user
			WHERE
				id = %s
   			'''
			userInfo = (userId,) 
			cursor.execute(sql, userInfo)
			result = cursor.fetchone() 
		except:
			return False
		finally:
			close(c, cursor)

		data = {
			'name' : result['name'],
			'email' : result['email'],
			'phone' : result['phone_number'],
			'photo' : result['user_photo']
		}
		return data

	def get_user_photo(userId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			SELECT 
				user_photo
			FROM
				user
			WHERE
				id = %s
       		'''
			userInfo = (userId,)
			cursor.execute(sql, userInfo)
			result = cursor.fetchone() 
			filename = result['user_photo']
		except:
			return False
		finally:
			close(c, cursor)
			return filename
			
	def update_user_photo_to_null(userId):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			UPDATE 
				user 
			SET 
				user_photo = NULL
			WHERE
				id = %s
       		'''
			userInfo = (userId,)
			cursor.execute(sql, userInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)
			return True

	def update_user_data(userId, userData):
		name = userData['name']
		email = userData['email']
		phone = userData['phone']
     
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''
			UPDATE 
				user
			SET 
				name = %s, 
				email = %s, 
				phone_number = %s
			WHERE 
				id = %s
       		'''
			userInfo = (name, email, phone, userId)
			cursor.execute(sql, userInfo)
			c.commit()
		except:
			return False
		finally:
			close(c, cursor)
			return True
    