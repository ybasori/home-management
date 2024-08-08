#!python3
from flask import Flask
from flask_migrate import Migrate
import os
from main.models import db
from main.controllers.welcome import welcome
from main.controllers.api.v1.things import things
from main.controllers.api.v1.upload import upload


app = Flask(__name__, static_folder="dist", static_url_path="/static", template_folder="main/templates")
basedir = os.path.abspath(os.path.dirname(__file__))

app.add_url_rule(
    "/uploads/<name>", endpoint="download_file", build_only=True
)

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///"+os.path.join(basedir, "home-management.sqlite")
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, "storage")

db.init_app(app)
migrate = Migrate(app, db)

upload(app)
welcome(app)
things(app)




app.app_context().push()
if __name__ == '__main__':
    app.run(debug=True)

