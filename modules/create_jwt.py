import jwt
import datetime
from icecream import ic
import os
from dotenv import load_dotenv
load_dotenv()
secretKey = os.getenv("jwtSecretKey")


def createAccessToken(email):
	payload = {
		'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=10),  # 過期時間
		'iat': datetime.datetime.utcnow(),  #  開始時間
		'data': {'name': email}
	}
	
	accessToken = jwt.encode(payload, secretKey, algorithm='HS256')
	return accessToken


def createRefreshToken(userId):
	payload = {
		'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),  # 過期時間
		'iat': datetime.datetime.utcnow(),  #  開始時間
		'data': {'userId': userId}
	}
	refreshToken = jwt.encode(payload, secretKey , algorithm='HS256')
	return refreshToken

def decodeToken(token):
	try:
		payload = jwt.decode(token, secretKey, algorithms="HS256")
		if(payload):
			return payload
	except jwt.ExpiredSignatureError:
		return False
	except:
		return False