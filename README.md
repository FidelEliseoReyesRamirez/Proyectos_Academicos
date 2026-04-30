Proyectos Académicos Univalle

Sistema web académico desarrollado con Laravel, React, Inertia, Vite, Docker y PostgreSQL.

El proyecto usa Docker para levantar la base de datos PostgreSQL y pgAdmin. Laravel y React se ejecutan localmente desde la computadora del desarrollador.

1. Requisitos previos

Antes de clonar el proyecto, cada integrante debe instalar:

Git
Docker Desktop
Docker Compose
PHP 8.3 o superior
Composer
Node.js 20 o superior
npm
Visual Studio Code o editor equivalente

Para verificar que todo esté instalado, ejecutar:

git --version
docker --version
docker compose version
php -v
composer -V
node -v
npm -v

En Windows se recomienda tener Docker Desktop con WSL2 habilitado.

2. Clonar el proyecto

Abrir una terminal en la carpeta donde se guardará el proyecto.

git clone https://github.com/FidelEliseoReyesRamirez/Proyectos_Academicos.git
cd Proyectos_Academicos
git checkout main
git pull origin main
3. Crear el archivo .env

Laravel necesita un archivo .env para leer la configuración local.

En Linux, macOS o Git Bash:

cp .env.example .env

En Windows CMD:

copy .env.example .env

Luego abrir el archivo .env y configurar estas variables:

APP_NAME="Proyectos Académicos Univalle"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_ES

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5433
DB_DATABASE=sudosquad_db
DB_USERNAME=sudosquad_user
DB_PASSWORD=sudosquad_secret_2025

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

Importante: APP_NAME debe ir entre comillas porque tiene espacios.

Correcto:

APP_NAME="Proyectos Académicos Univalle"

Incorrecto:

APP_NAME=Proyectos Académicos Univalle
4. Instalar dependencias de Laravel

Ejecutar:

composer install

Si Composer marca error de caché:

composer clear-cache
composer install
5. Instalar dependencias de React y Vite

Ejecutar:

npm install

Este comando instala React, Inertia, Vite y las demás dependencias del frontend.

No ejecutar:

npm audit fix --force

porque puede romper versiones del proyecto.

6. Levantar PostgreSQL y pgAdmin con Docker

El proyecto usa este archivo docker-compose.yml:

version: '3.9'

services:
  sudosquad_db:
    image: postgres:16-alpine
    container_name: sudosquad_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: sudosquad_db
      POSTGRES_USER: sudosquad_user
      POSTGRES_PASSWORD: sudosquad_secret_2025
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5433:5432"
    volumes:
      - sudosquad_pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - sudosquad_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sudosquad_user -d sudosquad_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  sudosquad_pgadmin:
    image: dpage/pgadmin4:latest
    container_name: sudosquad_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@sudosquad.dev
      PGADMIN_DEFAULT_PASSWORD: admin_2025
    ports:
      - "5051:80"
    depends_on:
      sudosquad_db:
        condition: service_healthy
    networks:
      - sudosquad_net
    volumes:
      - sudosquad_pgadmin_data:/var/lib/pgadmin

volumes:
  sudosquad_pgdata:
  sudosquad_pgadmin_data:

networks:
  sudosquad_net:
    driver: bridge

Para levantar los contenedores:

docker compose up -d

Verificar que estén corriendo:

docker ps

Deben aparecer estos contenedores:

sudosquad_postgres
sudosquad_pgadmin
7. Credenciales de PostgreSQL

La base de datos usa estas credenciales:

Motor: PostgreSQL
Host desde Laravel: 127.0.0.1
Puerto desde Laravel: 5433
Base de datos: sudosquad_db
Usuario: sudosquad_user
Contraseña: sudosquad_secret_2025

Estas credenciales deben coincidir con el .env:

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5433
DB_DATABASE=sudosquad_db
DB_USERNAME=sudosquad_user
DB_PASSWORD=sudosquad_secret_2025
8. Acceder a pgAdmin

Abrir en el navegador:

http://localhost:5051

Credenciales de pgAdmin:

Correo: admin@sudosquad.dev
Contraseña: admin_2025

Para conectar pgAdmin con PostgreSQL:

