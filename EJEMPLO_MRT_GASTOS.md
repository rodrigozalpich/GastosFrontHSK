# Ejemplo: Usar Material React Table con el Store de Gastos

## 📋 Resumen

He refactorizado el store para trabajar de forma óptima con **Material React Table**. La estrategia es:

- **MRT maneja**: Filtros por columna, búsqueda global, paginación, ordenamiento
- **Store maneja**: Filtros complejos, estado de UI, selección, modales

## 🔄 Cambios Realizados

### 1. Store Simplificado (`gastoStore.ts`)

**Eliminado:**
- ❌ `gastosFiltrados` (MRT lo maneja)
- ❌ `paginacion` (MRT lo maneja)
- ❌ `filtrarGastos()` (MRT lo maneja)
- ❌ Filtros simples (estatus, empleado, búsqueda) - MRT los maneja

**Mantenido:**
- ✅ `gastos` - Lista completa de datos
- ✅ `gastoSeleccionado` - Para acciones en filas
- ✅ `filtrosComplejos` - Solo filtros que MRT no maneja bien (rangos de fechas, rangos de montos, lógica de negocio)
- ✅ Estado de UI (modales, modo edición)

### 2. Hook Simplificado (`useGastos.ts`)

Ahora retorna:
- `gastos` - Datos con filtros complejos aplicados (para pasar a MRT)
- `gastosCompletos` - Todos los datos sin filtros complejos
- `filtrosComplejos` - Para componentes de filtro personalizados

## 💡 Ejemplo de Uso

### Componente con Material React Table

```typescript
import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useGastos } from "../hooks/useGastos";
import { useFiltrosGastos } from "../hooks/useFiltrosGastos";
import type { GastoDTO } from "../types/gastos";

export default function ListadoGastos() {
  const { gastos, isLoading, isError } = useGastos();
  const { filtrosComplejos, aplicarFiltro, limpiarTodosLosFiltros } = useFiltrosGastos();

  // Definir columnas para MRT
  const columns = useMemo<MRT_ColumnDef<GastoDTO>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: "Nombre",
        size: 200,
      },
      {
        accessorKey: "nombreEmpleado",
        header: "Empleado",
        size: 150,
        // MRT maneja el filtrado automáticamente
        enableColumnFilter: true,
      },
      {
        accessorKey: "presupuesto",
        header: "Presupuesto",
        size: 120,
        Cell: ({ cell }) =>
          `$${cell.getValue<number>().toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        // MRT maneja filtros numéricos
        filterFn: "between",
      },
      {
        accessorKey: "estatus",
        header: "Estatus",
        size: 120,
        Cell: ({ cell }) => {
          const estatus = cell.getValue<number>();
          const estatusMap: Record<number, { label: string; color: string }> = {
            1: { label: "Abierto", color: "green" },
            2: { label: "Por Comprobar", color: "yellow" },
            3: { label: "En Autorización", color: "blue" },
            4: { label: "Por Pagar", color: "purple" },
          };
          const estado = estatusMap[estatus] || { label: "Finalizado", color: "gray" };
          return (
            <span className={`px-2 py-1 rounded-full text-xs bg-${estado.color}-100 text-${estado.color}-800`}>
              {estado.label}
            </span>
          );
        },
        // MRT maneja el filtrado por estatus
        filterFn: "equals",
      },
      {
        accessorKey: "fechaAlta",
        header: "Fecha Alta",
        size: 120,
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleDateString("es-MX"),
        // MRT maneja filtros de fecha
        filterFn: "dateRange",
      },
    ],
    []
  );

  // Configurar la tabla con MRT
  const table = useMaterialReactTable({
    columns,
    data: gastos, // Datos ya con filtros complejos aplicados
    enableColumnFilters: true, // MRT maneja filtros por columna
    enableGlobalFilter: true, // MRT maneja búsqueda global
    enablePagination: true, // MRT maneja paginación
    enableSorting: true, // MRT maneja ordenamiento
    enableRowSelection: true, // MRT maneja selección de filas
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
    },
    // Opcional: Sincronizar estado con el store si necesitas persistencia
    // state: {
    //   pagination: paginacionDelStore,
    // },
    // onStateChange: (updater) => {
    //   const newState = typeof updater === "function" ? updater(table.getState()) : updater;
    //   // Guardar en store si es necesario
    // },
  });

  return (
    <div className="p-6">
      {/* Filtros complejos personalizados (fuera de MRT) */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Filtros Avanzados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={filtrosComplejos.fechaInicio?.toISOString().split("T")[0] || ""}
              onChange={(e) =>
                aplicarFiltro("fechaInicio", e.target.value ? new Date(e.target.value) : null)
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
            <input
              type="date"
              value={filtrosComplejos.fechaFin?.toISOString().split("T")[0] || ""}
              onChange={(e) =>
                aplicarFiltro("fechaFin", e.target.value ? new Date(e.target.value) : null)
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          {/* Rango de montos */}
          <div>
            <label className="block text-sm font-medium mb-1">Monto Mínimo</label>
            <input
              type="number"
              value={filtrosComplejos.montoMinimo || ""}
              onChange={(e) =>
                aplicarFiltro("montoMinimo", e.target.value ? parseFloat(e.target.value) : null)
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monto Máximo</label>
            <input
              type="number"
              value={filtrosComplejos.montoMaximo || ""}
              onChange={(e) =>
                aplicarFiltro("montoMaximo", e.target.value ? parseFloat(e.target.value) : null)
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          {/* Filtros de negocio */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filtrosComplejos.porAutorizar || false}
              onChange={(e) => aplicarFiltro("porAutorizar", e.target.checked || null)}
              className="rounded"
            />
            <label className="text-sm">Por Autorizar</label>
          </div>
          <button
            onClick={limpiarTodosLosFiltros}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de MRT - Maneja filtros simples, búsqueda, paginación, ordenamiento */}
      {isLoading ? (
        <div>Cargando...</div>
      ) : isError ? (
        <div>Error al cargar datos</div>
      ) : (
        <MaterialReactTable table={table} />
      )}
    </div>
  );
}
```

## 🎯 Ventajas de Esta Estrategia

1. **Menos código**: MRT maneja la mayoría de la lógica de tabla
2. **Mejor UX**: Filtros, búsqueda y paginación integrados y consistentes
3. **Más mantenible**: Separación clara entre filtros simples (MRT) y complejos (store)
4. **Mejor rendimiento**: MRT está optimizado para grandes datasets
5. **Flexibilidad**: Puedes combinar filtros de MRT con filtros complejos del store

## 📚 Recursos

- [Material React Table Docs](https://www.material-react-table.com/)
- [MRT Filtering Guide](https://www.material-react-table.com/docs/guides/column-filtering)
- [MRT State Management](https://www.material-react-table.com/docs/guides/state-management)

