# Plan de Migración: Angular a React - Módulo de Gastos

## 📋 Resumen Ejecutivo

Este documento describe el plan detallado para migrar el módulo de **Gastos** del proyecto Angular (`ERP_Rfacil_frontend`, rama `gastos`) a React, utilizando como base la arquitectura y patrones del proyecto `FrontMultivaGastosAMEX`.

**Objetivo**: Migrar toda la funcionalidad del módulo de gastos manteniendo la lógica de negocio, refactorizando cuando sea necesario para adaptarse a React, y siguiendo las mejores prácticas del proyecto base.

## ⚠️ IMPORTANTE: Sistema Multiempresa y Multicorporativo

**El sistema es MULTICORPORATIVO y MULTIEMPRESA**, por lo que es **CRÍTICO** migrar completamente:

1. ✅ **Sistema de autenticación completo** (`SeguridadMultiEmpresaService`)
2. ✅ **Todos los guards y funciones de permisos** (50+ funciones)
3. ✅ **Gestión de empresa activa** (`idEmpresa` en localStorage)
4. ✅ **Permisos dinámicos por empresa** (patrón `Permiso-{idEmpresa}`)
5. ✅ **Decodificación JWT UTF-8** (mantener lógica exacta)
6. ✅ **Interceptor de seguridad** (token automático en peticiones)

**Sin esto, el sistema NO funcionará correctamente en producción.**

---

## 🏗️ Análisis de Arquitectura

### Proyecto Base (FrontMultivaGastosAMEX) - React
- **Estado Global**: Zustand con persistencia
- **Data Fetching**: React Query (@tanstack/react-query)
- **Ruteo**: React Router v7
- **HTTP Client**: Axios con interceptores
- **UI**: Material UI + Tailwind CSS
- **Estructura**:
  ```
  src/
    ├── components/        # Componentes reutilizables
    ├── pages/            # Páginas/vistas principales
    ├── services/         # Servicios API
    ├── store/            # Estado global (Zustand)
    ├── hooks/            # Custom hooks
    ├── helpers/          # Utilidades y helpers
    ├── config/           # Configuraciones (rutas, etc.)
    └── features/         # Features compartidas
  ```

### Proyecto Angular a Migrar (ERP_Rfacil_frontend)
- **Estado**: Servicios inyectables + RxJS
- **Data Fetching**: HttpClient (Angular)
- **Ruteo**: Angular Router con lazy loading
- **UI**: Angular Material
- **Estructura**:
  ```
  src/app/gastos/
    ├── gestion-de-gastos/        # Módulo principal
    ├── centro-costos/
    ├── cuenta-contable/
    ├── datos-empleado/
    ├── division/
    ├── plazas/
    ├── polizas/
    ├── timbrado/
    └── analytics/
  ```

---

## 🗺️ Mapeo de Componentes y Funcionalidades

### 1. Módulo Principal: Gestión de Gastos

#### Angular → React

| Componente Angular | Componente React | Ubicación | Prioridad |
|-------------------|------------------|-----------|-----------|
| `GestionDeGastosComponent` | `GestionDeGastos.tsx` | `pages/GestionDeGastos.tsx` | Alta |
| `ListadoGastosComponent` | `ListadoGastos.tsx` | `pages/gastos/ListadoGastos.tsx` | Alta |
| `MisGastosComponent` | `MisGastos.tsx` | `pages/gastos/MisGastos.tsx` | Alta |
| `GastosPorAutorizarComponent` | `GastosPorAutorizar.tsx` | `pages/gastos/GastosPorAutorizar.tsx` | Alta |
| `VerGastosAutorizadosComponent` | `GastosAutorizados.tsx` | `pages/gastos/GastosAutorizados.tsx` | Alta |
| `GastosPorPagarComponent` | `GastosPorPagar.tsx` | `pages/gastos/GastosPorPagar.tsx` | Alta |

#### Acciones/Modales

