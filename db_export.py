from app import db

con = db.engine.raw_connection()
with open('C:/Users/Gord/Desktop/dump.sql', 'w') as f:
    for line in con.iterdump():
        f.write('%s\n' % line)