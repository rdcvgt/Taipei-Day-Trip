from flask import *
import mysql.connector
from mysql.connector import pooling  
# import DbPassword from .password 

import os
from dotenv import load_dotenv
load_dotenv()
DbPassword = os.getenv("DbPassword")


poolname ="mysqlpool" 
poolsize = 5   
connectionpool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name =poolname,    
		pool_size=poolsize,    
		pool_reset_session=True, 
		host='localhost',
		user='root',
		password= DbPassword
)

def conn(): 
    try:
        c = connectionpool.get_connection()
        return c
    except:
        print ("connection error")
        exit(1)

def selectDb(c):
    cursor = c.cursor(dictionary=True)
    cursor.execute("use taipei_trip;") 
    return cursor

def close(c, cursor):
    cursor.close()
    c.close()  