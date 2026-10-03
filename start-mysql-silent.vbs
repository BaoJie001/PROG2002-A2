' ---------------------------------------------------------------------------
'  Starts the MySQL server silently (no console window).
'  OPTIONAL: copy this file into your Windows Startup folder if you want the
'  database to start automatically every time you log in.
'
'  Startup folder:  Win + R  ->  shell:startup
'  To stop using it, just delete the copy from that folder.
' ---------------------------------------------------------------------------

Set ws = CreateObject("WScript.Shell")
ws.CurrentDirectory = "D:\mysql-data"
ws.Run Chr(34) & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" & Chr(34) & _
      " --defaults-file=" & Chr(34) & "D:\mysql-data\my.ini" & Chr(34), 0, False
