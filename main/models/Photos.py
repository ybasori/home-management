from  main.models import db

class Photos(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    things_id = db.Column(db.Integer, nullable = False)
    uid = db.Column(db.String(225), nullable = False)
    filename = db.Column(db.String(225), nullable = False)
    main = db.Column(db.Integer(), nullable = True)
    description = db.Column(db.Text, nullable = True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    
    def to_dict(self):
        return {
            'uid': self.uid,
            'filename': self.filename,
            'main': self.main,
            'description': self.description
        }