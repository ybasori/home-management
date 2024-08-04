# Home Mangement 
- Apache (just the configuration)
- Python 3
- Flask
- Vite
- Vue.js
- SQLite

## Development

### Backend
Create a virtual environment

```bash
python -m venv venv
```
Activate virtual environment for Windows:

```bash
Set-ExecutionPolicy Unrestricted -Scope Process
venv/Scripts/activate.ps1
```
Activate virtual environment for Linux:
```bash
source venv/bin/activate
```

If you want to deactivate virtual environment
```bash
deactivate
```

Then install dependencies after activating virtual environment:
```bash
pip install -r requirements.txt
```

If you want to rewrite dependencies:
```bash
pip freeze > requirements.txt
```

Run development after installing dependencies:
```bash
python app.py
```
Then generate db
```bash
python
```
```python
from app import db
```
```python
db.create_all()
```

### Frontend
Install dependencies:
```bash
npm install
```

Run development:
```bash
npm run dev
```

### Run Development
Open browser then go to http://localhost:5173

## Production
Before anything else
1. Use Ubuntu OS for the server
2. Apache installed
   ```bash
   sudo apt-get install apache2
   ```
3. WSGI mod for python3 installed
   ```bash
   sudo apt-get install libapache2-mod-wsgi-py3
   sudo a2enmod wsgi
   ```
4. Virtual environment
   ```bash
   sudo apt-get install virtualenv
   ```


Then:
1. Set the directory
   ```bash
   cd /var/www/<your-repository>
   ```
2. Create a virtual environment in your directory
   ```bash
   virtualenv venv
   ```
3. Acitvate the virtual environment
   ```bash
   source venv/bin/activate
   ```
4. install requirement
   ```bash
   pip install -r requirments.txt
   ```
5. deactivate environment
   ```bash
   deactivate
   ```
6. install and build
   ```bash
   npm install
   npm run build
   ```
7. Copy `home-management.conf` and paste it to `/etc/apache2/sites-available`
8. Then enable it by
   ```bash
   sudo a2ensite home-management.conf
   ```
9. Restart Apache
   ```bash
   sudo service apache2 restart
   ```
   or

   ```bash
   sudo systemctl apache2 reload
   ```
10. You're all setup