#!python3
from flask import Flask, jsonify
import os
from main.models import db
from main.controllers.welcome import welcome
from main.controllers.api.v1.things import things

# db.init_app(app)


app = Flask(__name__, static_folder="dist", static_url_path="/static", template_folder="main/templates")
basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///"+os.path.join(basedir, "db.sqlite")

db.init_app(app)

welcome(app)
things(app)


app.app_context().push()
if __name__ == '__main__':
    app.run(debug=True)

