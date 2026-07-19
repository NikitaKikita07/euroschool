@echo off
cd /d "%~dp0"
start "" "http://localhost:4173/"
"C:\Python314\python.exe" -m http.server 4173
