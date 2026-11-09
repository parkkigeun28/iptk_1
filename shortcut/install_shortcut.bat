@echo off
rem IPTK MES desktop shortcut installer
rem 1) copies iptk_1.ico to C:\Users\Public\IPTK
rem 2) creates "IPTK MES" shortcut on the current user's desktop
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=[Environment]::GetFolderPath('Desktop'); $i=Join-Path $env:PUBLIC 'IPTK\iptk_1.ico'; New-Item -ItemType Directory -Force (Split-Path $i) | Out-Null; Copy-Item -Force -LiteralPath '%~dp0iptk_1.ico' -Destination $i; Set-Content -Encoding ASCII -LiteralPath (Join-Path $d 'IPTK MES.url') -Value @('[InternetShortcut]','URL=https://iptk38-del.github.io/iptk_1/','IconIndex=0',('IconFile='+$i)); Write-Host ('OK: ' + (Join-Path $d 'IPTK MES.url'))"
pause
