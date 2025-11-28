# Componentes Pendientes de Migración

## 📋 Resumen

Se han migrado todos los componentes principales y rutas críticas del módulo de gastos. Sin embargo, hay algunos componentes secundarios y funcionalidades avanzadas que aún no se han migrado.

## ✅ Componentes Migrados (Principales)

### Páginas Principales
- ✅ ListadoGastos
- ✅ MisGastos
- ✅ GastosPorAutorizar
- ✅ GastosAutorizados
- ✅ GastosPorPagar
- ✅ Polizas
- ✅ Timbrado
- ✅ Analytics
- ✅ ConfigParametros

### Catálogos
- ✅ CentroCostos
- ✅ CuentaContable
- ✅ Plazas
- ✅ Division
- ✅ ClaveProducto

### Modales/Componentes
- ✅ ModalGasto (crear/editar)
- ✅ ModalDetallePoliza
- ✅ ModalResultadoTimbrado
- ✅ Modales de catálogos (CentroCosto, Division, Plaza, CuentaContable, ClaveProducto)

## ⏳ Componentes Pendientes (Secundarios)

### Funcionalidades Avanzadas
1. **Devoluciones** (`gestion-de-gastos/Devoluciones/devoluciones.component.ts`)
   - Componente para manejar devoluciones de gastos
   - Prioridad: Media
   - Estado: No migrado

2. **ViewGastos** (`gestion-de-gastos/mis-gastos/acciones/view-gastos/view-gastos.component.ts`)
   - Modal grande para ver detalles completos de gastos
   - Incluye múltiples acciones: orden mantenimiento, asiento contable, elementos factura
   - Prioridad: Media
   - Estado: Parcialmente cubierto por ModalGasto (modo "ver")

3. **ModificarPoliza** (`gestion-de-gastos/modificar-poliza/modificar-poliza.component.ts`)
   - Componente para modificar pólizas existentes
   - Prioridad: Media
   - Estado: No migrado (solo creación de pólizas está implementada)

### Configuraciones Avanzadas
4. **DatosEmpleado** (`datos-empleado/datos-empleado.component.ts`)
   - Gestión completa de datos de empleados
   - Prioridad: Media
   - Estado: No migrado completamente

5. **CrearArbol** (`crear-arbol/crear-arbol.component.ts`)
   - Creación de árbol de autorizadores
   - Prioridad: Baja
   - Estado: No migrado

6. **ConfigPlazDiv** (`conf-plaz-div/conf-plaz-div.component.ts`)
   - Configuración de plazas y divisiones
   - Prioridad: Baja
   - Estado: No migrado

7. **ConfigCuentaContable** (`conf-cuenta-contable/conf-cuenta-contable.component.ts`)
   - Configuración de cuentas contables
   - Prioridad: Baja
   - Estado: No migrado

8. **ConfigCentroCostos** (`conf-centro-costos/conf-centro-costos.component.ts`)
   - Configuración de centros de costos
   - Prioridad: Baja
   - Estado: No migrado

### Acciones/Modales Secundarios
9. **AddOrdenMantenimiento** (`mis-gastos/acciones/view-gastos/acciones/add-orden-mantenimiento`)
   - Agregar orden de mantenimiento a un gasto
   - Prioridad: Baja
   - Estado: No migrado

10. **AddAsientoContable** (`mis-gastos/acciones/view-gastos/acciones/add-asiento-contable`)
    - Agregar asiento contable a un gasto
    - Prioridad: Baja
    - Estado: No migrado

11. **ElementosFactura** (`mis-gastos/acciones/elementos-factura`)
    - Gestión de elementos de factura
    - Prioridad: Baja
    - Estado: No migrado

12. **SeeSharedExpense** (`acciones/see-shared-expense`)
    - Ver gastos compartidos
    - Prioridad: Baja
    - Estado: No migrado

13. **AddNewEstadoCuenta** (`acciones/add-new-estado-cuenta`)
    - Agregar estado de cuenta
    - Prioridad: Baja
    - Estado: No migrado

14. **ModalRechazarGasto** (`gastos-por-autorizar/acciones/modal-rechazar-gasto`)
    - Modal para rechazar gastos
    - Prioridad: Media
    - Estado: Parcialmente cubierto en GastosPorAutorizar

## 🎯 Conclusión

**Los componentes principales y críticos están migrados.** Los componentes pendientes son principalmente:
- Funcionalidades secundarias/avanzadas
- Configuraciones opcionales
- Acciones específicas dentro de modales

**Recomendación**: Continuar con la Fase 9 (Custom Hooks) ya que los componentes críticos están migrados. Los componentes pendientes pueden migrarse en fases posteriores según necesidad.

