@echo off
echo ===================================================
echo     INICIANDO TOOLBOX FRONTEND (ANGULAR 21)
echo ===================================================

cd /d "%~dp0"

IF NOT EXIST ".env" (
    echo Creando archivo .env desde .env.example...
    copy .env.example .env
)

IF NOT EXIST "node_modules" (
    echo Instalando paquetes de Angular (esto solo se hace la primera vez)...
    call npm install
)

echo.
echo ===================================================
echo Levantando servidor Angular en: http://localhost:4300
echo ===================================================
echo.

call npm start
pause

