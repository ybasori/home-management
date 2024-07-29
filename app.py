#!python3

from flask import Flask
from controllers.welcome import welcome
from controllers.api.v1.laundry import laundry

app = Flask(__name__)

welcome(app)
laundry(app)

if __name__ == '__main__':
    app.run()