from flask import *
import json
from modules.connect_to_db import conn, selectDb, close
from modules.error_message import errorMessage
from api.attraction.attraction import api_attraction_bp
from api.auth.auth import api_auth_bp
from api.booking.booking import api_booking_bp
from api.orders.orders import api_orders_bp



app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

#api_bp
app.register_blueprint(api_attraction_bp)
app.register_blueprint(api_auth_bp)
app.register_blueprint(api_booking_bp)
app.register_blueprint(api_orders_bp)



# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

app.run(port=3000)