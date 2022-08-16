import os
import time
from flask import Flask
fibapp = Flask(__name__)
@fibapp.route('/') 
def index():
   # temp()
    return "Hello World!"

def temp():
    time.sleep(0.1)
    print("waited")
    return

if __name__ == '__main__':
    fibapp.run()