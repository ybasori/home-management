from  main.models import db

class Things(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(225), nullable = False)
    uid = db.Column(db.String(225), nullable = False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'uid': self.uid
        }