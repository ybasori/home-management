from flask import jsonify, request
from main.models import Things
from main.models import db
import uuid
from sqlalchemy import desc


def things(app):
      
    @app.route('/api/v1/things', methods = ["GET", "POST", "DELETE"])
    def api_v1_things():
        if request.method == "GET":
            t = Things.Things.query.filter_by(parent_id=None).order_by(desc(Things.Things.created_at)).all()
            return jsonify({'welcome':'hi', 'data': [thing.to_dict() for thing in t]}), 200
        
        if request.method == "POST":
            t = Things.Things(name=request.form.get("name"), uid=str(uuid.uuid4()))
            if request.form.get("parent_uid") != None:
                parent_uid = request.form.get("parent_uid")
                tparent = Things.Things.query.filter_by(uid=parent_uid).first() 
                t.parent_id = tparent.id 
            db.session.add(t)
            db.session.commit()
            return jsonify({'welcome':'hi', 'data': t.to_dict()}), 200
        

        if request.method == "DELETE":
            for uid in request.get_json()['uid']:
                t = Things.Things.query.filter_by(uid=uid).first()
                db.session.delete(t)
                db.session.commit()
            return jsonify({'welcome':'hi'}), 200
    @app.route('/api/v1/things/<uid>', methods = ["PUT", "GET"])

    def api_v1_things_uid(uid):

        if request.method == "PUT":
            t = Things.Things.query.filter_by(uid=uid).first()
            t.name = request.form.get("name")
            if request.form.get("parent_uid") != None:
                parent_uid = request.form.get("parent_uid")
                if parent_uid == "null":
                    t.parent_id = None
                else:
                    tparent = Things.Things.query.filter_by(uid=parent_uid).first() 
                    t.parent_id = tparent.id 
            db.session.commit()
            return jsonify({'welcome':'hi', 'data': t.to_dict()}), 200
        
        if request.method == "GET":
            tp = Things.Things.query.filter_by(uid=uid).first()
            t = Things.Things.query.filter_by(parent_id=tp.id).order_by(desc(Things.Things.created_at)).all()
            return jsonify({'welcome':'hi', 'data': [thing.to_dict() for thing in t]}), 200