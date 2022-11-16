from flask import *
import json

def errorMessage(message):
	error = jsonify({
		"error": True,
		"message": message
	})
	return error