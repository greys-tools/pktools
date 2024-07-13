@ECHO OFF

if NOT EXIST ".\node_modules\" (
	echo Installing deps...
	call npm install
	echo Installation done!
)

node index.js
pause