| Componente Angular | Componente React | Ubicación | Prioridad |
|-------------------|------------------|-----------|-----------|
| `AddNewGastoComponent` | `FormularioGasto.tsx` | `features/forms/FormularioGasto.tsx` | Alta |
| `EditMiGastoComponent` | `FormularioEditarGasto.tsx` | `features/forms/FormularioEditarGasto.tsx` | Alta |
| `PagoComponent` | `FormularioPago.tsx` | `features/forms/FormularioPago.tsx` | Alta |
| `RangeFechasComponent` | `DateRangePicker.tsx` | `components/DateRangePicker.tsx` | Media |
| `RegistrarNoDeducibleComponent` | `FormularioNoDeducible.tsx` | `features/forms/FormularioNoDeducible.tsx` | Media |
| `SeeSharedExpenseComponent` | `ModalGastoCompartido.tsx` | `components/ModalGastoCompartido.tsx` | Media |
| `CragarXmlComponent` | `FormularioCargarXML.tsx` | `features/forms/FormularioCargarXML.tsx` | Media |

### 2. Catálogos

| Módulo Angular | Página React | Ubicación | Prioridad |
|---------------|--------------|-----------|-----------|
| `centro-costos` | `CentroCostos.tsx` | `pages/CentroCostos.tsx` | Media |
| `cuenta-contable` | `CuentaContable.tsx` | `pages/CuentaContable.tsx` | Media |
| `plazas` | `Plazas.tsx` | `pages/Plazas.tsx` | Media |
| `division` | `Division.tsx` | `pages/Division.tsx` | Media |
| `clave-producto` | `ClaveProducto.tsx` | `pages/ClaveProducto.tsx` | Media |
| `datos-empleado` | `DatosEmpleado.tsx` | `pages/DatosEmpleado.tsx` | Media |

### 3. Funcionalidades Adicionales

| Módulo Angular | Página React | Ubicación | Prioridad |
|---------------|--------------|-----------|-----------|
| `polizas` | `Polizas.tsx` | `pages/Polizas.tsx` | Media |
| `timbrado` | `Timbrado.tsx` | `pages/Timbrado.tsx` | Baja |
| `analytics` | `Analytics.tsx` | `pages/Analytics.tsx` | Baja |
| `config-parametros-gastos` | `ConfigParametros.tsx` | `pages/ConfigParametros.tsx` | Baja |

### 4. Componentes de Navegación y UI

| Componente Angular | Componente React | Ubicación | Prioridad |
|-------------------|------------------|-----------|-----------|
| `LandingPageComponent` | `LandingPage.tsx` | `pages/LandingPage.tsx` | **Alta** |
| `LeftMenuComponent` | `Sidebar.tsx` | `features/Sidebar.tsx` | **Alta** |
| `HeaderComponent` | `Header.tsx` | `features/Header.tsx` | Media |
| `SidenavService` | `sidenavStore.ts` | `store/sidenavStore.ts` | Alta |
| `TituloService` | Integrado en `Header.tsx` | `features/Header.tsx` | Media |

**Nota**: El proyecto base ya tiene `Sidebar.tsx`, pero necesita adaptarse para incluir toda la lógica del `LeftMenuComponent` de Angular.

---

## 🔄 Migración de Servicios

### Servicios Principales

#### 1. `GastoService` (Angular) → `gastoService.ts` (React)

**Métodos a migrar**:
- ✅ `obtenerGastos()` → `obtenerGastos()`
- ✅ `crearGasto()` → `crearGasto()`
- ✅ `editarGasto()` → `editarGasto()`
- ✅ `borrarGasto()` → `borrarGasto()`
- ✅ `obtenerGastoXId()` → `obtenerGastoPorId()`
- ✅ `CargarJustificante()` → `cargarJustificante()`
- ✅ `CargaFactura()` → `cargarFactura()`
- ✅ `obtenerArchivoComprobacion()` → `obtenerArchivoComprobacion()`
- ✅ `obtenerautorizador()` → `obtenerAutorizador()`
- ✅ `AutorizarGasto()` → `autorizarGasto()`
- ✅ `RechazarGasto()` → `rechazarGasto()`
- ✅ `pagarelGasto()` → `pagarGasto()`
- ✅ `ObtenerGastosxPagarxidEmpleado()` → `obtenerGastosPorPagar()`
- ✅ `CargarPolizas()` → `cargarPolizas()`
- ✅ `CrearPolizaGastos()` → `crearPolizaGastos()`
- ✅ Descargas (XML, PDF, Excel)

**Adaptaciones**:
- Convertir `Observable` a `Promise` o usar React Query
- Adaptar tipos TypeScript de Angular a React
- Usar `apiBACK` de `axiosInstance.ts` en lugar de `HttpClient`

