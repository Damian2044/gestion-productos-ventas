## ⚙ Funcionalidades del Sistema
### Requerimientos funcionales
- Gestión de productos (crear, actualizar, eliminar, consultar).
- Registro de ventas diarias, validación de stock y anulación de ventas.
- Generación de reportes:
  - Total de ventas.
  - Día de mayores ventas por semana.
  - Producto más vendido por día.

### Requerimientos no funcionales
- Base de datos PostgreSQL.
- Interfaz web intuitiva.
- Control de acceso por roles:
  - `admin` / clave: `admin123`
  - `vendedor1` / clave: `ventas123`

## 🛠️ Tecnologías Usadas
- **Backend**: FastAPI
- **Base de Datos**: PostgreSQL
- **Frontend**: React 
- **ORM**: SQLAlchemy
- **Autenticación**: por roles (admin y vendedor)
- **Contenedores**:Docker

## 🚀 Cómo ejecutar el proyecto

### 1. Clonar el repositorio
git clone [https://github.com/Damian2891/ProyectoAnalisisDisenioSistemas.git  ](https://github.com/Damian2044/gestion-productos-ventas.git)
cd ProyectoAnalisisDisenioSistemas

### 2. Construir y levantar los contenedores
Tener Docker y Docker Compose instalados, luego ejecuta:
docker compose up --build
Esto construirá las imágenes y levantará los servicios (backend, frontend y base de datos).

### 3. Acceder a la aplicación
- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:8000

---
## 👥 Usuarios por defecto

| Rol           | Usuario   | Contraseña  |
|---------------|-----------|-------------|
| Administrador | admin     | admin123    |
| Vendedor      | vendedor1  | ventas123   |

