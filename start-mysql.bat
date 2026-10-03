@echo off
REM ---------------------------------------------------------------------------
REM  Start the MySQL 8.0 server used by the PROG2002 A2 project.
REM  Double-click this file whenever you need the database (e.g. after a reboot).
REM  Leave this window open - closing it stops the database.
REM ---------------------------------------------------------------------------

echo Starting MySQL 8.0 on port 3306...
echo Data directory: D:\mysql-data\data
echo.

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="D:\mysql-data\my.ini" --console

echo.
echo MySQL has stopped.
pause