#### 2. Otros Servicios

| Servicio Angular | Servicio React | Ubicación |
|-----------------|----------------|-----------|
| `centroCostosService` | `centroCostoService.ts` | `services/centroCostoService.ts` |
| `cuentaContableGastosService` | `cuentaContableService.ts` | `services/cuentaContableService.ts` |
| `plazasService` | `plazaService.ts` | `services/plazaService.ts` |
| `divisionService` | `divisionService.ts` | `services/divisionService.ts` (nuevo) |
| `datosEmpleadoService` | `datosEmpleadoService.ts` | `services/datosEmpleadoService.ts` (nuevo) |
| `polizasService` | `polizaService.ts` | `services/polizaService.ts` |
| `claveProdSATService` | `claveProductoService.ts` | `services/claveProductoService.ts` |

---

## 🔐 Migración de Sistema de Autenticación Multiempresa y Multicorporativo

### ⚠️ CRÍTICO: Sistema de Autenticación Completo

El sistema de autenticación es **multicorporativo y multiempresa**, por lo que debe migrarse completamente para mantener toda la funcionalidad.

### Servicios de Seguridad a Migrar

#### 1. `SeguridadMultiEmpresaService` → `seguridadService.ts`

**Métodos críticos**:
- ✅ `zfLogin()` → `login()` - Autenticación con credenciales
- ✅ `zfGuardarToken()` → `guardarToken()` - Persistencia de token
- ✅ `zfObtenerToken()` → `obtenerToken()` - Obtener token del localStorage
- ✅ `zfObtenerCampoJwt()` → `obtenerCampoJwt()` - Decodificar JWT y obtener campos
- ✅ `zfObtenerPermisoEspecialPantalla()` → `obtenerPermisoEspecial()` - Obtener permisos especiales del JWT
- ✅ `zfEstaLogueado()` → `estaLogueado()` - Verificar estado de autenticación
- ✅ `obtenIdEmpresaLocalStorage()` → `obtenerIdEmpresa()` - Obtener empresa activa
- ✅ `guardaIdEmpresaLocalStorage()` → `guardarIdEmpresa()` - Guardar empresa activa
- ✅ `zfLogOut()` → `logout()` - Cerrar sesión
- ✅ `respuestaFront()` → `respuestaFront()` - Respuesta del frontend al backend

**Adaptaciones**:
- Convertir `Observable` a `Promise` o integrar con Zustand
- Mantener lógica de decodificación JWT UTF-8
- Integrar con `authStore` existente pero adaptado para multiempresa
- Mantener compatibilidad con `idEmpresa` en localStorage

#### 2. `SeguridadService` → Helpers de Permisos

**Métodos**:
- ✅ `zfObtenerCampoJwt()` → Helper `obtenerCampoJwt()`
- ✅ `zfObtenerPermisoEspecialPantalla()` → Helper `obtenerPermisoEspecial()`
- ✅ `obtenIdEmpresaLocalStorage()` → Helper `obtenerIdEmpresa()`

**Ubicación**: `helpers/permisosHelpers.ts` (nuevo)

#### 3. `SeguridadInterceptorService` → Interceptores Axios

**Funcionalidad**:
- ✅ Interceptor de peticiones: Agregar token Bearer automáticamente
- ✅ Interceptor de respuestas: Manejar errores 401 y logout automático

**Ubicación**: Ya existe en `services/axiosInstance.ts`, **adaptar** para usar el nuevo sistema

### Guards Angular → Helpers/Funciones React

**Estrategia**: Convertir todos los guards a funciones helper que retornen boolean

| Guard/Función Angular | Helper/Función React | Ubicación | Prioridad |
|----------------------|---------------------|-----------|-----------|
| `safeGuard` | Ya existe `RutaProtegida` | `helpers/RutaProtegida.tsx` | ✅ Existe |
| `noEstaLogueadoGuard` | `RutaPublica` | `helpers/RutaPublica.tsx` | ✅ Existe |
| `esAdminGuard` | `esAdmin()` | `helpers/permisosHelpers.ts` | Alta |
| `esVisorCorporativoGuard` | `esVisorCorporativo()` | `helpers/permisosHelpers.ts` | Alta |
| `esCrearGastoFuncion()` | `esCrearGasto()` | `helpers/permisosHelpers.ts` | Alta |
| `esPagarGastoFuncion()` | `esPagarGasto()` | `helpers/permisosHelpers.ts` | Alta |
| `esVerlistaGastosFuncion()` | `esVerListaGastos()` | `helpers/permisosHelpers.ts` | Alta |
| `esVisorCorporativoFuncion()` | `esVisorCorporativo()` | `helpers/permisosHelpers.ts` | Alta |
| **+50 funciones más de permisos** | Funciones helper equivalentes | `helpers/permisosHelpers.ts` | Media |

