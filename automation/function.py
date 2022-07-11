import os
from flask import Flask
fibapp = Flask(__name__)
@fibapp.route('/') 
def index():
    return "Hello World!"

if __name__ == '__main__':
    fibapp.run()