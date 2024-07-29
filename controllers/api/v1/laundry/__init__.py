from flask import jsonify

def laundry(app):
    @app.route('/api/v1/laundry', methods = ["GET"])
    def index():
        return jsonify({'welcome':'hi'}), 400