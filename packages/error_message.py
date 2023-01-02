from flask import jsonify 

def error_message(message):
	error = jsonify({
		"error": True,
		"message": message
	})
	return error