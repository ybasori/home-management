#!python3
from flask import Flask
from flask_migrate import Migrate
import os
from main.models import db
from main.controllers.welcome import welcome
from main.controllers.api.v1.things import things
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = '/path/to/the/uploads'

app = Flask(__name__, static_folder="dist", static_url_path="/static", template_folder="main/templates")
basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///"+os.path.join(basedir, "home-management.sqlite")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db.init_app(app)
migrate = Migrate(app, db)

welcome(app)
things(app)




app.app_context().push()
if __name__ == '__main__':
    app.run(debug=True)

