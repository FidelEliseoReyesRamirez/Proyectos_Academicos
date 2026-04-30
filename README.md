# Proyectos Académicos — Universidad Privada del Valle

Sistema web académico para la gestión y seguimiento de proyectos estudiantiles, desarrollado con **Laravel**, **React**, **Inertia.js**, **Vite**, **Docker** y **PostgreSQL**.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Laravel 12 |
| Frontend | React + Inertia.js + Vite |
| Base de datos | PostgreSQL 16 (Docker) |
| Administración BD | pgAdmin 4 (Docker) |
| Estilos | Tailwind CSS |

---

## Requisitos previos

Cada integrante debe tener instalado antes de clonar el proyecto:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (con WSL2 en Windows)
- PHP 8.3 o superior
- [Composer](https://getcomposer.org/)
- Node.js 20 o superior
- npm

Verificar instalaciones:

```bash
git --version
docker --version
docker compose version
php -v
composer -V
node -v
npm -v
```

---

## 1. Clonar el proyecto

```bash
git clone https://github.com/FidelEliseoReyesRamirez/Proyectos_Academicos.git
cd Proyectos_Academicos
git checkout main
git pull origin main
```

---

## 2. Crear el archivo `.env`

**Linux / macOS / Git Bash:**
```bash
cp .env.example .env
```

**Windows CMD:**
```cmd
copy .env.example .env
```

Abrir `.env` y configurar las siguientes variables:

```env
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
```

> **Importante:** `APP_NAME` debe ir entre comillas porque contiene espacios.

---

## 3. Instalar dependencias

```bash
composer install
npm install
```

> No ejecutar `npm audit fix --force` — puede romper versiones del proyecto.

---

## 4. Levantar la base de datos con Docker

```bash
docker compose up -d
```

Verificar que los contenedores estén corriendo:

```bash
docker ps
```

Deben aparecer:
- `sudosquad_postgres`
- `sudosquad_pgadmin`

---

## 5. Credenciales de PostgreSQL

| Campo | Valor |
|---|---|
| Motor | PostgreSQL 16 |
| Host (desde Laravel) | `127.0.0.1` |
| Puerto (desde Laravel) | `5433` |
| Base de datos | `sudosquad_db` |
| Usuario | `sudosquad_user` |
| Contraseña | `sudosquad_secret_2025` |

---

## 6. Acceder a pgAdmin

Abrir en el navegador: [http://localhost:5051](http://localhost:5051)

| Campo | Valor |
|---|---|
| Correo | `admin@sudosquad.dev` |
| Contraseña | `admin_2025` |

**Registrar el servidor en pgAdmin:**

1. Click derecho en **Servers** → **Register** → **Server**
2. Pestaña **General** → Name: `SudoSquad PostgreSQL`
3. Pestaña **Connection:**
   - Host: `sudosquad_db`
   - Port: `5432`
   - Database: `sudosquad_db`
   - Username: `sudosquad_user`
   - Password: `sudosquad_secret_2025`
   - Activar **Save password**
4. Click **Save**

> En pgAdmin se usa `sudosquad_db` como host porque ambos contenedores comparten la misma red Docker. En Laravel se usa `127.0.0.1` con puerto `5433`.

---

## 7. Generar la clave de Laravel

```bash
php artisan key:generate
php artisan optimize:clear
```

---

## 8. Base de datos inicial

El archivo `init.sql` se ejecuta automáticamente cuando Docker crea el contenedor por primera vez. No es necesario correr migraciones manualmente.

Verificar conexión:

```bash
php artisan migrate:status
```

Si Docker ya había creado el volumen antes y necesitas reiniciar la base de datos desde cero:

```bash
docker compose down -v
docker compose up -d
```

> ⚠️ Este comando borra todos los datos locales de PostgreSQL.

---

## 9. Levantar el proyecto

En la **primera terminal:**

```bash
php artisan serve
```

En una **segunda terminal:**

```bash
npm run dev
```

La aplicación estará disponible en: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 10. Instalación completa desde cero

```bash
git clone https://github.com/FidelEliseoReyesRamirez/Proyectos_Academicos.git
cd Proyectos_Academicos
cp .env.example .env        # Windows: copy .env.example .env
composer install
npm install
docker compose up -d
php artisan key:generate
php artisan optimize:clear
php artisan serve
```

Segunda terminal:

```bash
cd Proyectos_Academicos
npm run dev
```

---

## 11. Comandos diarios

Cada integrante debe ejecutar al iniciar el día:

```bash
git checkout main
git pull origin main
docker compose up -d
composer install
npm install
php artisan optimize:clear
```

Primera terminal:
```bash
php artisan serve
```

Segunda terminal:
```bash
npm run dev
```

---

## 12. Usuarios y roles

Los roles se almacenan en `users.rol`:

| Rol | Descripción |
|---|---|
| `estudiante` | Usuario por defecto al registrarse |
| `tutor` | Supervisa proyectos asignados |
| `revisor` | Evalúa proyectos en fase final |
| `coordinador` | Administra el sistema completo |

El estado del usuario se almacena en `users.activo`. Un usuario con `activo = false` no puede iniciar sesión.

---

## 13. Asignar rol de coordinador

```bash
php artisan tinker
```

```php
use App\Models\User;

User::where('email', 'correo@gmail.com')->update([
    'rol' => 'coordinador',
    'activo' => true,
]);

exit
```

Cerrar sesión e iniciar sesión nuevamente para aplicar el cambio.

---

## 14. Módulo de gestión de usuarios

Solo accesible con rol `coordinador`.

| Ruta | Descripción |
|---|---|
| `/usuarios` | Directorio de usuarios |
| `/usuarios/crear` | Crear usuario |
| `/usuarios/{id}/editar` | Editar usuario |
| `/usuarios/papelera` | Usuarios inactivos |

**Funciones disponibles:** crear, editar, asignar rol, activar/desactivar, restaurar desde papelera, filtrar por nombre, correo, rol, estado y fecha. Paginación de 20 registros.

**Restricciones:**
- No se puede desactivar al último coordinador activo.
- No se puede quitar el rol al último coordinador activo.
- Un coordinador no puede modificar su propio rol.

---

## 15. Autenticación y seguridad

- Inicio de sesión y registro
- Recuperación de contraseña
- Confirmación de contraseña
- Verificación de correo electrónico
- Bloqueo temporal tras 5 intentos fallidos
- Validación de cuenta activa/inactiva
- Control de acceso basado en roles (RBAC) mediante middleware

---

## 16. Flujo de trabajo con Git

No trabajar directamente en `main`.

**Crear una rama nueva:**
```bash
git checkout main
git pull origin main
git checkout -b nombre-de-la-rama
```

**Guardar y subir cambios:**
```bash
git status
git add .
git commit -m "Descripción del cambio"
git push origin nombre-de-la-rama
```

Luego crear un **Pull Request** hacia `main`.

**Fusionar con main:**
```bash
git checkout main
git pull origin main
git merge nombre-de-la-rama
git push origin main
```

**Actualizar una rama con cambios de main:**
```bash
git checkout nombre-de-la-rama
git pull origin nombre-de-la-rama
git merge main
```

Si hay conflictos, resolverlos y luego:
```bash
git add .
git commit -m "Resolve merge conflicts"
```

---

## 17. Comandos útiles de Laravel

```bash
php artisan optimize:clear    # Limpiar caché general
php artisan config:clear      # Limpiar configuración
php artisan route:clear       # Limpiar rutas
php artisan view:clear        # Limpiar vistas
php artisan route:list        # Ver todas las rutas
php artisan tinker            # Consola interactiva
php artisan migrate:status    # Estado de migraciones
```

---

## 18. Comandos útiles de Docker

```bash
docker compose up -d          # Levantar contenedores
docker ps                     # Ver contenedores activos
docker compose down           # Detener contenedores
docker compose down -v        # Detener y borrar volúmenes
docker compose up -d --build  # Reconstruir contenedores
docker compose logs -f        # Ver logs en tiempo real
docker logs sudosquad_postgres 2>&1 | tail -20  # Logs de PostgreSQL
```

---

## 19. Solución de errores comunes

**Error: `Failed to parse dotenv file` / `Encountered unexpected whitespace`**

Verificar que `APP_NAME` esté entre comillas:
```env
APP_NAME="Proyectos Académicos Univalle"
```

---

**Error de conexión a PostgreSQL**

Verificar que Docker esté activo:
```bash
docker ps
```

Verificar variables en `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5433
DB_DATABASE=sudosquad_db
DB_USERNAME=sudosquad_user
DB_PASSWORD=sudosquad_secret_2025
```

---

**Puerto 5433 ocupado**

Windows PowerShell:
```powershell
netstat -ano | findstr :5433
```

Cambiar puerto en `docker-compose.yml`:
```yaml
ports:
  - "5434:5432"
```

Y en `.env`:
```env
DB_PORT=5434
```

---

**pgAdmin no abre en localhost:5051**

Verificar contenedores:
```bash
docker ps
```

Si el puerto está ocupado, cambiar en `docker-compose.yml`:
```yaml
ports:
  - "5052:80"
```

Luego abrir: [http://localhost:5052](http://localhost:5052)

---

**Error de Vite / frontend no compila**

```bash
npm install
npm run dev
```

Si persiste, eliminar `node_modules` y `package-lock.json`:

Linux / macOS / Git Bash:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

Windows: eliminar manualmente las carpetas y luego ejecutar `npm install`.

---

**Error de caché de Laravel**

```bash
php artisan optimize:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## 20. Inicio rápido (todo de una vez)

**Terminal 1:**
```bash
docker compose up -d
php artisan optimize:clear
php artisan serve
```

**Terminal 2:**
```bash
npm run dev
```

---

## 21. Archivos importantes

| Archivo / Carpeta | Descripción |
|---|---|
| `docker-compose.yml` | Configuración de PostgreSQL y pgAdmin |
| `init.sql` | Script inicial de base de datos |
| `.env` | Variables locales del entorno |
| `routes/web.php` | Rutas principales |
| `routes/settings.php` | Rutas de configuración de usuario |
| `app/Models/User.php` | Modelo de usuario |
| `app/Http/Controllers/` | Controladores Laravel |
| `resources/js/pages/` | Vistas React + Inertia |
| `resources/js/components/` | Componentes React reutilizables |

---

## 22. Reglas del equipo

- No subir `.env` ni `node_modules`.
- No modificar `main` directamente — siempre trabajar en una rama.
- Crear una rama por módulo o funcionalidad.
- Hacer `git pull origin main` antes de empezar cualquier sesión.
- Verificar que `php artisan serve` y `npm run dev` funcionen antes de hacer commit.
- Avisar al equipo si se modifica `init.sql`, `docker-compose.yml`, rutas o autenticación.
- Usar mensajes de commit claros y descriptivos en inglés.

---


**Universidad Privada del Valle — Sede La Paz · 2026**