Entrar a pgAdmin.
Click derecho en Servers.
Seleccionar Register.
Seleccionar Server.
En la pestaña General colocar:
Name: SudoSquad PostgreSQL
En la pestaña Connection colocar:
Host name/address: sudosquad_db
Port: 5432
Maintenance database: sudosquad_db
Username: sudosquad_user
Password: sudosquad_secret_2025
Activar Save password.
Click en Save.

Nota: en pgAdmin se usa sudosquad_db como host porque pgAdmin y PostgreSQL están dentro de la misma red Docker. En Laravel se usa 127.0.0.1 con puerto 5433.

9. Generar la clave de Laravel

Ejecutar:

php artisan key:generate

Luego limpiar caché:

php artisan optimize:clear
10. Base de datos inicial

El proyecto usa el archivo:

init.sql

Este archivo se ejecuta automáticamente cuando Docker crea el contenedor de PostgreSQL por primera vez.

Para verificar conexión con Laravel:

php artisan migrate:status

Si Laravel se conecta correctamente a PostgreSQL, no debe salir error de conexión.

Si Docker ya había creado el volumen antes, PostgreSQL no vuelve a ejecutar init.sql. Para reiniciar completamente la base de datos local y volver a cargar init.sql, ejecutar:

docker compose down -v
docker compose up -d --build

Advertencia: este comando borra los datos locales de PostgreSQL.

11. Levantar Laravel

En una terminal, dentro del proyecto:

php artisan serve

La aplicación estará disponible en:

http://127.0.0.1:8000
12. Levantar React/Vite

En otra terminal, dentro del proyecto:

npm run dev

Para trabajar en el sistema deben estar corriendo al mismo tiempo:

php artisan serve

y:

npm run dev
13. Instalación completa desde cero

Para instalar el proyecto por primera vez, ejecutar en orden:

git clone https://github.com/FidelEliseoReyesRamirez/Proyectos_Academicos.git
cd Proyectos_Academicos
cp .env.example .env
composer install
npm install
docker compose up -d
php artisan key:generate
php artisan optimize:clear
php artisan serve

En otra terminal:

cd Proyectos_Academicos
npm run dev

En Windows CMD, reemplazar:

cp .env.example .env

por:

copy .env.example .env
14. Comandos para iniciar el proyecto cada día

Cada integrante debe ejecutar:

git checkout main
git pull origin main
docker compose up -d
composer install
npm install
php artisan optimize:clear

Luego, en la primera terminal:

php artisan serve

En una segunda terminal:

npm run dev
15. Usuarios y roles

El sistema maneja roles en la columna:

users.rol

Roles disponibles:

estudiante
tutor
revisor
coordinador

El sistema maneja el estado del usuario en:

users.activo

Valores posibles:

true  = usuario activo
false = usuario inactivo

Un usuario inactivo no puede iniciar sesión.

16. Dar acceso de coordinador a un usuario

Para que un usuario pueda acceder al módulo de gestión de usuarios, debe tener rol coordinador.

Entrar a Tinker:

php artisan tinker

Ejecutar:

use App\Models\User;

User::where('email', 'correo_del_usuario@gmail.com')->update([
    'rol' => 'coordinador',
    'activo' => true,
]);

Salir de Tinker:

exit

Luego cerrar sesión e iniciar sesión nuevamente.

17. Módulo de gestión de usuarios

Solo el rol coordinador puede acceder al módulo.

Ruta principal:

http://127.0.0.1:8000/usuarios

Páginas del módulo:

/usuarios                Directorio de usuarios
/usuarios/crear          Crear usuario
/usuarios/{id}/editar    Editar usuario
/usuarios/papelera       Usuarios inactivos

Funciones disponibles:

Crear usuario.
Editar usuario.
Asignar rol.
Activar o desactivar usuario.
Ver usuarios activos.
Ver usuarios inactivos en papelera.
Restaurar usuarios inactivos.
Filtrar por nombre o correo.
Filtrar por rol.
Filtrar por estado.
Filtrar por fecha de registro.
Paginación de 20 registros.

Restricciones:

No se puede desactivar al último coordinador activo.
No se puede quitar el rol al último coordinador activo.
Un coordinador no puede modificar su propio rol.
Cambiar el rol de un usuario no elimina su historial.
18. Autenticación y seguridad

