@echo on





:: Start code editing application
cd "C:\Users\joao\AppData\Local\atom"
start atom.exe



:: Open application on a browser window
cd "C:\Program Files (x86)\Google\Chrome\Application"
start chrome.exe "http://localhost:8000"



:: Run PostgreSQL server
cd "C:\Users\joao\Desktop\db\example"
start cmd.exe /k postgres -D . -k .



:: Select desired Python virtual environment (as created with mkvirtualenv)
:: &
:: Run Django development server
cd "C:\Users\joao\Desktop\sharticle"
cmd /k "workon sharticle & python manage.py runserver"



exit