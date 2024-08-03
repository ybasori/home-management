from flask import jsonify, request
from main.models import Things
from main.models import db


def things(flask_app):
      
    @flask_app.route('/api/v1/things', methods = ["GET", "POST"])
    def api_v1_things():
        if request.method == "GET":
            t = Things.Things.query.all()
            return jsonify({'welcome':'hi', 'data': [thing.to_dict() for thing in t]}), 200
        
        if request.method == "POST":
            t = Things.Things(name=request.form.get("name"))
            db.session.add(t)
            db.session.commit()
            return jsonify({'welcome':'hi', 'data': t.to_dict()}), 200