El sistema incluye:

Inicio de sesión.
Registro.
Recuperación de contraseña.
Confirmación de contraseña.
Verificación de correo.
Bloqueo temporal por intentos fallidos.
Validación de cuenta activa o inactiva.
Roles protegidos por middleware.

Una cuenta con activo = false no puede iniciar sesión.

19. Flujo de trabajo con Git

No trabajar directamente en main.

Para crear una rama nueva:

git checkout main
git pull origin main
git checkout -b nombre-de-la-rama

Ejemplo:

git checkout -b modulo-reportes

Para guardar cambios:

git status
git add .
git commit -m "Implement reports module"
git push origin modulo-reportes

Luego crear un Pull Request hacia main.

20. Fusionar una rama con main

Actualizar main:

git checkout main
git pull origin main

Fusionar la rama:

git merge nombre-de-la-rama

Subir cambios:

git push origin main
21. Actualizar una rama con cambios recientes de main

Si estás trabajando en una rama:

git checkout nombre-de-la-rama
git pull origin nombre-de-la-rama
git merge main

Si aparecen conflictos, resolverlos manualmente y ejecutar:

git add .
git commit -m "Resolve merge conflicts"
22. Comandos útiles de Laravel

Limpiar caché general:

php artisan optimize:clear

Limpiar configuración:

php artisan config:clear

Limpiar rutas:

php artisan route:clear

Limpiar vistas:

php artisan view:clear

Ver rutas:

php artisan route:list

Entrar a Tinker:

php artisan tinker
23. Comandos útiles de Docker

Levantar contenedores:

docker compose up -d

Ver contenedores activos:

docker ps

Detener contenedores:

docker compose down

Reconstruir contenedores:

docker compose up -d --build

Ver logs:

docker compose logs -f

Borrar contenedores y volúmenes:

docker compose down -v
24. Errores comunes
Error por APP_NAME

Si aparece:

Failed to parse dotenv file
Encountered unexpected whitespace

Revisar que esté así:

APP_NAME="Proyectos Académicos Univalle"
Error de conexión a PostgreSQL

Verificar que Docker esté activo:

docker ps

Verificar .env:

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5433
DB_DATABASE=sudosquad_db
DB_USERNAME=sudosquad_user
DB_PASSWORD=sudosquad_secret_2025
Error porque el puerto 5433 está ocupado

Detener contenedores:

docker compose down

Verificar procesos usando el puerto.

En Windows PowerShell:

netstat -ano | findstr :5433

Si se necesita cambiar el puerto, modificar docker-compose.yml:

ports:
  - "5434:5432"

Y modificar .env:

DB_PORT=5434
Error porque pgAdmin no abre

Verificar:

docker ps

Abrir:

http://localhost:5051

Si el puerto 5051 está ocupado, cambiar en docker-compose.yml:

ports:
  - "5052:80"

Luego abrir:

http://localhost:5052
Error de Vite

Ejecutar:

npm install
npm run dev

Si sigue fallando, eliminar node_modules y package-lock.json.

En Linux, macOS o Git Bash:

rm -rf node_modules package-lock.json
npm install
npm run dev

En Windows, eliminar manualmente:

node_modules
package-lock.json

y luego ejecutar:

npm install
npm run dev
Error de caché de Laravel

Ejecutar:

php artisan optimize:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
25. Comando rápido para levantar todo

Terminal 1:

docker compose up -d
php artisan optimize:clear
php artisan serve

Terminal 2:

npm run dev
26. Archivos importantes
docker-compose.yml       Configuración de PostgreSQL y pgAdmin
init.sql                 Script inicial de base de datos
.env                     Variables locales del entorno
routes/web.php           Rutas principales
routes/settings.php      Rutas de configuración de usuario
app/Models/User.php      Modelo de usuario
app/Http/Controllers     Controladores Laravel
resources/js/pages       Vistas React/Inertia
resources/js/components  Componentes React
27. Reglas del equipo
No subir .env.
No subir node_modules.
No modificar main directamente.
Crear una rama por módulo.
Hacer git pull origin main antes de empezar.
Probar php artisan serve y npm run dev antes de hacer commit.
Avisar si se modifica init.sql, docker-compose.yml, rutas o autenticación.
Usar mensajes de commit claros.
