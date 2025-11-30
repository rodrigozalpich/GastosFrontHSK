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

## 🛣️ Rutas Principales

Las rutas están configuradas en `src/config/routes.config.ts`:

### Rutas Públicas
- `/` - Landing Page
- `/login` - Página de inicio de sesión

### Rutas Protegidas (requieren autenticación)

#### Gastos
- `/dashboard` - Dashboard principal
- `/gastos/listado` - Listado completo de gastos
- `/gastos/mis-gastos` - Gastos del usuario actual
- `/gastos/por-autorizar` - Gastos pendientes de autorización (requiere permiso de autorizador)
- `/gastos/autorizados` - Gastos autorizados
- `/gastos/por-pagar` - Gastos pendientes de pago

#### Catálogos
- `/catalogos/centros-costos` - Gestión de centros de costo
- `/catalogos/cuentas-contables` - Gestión de cuentas contables
- `/catalogos/plazas` - Gestión de plazas
- `/catalogos/division` - Gestión de divisiones
- `/catalogos/claves-producto` - Gestión de claves de producto SAT

#### Funcionalidades Adicionales
- `/polizas` - Gestión de pólizas contables
- `/timbrado` - Timbrado de gastos
- `/analytics` - Analytics y reportes
- `/config-parametros` - Configuración de parámetros
- `/datos-empleado` - Gestión de datos de empleados
- `/configurar-plazas` - Configuración avanzada de plazas
- `/configurar-arbol` - Configuración de árbol de estructura

## 🧪 Pruebas

Para ejecutar las pruebas:
```bash
npm test
```

## 📦 Build y Despliegue

### Build de Producción

Para crear el build optimizado de producción:
```bash
npm run build
```

El build se generará en la carpeta `dist/` con las siguientes optimizaciones:
- Code splitting automático
- Minificación de código
- Tree shaking
- Separación de chunks por vendor (React, React Query, UI libraries)

### Preview del Build

Para previsualizar el build de producción localmente:
```bash
npm run preview
```

### Variables de Entorno

Asegúrate de configurar las siguientes variables de entorno antes del build:

```env
VITE_API_SSO_BASE_URL=https://sso.tudominio.com/api/
VITE_API_BACK_BASE_URL=https://api.tudominio.com/api/
```

**Nota**: Las variables de entorno deben comenzar con `VITE_` para que Vite las exponga a la aplicación.

## 🔧 Tecnologías Utilizadas

### Core
- **React 19** - Framework UI
- **TypeScript 5.9** - Tipado estático
- **Vite 7** - Build tool y dev server

### Routing y Estado
- **React Router v7** - Enrutamiento del lado del cliente
- **Zustand 5** - Manejo de estado global ligero
- **React Query 5** - Data fetching, caching y sincronización

### HTTP y APIs
- **Axios 1.13** - Cliente HTTP con interceptores

### UI y Estilos
- **Material UI 7** - Componentes de interfaz
- **Material React Table 3** - Tablas avanzadas con filtros y paginación
- **Tailwind CSS 4** - Framework de estilos utility-first
- **FontAwesome** - Iconos SVG
- **Headless UI** - Componentes UI sin estilos

### Utilidades
- **date-fns 4** - Manipulación de fechas
- **jwt-decode 4** - Decodificación de tokens JWT
- **jszip 3** - Manipulación de archivos ZIP
- **Chart.js 4** - Gráficos y visualizaciones

## 🏗️ Arquitectura

### Patrón de Estado
- **Zustand** para estado global (autenticación, notificaciones, sidebar)
- **React Query** para estado del servidor (caching, sincronización, invalidación)
- **Estado local** con `useState` para componentes simples

### Patrón de Servicios
- Servicios como clases singleton con métodos estáticos
- Separación clara entre lógica de negocio y presentación
- Interceptores de Axios para autenticación automática

### Patrón de Hooks
- Custom hooks para encapsular lógica de React Query
- Hooks reutilizables para operaciones CRUD
- Separación de concerns entre data fetching y UI

### Manejo de Errores
- Helper centralizado (`errorHelpers.ts`) para manejo de errores
- Tipos de errores estructurados (Network, Auth, Validation, Server)
- Mensajes de error amigables para el usuario
- Logging de errores para debugging

## 📝 Estado de la Migración

### ✅ Migración Completada

La migración del módulo de gastos de Angular a React ha sido completada exitosamente. Todas las fases principales han sido implementadas:

#### ✅ Fase 1: Configuración Base y Sistema de Autenticación
- [x] Configuración base del proyecto
- [x] Sistema de autenticación multiempresa y multicorporativo
- [x] Servicios de seguridad (`SeguridadMultiEmpresaService` → `seguridadService.ts`)
- [x] Helpers de permisos (50+ funciones migradas)
- [x] Store de autenticación con Zustand
- [x] Configuración de rutas protegidas
- [x] Componentes base (Loader, GlobalSnackbar)
- [x] Páginas básicas (Login, Landing, NotFound)

