import jwt, datetime
import os
from dotenv import load_dotenv
load_dotenv()
secretKey = os.getenv("jwtSecretKey")

def create_access_token(userId):
	payload = {
		'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),  # 過期時間
		'iat': datetime.datetime.utcnow(),  #  開始時間
		'data': {'userId': userId}
	}
	accessToken = jwt.encode(payload, secretKey , algorithm='HS256')
	return accessToken

def decode_token(token):
	try:
		payload = jwt.decode(token, secretKey, algorithms="HS256")
		if(payload):
			return payload
	except jwt.ExpiredSignatureError:
		return False
	except:
		return False