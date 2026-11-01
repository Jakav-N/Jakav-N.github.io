@echo off
rem Double-click this to fetch the latest chapters and open the book.
cd /d "%~dp0"
git pull --ff-only origin ccr-bdbfed7c-uexzf3
if errorlevel 1 (
  echo.
  echo Pull failed. Check your connection, or run: git status
  pause
)
start "" "%~dp0long-second\all.html"