**Patrón de Permisos Multiempresa**:
```typescript
// Angular
let permisoArmado = 'SeccionGastos-' + idEmpresa;
seguridadService.zfObtenerCampoJwt(permisoArmado)

// React
const idEmpresa = obtenerIdEmpresa();
const permiso = `SeccionGastos-${idEmpresa}`;
obtenerCampoJwt(permiso);
```

### Componentes de Seguridad

| Componente Angular | Componente React | Ubicación | Prioridad |
|-------------------|------------------|-----------|-----------|
| `LoginComponent` | `Login.tsx` | `pages/Login.tsx` | ✅ Existe (adaptar) |
| `FormularioAutenticacionComponent` | Integrado en `Login.tsx` | `pages/Login.tsx` | Media |

### Modelos/Interfaces de Seguridad

| Interface Angular | Interface React | Ubicación |
|------------------|-----------------|-----------|
| `CredencialesUsuarioDTO` | `CredencialesUsuario` | `types/seguridad.ts` (nuevo) |
| `RespuestaAutenticacionDTO` | `RespuestaAutenticacion` | `types/seguridad.ts` (nuevo) |
| `usuarioGastosDTO` | `UsuarioGasto` | `types/seguridad.ts` (nuevo) |
| `usuarioBaseDTO` | `UsuarioBase` | `types/seguridad.ts` (nuevo) |
| `UsuarioEstructuraCorporativoDTO` | `UsuarioEstructuraCorporativo` | `types/seguridad.ts` (nuevo) |
| `UsuarioEmpresaEstructura` | `UsuarioEmpresaEstructura` | `types/seguridad.ts` (nuevo) |

### Adaptación del `authStore.ts`

**Cambios necesarios**:
1. ✅ Mantener estructura base existente
2. ✅ Agregar soporte para `idEmpresa` activa
3. ✅ Agregar método `obtenerIdEmpresa()` 
4. ✅ Agregar método `guardarIdEmpresa(idEmpresa: number)`
5. ✅ Agregar método `obtenerCampoJwt(campo: string)` 
6. ✅ Agregar método `obtenerPermisoEspecial(clave: string)`
7. ✅ Adaptar `login()` para usar `SeguridadMultiEmpresaService`
8. ✅ Mantener compatibilidad con estructura de empresas existente
9. ✅ Agregar validación de permisos por empresa

**Estructura actualizada**:
```typescript
interface AuthState {
  // ... campos existentes
  idEmpresaActiva: number | null;  // NUEVO
  obtenerIdEmpresa: () => number | null;  // NUEVO
  guardarIdEmpresa: (id: number) => void;  // NUEVO
  obtenerCampoJwt: (campo: string) => string;  // NUEVO
  obtenerPermisoEspecial: (clave: string) => string;  // NUEVO
  tienePermiso: (permiso: string, idEmpresa?: number) => boolean;  // NUEVO
}
```

### Servicios Adicionales de Seguridad

| Servicio Angular | Servicio React | Ubicación | Prioridad |
|-----------------|---------------|-----------|-----------|
| `UsuarioService` | `usuarioService.ts` | `services/usuarioService.ts` | Media |
| `UsuarioEmpresaService` | `usuarioEmpresaService.ts` | `services/usuarioEmpresaService.ts` | Media |
| `UsuarioGastosService` | Integrado en `gastoService.ts` | `services/gastoService.ts` | Media |
| `RolService` | `rolService.ts` | `services/rolService.ts` | Baja |
| `MenusService` | `menusService.ts` | `services/menusService.ts` | Baja |

---

## 🛣️ Migración de Rutas

### Rutas Angular → React Router

