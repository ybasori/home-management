from flask import jsonify, request
from main.models import Things
from main.models import Prefs
from main.models import db
import uuid
from sqlalchemy import desc


def things(app):
      
    @app.route('/api/v1/things', methods = ["GET", "POST", "DELETE"])
    def api_v1_things():
        if request.method == "GET":
            t = Things.Things.query.filter_by(parent_id=None).order_by(desc(Things.Things.created_at)).all()
            ti = []
            for thing in t:
                p = Prefs.Prefs.query.filter_by(things_id=thing.id).all()
                ti.append({'name': thing.name, 'uid': thing.uid, 'prefs': [pf.to_dict() for pf in p]})
            return jsonify({'welcome':'hi', 'data': [thing for thing in ti]}), 200
        
        if request.method == "POST":
            t = Things.Things(name=request.form.get("name"), uid=str(uuid.uuid4()))
            if request.form.get("parent_uid") != None:
                parent_uid = request.form.get("parent_uid")
                tparent = Things.Things.query.filter_by(uid=parent_uid).first() 
                t.parent_id = tparent.id 
            db.session.add(t)
            db.session.commit()
            ti=[]
            p = Prefs.Prefs.query.filter_by(things_id=t.id).all()
            ti.append({'name': t.name, 'uid': t.uid, 'prefs': [pf.to_dict() for pf in p]})
            return jsonify({'welcome':'hi', 'data': ti[0]}), 200
        

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
            p = Prefs.Prefs.query.filter_by(things_id=t.id).all()
            for pref in p:
                pt = Prefs.Prefs.query.filter_by(id=pref.id).first()
                db.session.delete(pt)
            prefs_input = request.form.getlist("prefs[]")
            if prefs_input != None:
                for pi in prefs_input:
                    pu = Prefs.Prefs(things_id=t.id, value=pi, uid=str(uuid.uuid4()))
                    db.session.add(pu)

            db.session.commit()
            return jsonify({'welcome':'hi', 'data': t.to_dict()}), 200
        
        if request.method == "GET":
            tp = Things.Things.query.filter_by(uid=uid).first()
            t = Things.Things.query.filter_by(parent_id=tp.id).order_by(desc(Things.Things.created_at)).all()
            ti = []
            for thing in t:
                p = Prefs.Prefs.query.filter_by(things_id=thing.id).all()
                ti.append({'name': thing.name, 'uid': thing.uid, 'prefs': [pf.to_dict() for pf in p]})
            return jsonify({'welcome':'hi', 'data': [thing for thing in ti]}), 200