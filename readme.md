backend:

create venv:
python -m venv venv

activate venv:

windows:
Set-ExecutionPolicy Unrestricted -Scope Process
venv/Scripts/activate.ps1

linux:
source venv/bin/activate

deactivate venv:
deactivate

install dependencies:
pip install -r requirements.txt

rewrite dependencies:
pip freeze > requirements.txt

run:
python app.py

frontend:

install dependencies:
npm i

run:
npm run dev