```typescript
// Angular (gestion-de-gastos.routing.module.ts)
{
  path: 'gestion-de-gastos',
  component: GestionDeGastosComponent,
  children: [
    { path: 'listado-gastos', component: ListadoGastosComponent },
    { path: 'mis-gastos', component: MisGastosComponent },
    { path: 'gastos-por-autorizar', component: GastosPorAutorizarComponent },
    { path: 'gastos-autorizados', component: VerGastosAutorizadosComponent },
    { path: 'gastos-por-pagar', component: GastosPorPagarComponent },
  ]
}

// React (routes.config.ts + App.tsx)
export const ROUTES = {
  GASTOS_LISTADO: "/gastos/listado",
  GASTOS_MIS_GASTOS: "/gastos/mis-gastos",
  GASTOS_POR_AUTORIZAR: "/gastos/por-autorizar",
  GASTOS_AUTORIZADOS: "/gastos/autorizados",
  GASTOS_POR_PAGAR: "/gastos/por-pagar",
  // ... más rutas
}
```

**Estructura de rutas React**:
- Rutas principales en `App.tsx`
- Configuración centralizada en `config/routes.config.ts`
- Protección con `RutaProtegida` y permisos

---

## 📦 Migración de Estado

### Estado Angular → Zustand

**Angular**:
- Servicios inyectables con `BehaviorSubject`/`Observable`
- Estado local en componentes
- `localStorage` para persistencia

**React (Zustand)**:
- Store global en `store/gastoStore.ts` (nuevo)
- Estado local con `useState`/`useReducer`
- Persistencia con middleware `persist` de Zustand

**Store a crear**:
```typescript
// store/gastoStore.ts
interface GastoState {
  gastos: Gasto[];
  gastoSeleccionado: Gasto | null;
  filtros: FiltrosGasto;
  // ... más estado
}
```

---

## 🎨 Migración de Componentes UI

### Componentes Reutilizables

| Componente Angular Material | Componente React | Ubicación |
|----------------------------|------------------|-----------|
| `MatTable` | `MaterialReactTable` | `features/tables/` |
| `MatDialog` | `Dialog` (MUI) | `components/` |
| `MatSnackBar` | `GlobalSnackbar` | `components/GlobalSnackbar.tsx` |
| `MatFormField` | `InputField` | `components/InputField.tsx` |
| `MatSelect` | `SelectField` | `components/SelectField.tsx` |
| `MatDatePicker` | `DatePicker` | `components/DatePicker.tsx` |
| `MatCheckbox` | `CustomCheckbox` | `components/CustomCheckbox.tsx` |
| `MatNavList` | `NavList` (custom) | `components/NavList.tsx` (nuevo) |
| `MatDivider` | `Divider` (MUI) | `components/` |
| `MatTooltip` | `Tooltip` (MUI) | `components/Tooltip.tsx` |

### Componentes Especiales de Navegación

#### Landing Page
- **Carrusel de imágenes**: Implementar con `useState` y `useEffect` para auto-play
- **Navegación**: Botones anterior/siguiente con transiciones CSS
- **Animaciones**: Transiciones suaves entre slides

#### Left Menu / Sidebar
- **Menús anidados**: Estructura recursiva con expansión/colapso
- **Filtrado por permisos**: Validar permisos por empresa antes de mostrar
- **Iconos e imágenes**: Soporte para iconos SVG e imágenes
- **Estado colapsado/expandido**: Control de ancho del sidebar
- **Tooltips**: Mostrar nombres cuando el sidebar está colapsado
- **Navegación activa**: Resaltar ruta actual

---

## 🧩 Migración de Helpers y Utilidades

### Helpers a Migrar/Crear

| Helper Angular | Helper React | Ubicación |
|---------------|--------------|-----------|
| `FechasService` | `dateHelpers.ts` | `helpers/dateHelpers.ts` (nuevo) |
| Formateo de moneda | `formatHelpers.ts` | `helpers/formatHelpers.ts` (nuevo) |
| Validaciones de formularios | `validationHelpers.ts` | `helpers/validationHelpers.ts` (nuevo) |
| Manejo de archivos | `fileHelpers.ts` | `helpers/fileHelpers.ts` (nuevo) |

### Servicios de Utilidades

