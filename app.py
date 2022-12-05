from flask import *
import json
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage
from api.attraction.attraction import api_attraction_bp
from api.auth.auth import api_auth_bp


app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

#api_bp
app.register_blueprint(api_attraction_bp)
app.register_blueprint(api_auth_bp)


# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

app.run(port=3000)