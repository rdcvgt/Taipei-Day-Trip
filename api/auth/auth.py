from flask import Blueprint
from flask import jsonify
from flask import request


from .models import *
import sys
sys.path.append("../../")
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage


api_auth_bp = Blueprint('api_auth_bp', __name__)




# API
@api_auth_bp.route("/api/user", methods=['POST'])
def getUserSignUpData():
	data = request.json
	return handleUserSignUpData(data)
	

@api_auth_bp.route("/api/user/auth", methods=['GET'])
def getUserData():
	data = request.headers.get('authorization')
	token = data.split()[1]
	return handleValidateStatus(token)

@api_auth_bp.route("/api/user/auth", methods=['PUT'])
def getUserSignInData():
	data = request.json
	return handleUserSignInData(data)

@api_auth_bp.route("/api/user/auth", methods=['DELETE'])
def deleteUserData():
	data = request.headers.get('authorization')
	token = data.split()[1]
	return handleLogout(token)


	