| Servicio Angular | Servicio/Store React | Ubicación |
|-----------------|---------------------|-----------|
| `SidenavService` | `sidenavStore.ts` | `store/sidenavStore.ts` (nuevo) |
| `TituloService` | Integrado en Header | `features/Header.tsx` |
| `PermisosServiceService` | Integrado en permisosHelpers | `helpers/permisosHelpers.ts` |

---

## 🪝 Custom Hooks a Crear

1. **`useGastos.ts`**: Hook para gestión de gastos con React Query
2. **`useAutorizacion.ts`**: Hook para lógica de autorización
3. **`useArchivoComprobacion.ts`**: Hook para manejo de archivos (ya existe, adaptar)
4. **`useFiltrosGastos.ts`**: Hook para filtros y búsqueda
5. **`usePagoGasto.ts`**: Hook para lógica de pago
6. **`usePolizas.ts`**: Hook para gestión de pólizas

---

## 📝 Plan de Ejecución Paso a Paso

### Fase 1: Configuración Base y Sistema de Autenticación (Días 1-3)
- [ ] Instalar dependencias faltantes (React Query, Material UI, etc.)
- [ ] Configurar estructura de carpetas
- [ ] Configurar variables de entorno
- [ ] **Migrar `SeguridadMultiEmpresaService` → `seguridadService.ts`**
- [ ] **Crear `helpers/permisosHelpers.ts` con todas las funciones de permisos**
- [ ] **Adaptar `authStore.ts` para soportar multiempresa**
- [ ] **Migrar modelos de seguridad → `types/seguridad.ts`**
- [ ] **Adaptar `axiosInstance.ts` para usar nuevo sistema de autenticación**
- [ ] **Adaptar `Login.tsx` para usar nuevo servicio de autenticación**
- [ ] Configurar rutas base en `routes.config.ts`
- [ ] **Probar flujo completo de login/logout multiempresa**

### Fase 2: Migración de Servicios (Días 3-5)
- [ ] Migrar `GastoService` completo
- [ ] Migrar servicios de catálogos (centro-costos, cuenta-contable, plazas, etc.)
- [ ] Crear tipos TypeScript desde interfaces Angular
- [ ] Adaptar métodos de Observable a Promise/React Query
- [ ] Probar servicios con React Query

### Fase 3: Migración de Estado (Día 6)
- [ ] Crear `gastoStore.ts` con Zustand
- [ ] Migrar lógica de estado de componentes Angular
- [ ] Configurar persistencia si es necesaria

### Fase 4: Migración de Componentes de Navegación y UI (Días 7-9)
- [ ] **Migrar `LandingPageComponent` → `LandingPage.tsx`**
  - [ ] Implementar carrusel de imágenes con auto-play
  - [ ] Botones de navegación anterior/siguiente
  - [ ] Animaciones de transición
- [ ] **Adaptar `Sidebar.tsx` existente con lógica de `LeftMenuComponent`**
  - [ ] Implementar menús anidados con expansión/colapso
  - [ ] Filtrado de menús por permisos multiempresa
  - [ ] Lógica de permisos dinámicos (`Permiso-{idEmpresa}`)
  - [ ] Menús especiales para Administrador y VisorCorporativo
  - [ ] Integración con sistema de rutas
- [ ] **Migrar `HeaderComponent` → `Header.tsx`**
  - [ ] Selector de empresa activa
  - [ ] Título de página dinámico
- [ ] **Crear `sidenavStore.ts` para estado del sidebar**
- [ ] **Integrar `TituloService` en Header**

### Fase 5: Migración de Componentes Base de Gastos (Días 10-13)
- [ ] Migrar componentes de formularios (FormularioGasto, etc.)
- [ ] Migrar componentes de listado (ListadoGastos, MisGastos)
- [ ] Migrar componentes de autorización (GastosPorAutorizar, GastosAutorizados)
- [ ] Migrar componente de pago (GastosPorPagar)

### Fase 6: Migración de Catálogos (Días 14-16)
- [ ] Migrar CentroCostos
- [ ] Migrar CuentaContable
- [ ] Migrar Plazas
- [ ] Migrar Division
- [ ] Migrar DatosEmpleado
- [ ] Migrar ClaveProducto

### Fase 7: Funcionalidades Adicionales (Días 17-19)
- [ ] Migrar Polizas
- [ ] Migrar Timbrado (si aplica)
- [ ] Migrar Analytics (si aplica)
- [ ] Migrar ConfigParametros

