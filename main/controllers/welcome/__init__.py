
from flask import render_template

def welcome(app):
    
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def index(path):
        return render_template('layout.html')