#### ✅ Fase 2: Migración de Servicios
- [x] Servicio principal de gastos (`GastoService` → `gastoService.ts`)
- [x] Servicios de catálogos (CentroCostos, CuentaContable, Plazas, División, ClaveProducto)
- [x] Servicios adicionales (Polizas, Timbrado, Parámetros, DatosEmpleado)
- [x] Adaptación de métodos de Observable a Promise/React Query
- [x] Tipos TypeScript migrados

#### ✅ Fase 3: Migración de Estado
- [x] Store de gastos con Zustand (`gastoStore.ts`)
- [x] Store de notificaciones (`notificacionStore.ts`)
- [x] Store de sidebar (`sidenavStore.ts`)
- [x] Persistencia de estado donde es necesario

#### ✅ Fase 4: Componentes de Navegación y UI
- [x] Landing Page con carrusel de imágenes
- [x] Sidebar con menús anidados y filtrado por permisos
- [x] Header con selector de empresa y título dinámico
- [x] Integración completa con sistema de rutas

#### ✅ Fase 5: Componentes Base de Gastos
- [x] ListadoGastos - Listado completo de gastos
- [x] MisGastos - Gastos del usuario actual
- [x] GastosPorAutorizar - Gastos pendientes de autorización
- [x] GastosAutorizados - Gastos autorizados
- [x] GastosPorPagar - Gastos pendientes de pago
- [x] ModalGasto - Crear/editar/ver gastos

#### ✅ Fase 6: Catálogos
- [x] CentroCostos - Gestión de centros de costo
- [x] CuentaContable - Gestión de cuentas contables
- [x] Plazas - Gestión de plazas
- [x] División - Gestión de divisiones
- [x] ClaveProducto - Gestión de claves de producto SAT
- [x] DatosEmpleado - Gestión de datos de empleados

#### ✅ Fase 7: Funcionalidades Adicionales
- [x] Polizas - Gestión de pólizas contables
- [x] Timbrado - Timbrado de gastos
- [x] Analytics - Análisis y reportes
- [x] ConfigParametros - Configuración de parámetros
- [x] ConfigurarPlazas - Configuración avanzada de plazas
- [x] ConfigurarArbol - Configuración de árbol de estructura

#### ✅ Fase 8: Helpers y Utilidades
- [x] Helpers de fechas (`dateHelpers.ts`)
- [x] Helpers de formato (`formatHelpers.ts`)
- [x] Helpers de validación (`validationHelpers.ts`)
- [x] Helpers de archivos (`fileHelpers.ts`)
- [x] Helpers de permisos (`permisosHelpers.ts`)
- [x] Helpers de errores (`errorHelpers.ts`) - **Nuevo en Fase 11**

#### ✅ Fase 9: Custom Hooks
- [x] `useGastos` - Hook para gestión de gastos
- [x] `useAutorizacion` - Hook para autorización de gastos
- [x] `usePagoGasto` - Hook para pago de gastos
- [x] `useFiltrosGastos` - Hook para filtros complejos
- [x] `usePolizas` - Hook para gestión de pólizas
- [x] Hooks para todos los catálogos

#### ✅ Fase 10: Integración y Pruebas
- [x] Integración completa de todas las rutas
- [x] Configuración de permisos en rutas
- [x] Pruebas de flujos completos
- [x] Ajustes de estilos y UI
- [x] Optimización de rendimiento

#### ✅ Fase 11: Refinamiento (Completada)
- [x] Revisión y refactorización de código
- [x] Optimización de queries de React Query
- [x] Mejora de manejo de errores (helper centralizado)
- [x] Documentación de código
- [x] Optimización para producción (vite.config.ts)
- [x] Configuración de variables de entorno

## 🎯 Funcionalidades Principales

### Gestión de Gastos
- ✅ Crear, editar y eliminar gastos
- ✅ Carga de archivos de comprobación
- ✅ Autorización y rechazo de gastos
- ✅ Pago de gastos
- ✅ Filtros avanzados y búsqueda
- ✅ Visualización de gastos por estatus

### Catálogos
- ✅ Gestión completa de centros de costo
- ✅ Gestión de cuentas contables
- ✅ Gestión de plazas y divisiones
- ✅ Gestión de claves de producto SAT
- ✅ Gestión de datos de empleados

### Funcionalidades Avanzadas
- ✅ Generación de pólizas contables
- ✅ Timbrado de gastos
- ✅ Analytics y reportes
- ✅ Configuración de parámetros por empresa
- ✅ Configuración de estructura organizacional

## 📄 Licencia

[Tu licencia aquí]