### Fase 8: Helpers y Utilidades (Día 20)
- [ ] Crear helpers de fechas
- [ ] Crear helpers de formato
- [ ] Crear helpers de validación
- [ ] Crear helpers de archivos

### Fase 9: Custom Hooks (Día 21)
- [ ] Crear `useGastos.ts`
- [ ] Crear `useAutorizacion.ts`
- [ ] Crear `useFiltrosGastos.ts`
- [ ] Crear `usePagoGasto.ts`
- [ ] Crear `usePolizas.ts`

### Fase 10: Integración y Pruebas (Días 22-24)
- [ ] Integrar todas las rutas en `App.tsx`
- [ ] Configurar permisos en `routes.config.ts`
- [ ] Probar flujos completos
- [ ] Ajustar estilos y UI
- [ ] Optimizar rendimiento

### Fase 11: Refinamiento (Días 25-26)
- [ ] Revisar y refactorizar código
- [ ] Optimizar queries de React Query
- [ ] Mejorar manejo de errores
- [ ] Documentar código
- [ ] Preparar para producción

---

## 🔧 Consideraciones Técnicas

### 1. Manejo de Fechas
- **Angular**: `DatePipe`, `Date` objects
- **React**: `date-fns` (ya en proyecto base)
- Convertir todas las fechas a strings ISO o usar `date-fns`

### 2. Manejo de Archivos
- **Angular**: `FormData` con `HttpClient`
- **React**: `FormData` con Axios (mismo enfoque)
- Mantener lógica de carga de archivos

### 3. Validación de Formularios
- **Angular**: `FormGroup`, `Validators`
- **React**: `react-hook-form` o validación manual
- Considerar usar `react-hook-form` para formularios complejos

### 4. Tablas y Listados
- **Angular**: `MatTable` con paginación
- **React**: `MaterialReactTable` (ya en proyecto base)
- Migrar lógica de paginación y filtros

### 5. Modales y Diálogos
- **Angular**: `MatDialog`
- **React**: `Dialog` de MUI o `@headlessui/react`
- Adaptar lógica de apertura/cierre

### 6. Notificaciones
- **Angular**: `MatSnackBar`
- **React**: `GlobalSnackbar` (ya existe en proyecto base)
- Usar el sistema de notificaciones existente

---

## 📊 Tipos TypeScript a Migrar

### Interfaces Principales de Gastos

1. **`gastoDTO`** → `Gasto` (ya existe en proyecto base, adaptar)
2. **`archivoComprobacionDTO`** → `ArchivoComprobacion`
3. **`ConceptoGastosDTO`** → `ConceptoGasto`
4. **`GastoAutorizadoDTO`** → `GastoAutorizado`
5. **`GastoRechazadoDTO`** → `GastoRechazado`
6. **`PolizaGastosDTO`** → `PolizaGasto`
7. **`MovimientosCuentaContableDTO`** → `MovimientoCuentaContable`

### Interfaces de Seguridad (CRÍTICO)

1. **`CredencialesUsuarioDTO`** → `CredencialesUsuario`
2. **`RespuestaAutenticacionDTO`** → `RespuestaAutenticacion`
3. **`usuarioGastosDTO`** → `UsuarioGasto`
4. **`usuarioBaseDTO`** → `UsuarioBase`
5. **`UsuarioEstructuraCorporativoDTO`** → `UsuarioEstructuraCorporativo`
6. **`UsuarioEmpresaEstructura`** → `UsuarioEmpresaEstructura`
7. **`usuarioPorCorporativo`** → `UsuarioPorCorporativo`
8. **`usuarioProveedorDTO`** → `UsuarioProveedor`

**Estrategia**: 
- Revisar tipos existentes en proyecto base
- Adaptar tipos de Angular a React
- Mantener consistencia con tipos del backend
- **Crear archivo `types/seguridad.ts` para centralizar tipos de seguridad**

### Interfaces de Navegación

| Interface Angular | Interface React | Ubicación |
|------------------|-----------------|-----------|
| `Page` (left-menu) | `MenuItem` | `types/navigation.ts` (nuevo) |

