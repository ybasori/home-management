import sys
sys.path.insert(0, '/var/www/home-management')

activate_this = '/var/www/home-management/venv/bin/activate'
with open(activate_this) as file_:
	exec(file_.read(), dict(__file__=activate_this))

from app import app as application
