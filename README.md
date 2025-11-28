# Sistema de Gestión de Gastos - Frontend React

Sistema de gestión de gastos multiempresa y multicorporativo migrado de Angular a React.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` con las URLs correctas de tus APIs:
```env
VITE_API_SSO_BASE_URL=http://ssodesarrollo.grupoteckio.com/api/
VITE_API_BACK_BASE_URL=http://erps.grupoteckio.com/api/
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
├── config/           # Configuración (rutas, etc.)
├── features/         # Features específicos (forms, tables)
├── helpers/          # Helpers y utilidades
├── hooks/            # Custom hooks
├── pages/            # Páginas de la aplicación
├── services/         # Servicios de API
├── store/            # Stores de Zustand
└── types/            # Tipos TypeScript
```

## 🔐 Sistema de Autenticación

El sistema utiliza autenticación multiempresa y multicorporativo:

- **SeguridadService**: Servicio principal de autenticación
- **authStore**: Store de Zustand para manejo de estado de autenticación
- **permisosHelpers**: Funciones helper para validación de permisos por empresa

### Permisos

Los permisos se validan usando el patrón `Permiso-{idEmpresa}`. Por ejemplo:
- `CrearGasto-1` (permiso para crear gastos en empresa 1)
- `SeccionGastos-1` (acceso a sección de gastos en empresa 1)

Los usuarios con permiso `VisorCorporativo` tienen acceso a todas las empresas.

## 🛣️ Rutas

Las rutas están configuradas en `src/config/routes.config.ts`:

- `/` - Landing Page
- `/login` - Página de inicio de sesión
- `/dashboard` - Dashboard principal (requiere autenticación)

## 🧪 Pruebas

Para ejecutar las pruebas:
```bash
npm test
```

## 📦 Build

Para crear el build de producción:
```bash
npm run build
```

## 🔧 Tecnologías Utilizadas

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router v7** - Enrutamiento
- **Zustand** - Manejo de estado
- **React Query** - Data fetching
- **Axios** - Cliente HTTP
- **Material UI** - Componentes UI
- **Tailwind CSS** - Estilos
- **FontAwesome** - Iconos

## 📝 Estado de la Migración

### ✅ Fase 1 Completada

- [x] Configuración base del proyecto
- [x] Sistema de autenticación multiempresa
- [x] Servicios de seguridad
- [x] Helpers de permisos
- [x] Store de autenticación
- [x] Configuración de rutas
- [x] Componentes base (Loader, GlobalSnackbar)
- [x] Páginas básicas (Login, Landing, NotFound)

### 🚧 Próximas Fases

- Fase 2: Migración de servicios de gastos
- Fase 3: Migración de componentes de gastos
- Fase 4: Migración de navegación (Sidebar, Header)
- Fase 5: Migración de catálogos
- Fase 6: Funcionalidades adicionales

## 📄 Licencia

[Tu licencia aquí]