**Estructura de MenuItem**:
```typescript
interface MenuItem {
  link: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  permiso?: string;
  nestedPages?: MenuItem[];
  expanded?: boolean;
  unico: boolean;
}
```

---

## 🚨 Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **Pérdida de funcionalidad multiempresa** | **CRÍTICO** | **Migrar sistema de autenticación completo primero, pruebas exhaustivas** |
| **Incompatibilidad de permisos por empresa** | **CRÍTICO** | **Migrar todos los guards y funciones de permisos, validar con múltiples empresas** |
| Pérdida de funcionalidad durante migración | Alto | Migración incremental, pruebas continuas |
| Diferencias en manejo de estado | Medio | Documentar diferencias, usar Zustand correctamente |
| Problemas de rendimiento | Medio | Optimizar con React Query, lazy loading |
| Incompatibilidades de tipos | Bajo | Revisar y adaptar tipos cuidadosamente |
| Cambios en API | Bajo | Mantener compatibilidad con backend existente |
| **Token JWT mal decodificado** | **Alto** | **Mantener lógica exacta de decodificación UTF-8** |
| **Permisos dinámicos por empresa no funcionan** | **Alto** | **Validar patrón `Permiso-{idEmpresa}` en todos los casos** |

---

## ✅ Criterios de Aceptación

### Funcionalidades Core
1. ✅ Todas las funcionalidades del módulo Angular están implementadas en React
2. ✅ Los formularios validan correctamente
3. ✅ Las tablas muestran y filtran datos correctamente
4. ✅ La carga de archivos funciona
5. ✅ Las notificaciones se muestran apropiadamente
6. ✅ El código sigue las convenciones del proyecto base
7. ✅ No hay errores de TypeScript
8. ✅ El rendimiento es igual o mejor que Angular
9. ✅ La UI es consistente con el proyecto base

### Sistema de Autenticación Multiempresa (CRÍTICO)
10. ✅ **Login funciona con credenciales multiempresa**
11. ✅ **Token JWT se decodifica correctamente (UTF-8)**
12. ✅ **Permisos por empresa funcionan correctamente (`Permiso-{idEmpresa}`)**
13. ✅ **Cambio de empresa activa funciona**
14. ✅ **Todos los guards/funciones de permisos migrados y funcionando**
15. ✅ **Interceptor de Axios agrega token automáticamente**
16. ✅ **Logout limpia correctamente el estado multiempresa**
17. ✅ **VisorCorporativo tiene acceso a todas las empresas**
18. ✅ **Permisos especiales (UsuarioGastos, Proveedor, etc.) funcionan**
19. ✅ **Validación de permisos en rutas protegidas funciona**
20. ✅ **Sistema funciona con múltiples empresas y corporativos simultáneos**

### Componentes de Navegación y UI
21. ✅ **Landing Page muestra carrusel de imágenes correctamente**
22. ✅ **Landing Page tiene navegación anterior/siguiente funcional**
23. ✅ **Sidebar/Left Menu muestra menús filtrados por permisos**
24. ✅ **Sidebar/Left Menu tiene menús anidados con expansión/colapso**
25. ✅ **Sidebar/Left Menu valida permisos por empresa (`Permiso-{idEmpresa}`)**
26. ✅ **Sidebar/Left Menu muestra menús especiales para Administrador/VisorCorporativo**
27. ✅ **Header muestra empresa activa y título de página correctamente**
28. ✅ **Navegación entre páginas funciona correctamente**

---

## 📚 Recursos y Referencias

- Proyecto base: `FrontMultivaGastosAMEX`
- Proyecto Angular: `ERP_Rfacil_frontend` (rama `gastos`)
- Documentación React Query: https://tanstack.com/query
- Documentación Zustand: https://zustand-demo.pmnd.rs/
- Documentación React Router: https://reactrouter.com/

---

## 🎯 Próximos Pasos

Una vez aprobado este plan:

1. Revisar y ajustar el plan según feedback
2. Crear rama de desarrollo: `feature/migracion-gastos`
3. Iniciar Fase 1: Configuración Base
4. Seguir el plan de ejecución paso a paso
5. Realizar code reviews en cada fase
6. Pruebas continuas durante todo el proceso

---

**Fecha de creación**: [Fecha actual]
**Versión**: 1.0
**Autor**: Plan de Migración
**Estado**: Pendiente de Aprobación

