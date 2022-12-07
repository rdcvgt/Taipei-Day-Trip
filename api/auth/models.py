from flask import jsonify
import mysql.connector
import re  #regex
import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close

class UserData:
	#加入新註冊資料
	def post(name, email, hashed_password):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''insert into user (name, email, password) 
			values (%s, %s, %s)'''
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
	def get(isValidToken):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''select id, name, email from user where id = %s '''
			userId = isValidToken['data']['userId']
			userInfo = (userId,) 
			cursor.execute(sql, userInfo)
			result = cursor.fetchone() 
			data = {
				'id': result[0],
				'name': result[1],
				'email': result[2]
			}
			return data	
		except:
			return False
		finally:
			close(c, cursor)

	#查詢使用者登入資訊
	def put(email):
		try:
			c = conn()
			cursor = selectDb(c)
			sql = '''select password, id from user where email = %s '''
			userInfo = (email,) 
			cursor.execute(sql, userInfo)
			result = cursor.fetchone()
			return result
		except :
			return "伺服器問題"
		finally:
			close(c, cursor)


class Regex:
	def emailIsValid(email):
		regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
		if re.fullmatch(regex, email):
			return True
		return False

	# def nameIsValid(name):
	# 	regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
	# 	if re.fullmatch(regex, name):
	# 		return True
	# 	return False