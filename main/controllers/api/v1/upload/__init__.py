from flask import jsonify, request, send_from_directory, url_for
from werkzeug.utils import secure_filename
from main.models import db, Photos
import os


ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload(app):
    @app.route('/api/v1/upload', methods=['POST'])
    def upload_file():
        if request.method == 'POST':
            # check if the post request has the file part
            if 'file' not in request.files:
                return jsonify({"msg": "No file part"}), 400
            file = request.files['file']
            # If the user does not select a file, the browser submits an
            # empty file without a filename.
            if file.filename == '':
                return jsonify({"msg": "'No selected file"}), 400
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                return jsonify({'msg':'upload success', 'data': filename})
            

    @app.route('/uploads/<name>')
    def download_file(name):
        return send_from_directory(app.config["UPLOAD_FOLDER"], name)
    

    @app.route('/api/v1/uploads', methods=['DELETE'])
    def delete_file():
        if request.method == "DELETE":
            for uid in request.get_json()['uid']:
                t = Photos.Photos.query.filter_by(uid=uid).first()
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], t.filename))
                db.session.delete(t)
                db.session.commit()
            return jsonify({'welcome':'hi'}), 200