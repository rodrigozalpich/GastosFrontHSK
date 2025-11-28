# Guía: Usar Material React Table en el Proyecto

## 📋 Resumen

A partir de ahora, **todas las tablas del proyecto deben usar Material React Table (MRT)** con la estrategia híbrida implementada.

## 🎯 Estrategia Híbrida

### Material React Table maneja:
- ✅ Filtros por columna (texto, números, fechas)
- ✅ Búsqueda global
- ✅ Paginación
- ✅ Ordenamiento
- ✅ Selección de filas
- ✅ Resize de columnas
- ✅ Densidad de tabla
- ✅ Pantalla completa

### Store (Zustand) maneja:
- ✅ Filtros complejos (rangos de fechas, rangos de montos)
- ✅ Lógica de negocio específica
- ✅ Estado de UI (modales, selección)
- ✅ Persistencia de preferencias

## 📦 Instalación

Material React Table ya está instalado en el proyecto:

```bash
npm i material-react-table @mui/material @mui/x-date-pickers @mui/icons-material @emotion/react @emotion/styled
```

## 🚀 Plantilla Base para Nuevas Tablas

### 1. Estructura Básica

```typescript
import { type JSX, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { MRT_Localization_ES } from "../config/mrtLocalization";
import type { TuTipoDTO } from "../types/tuTipo";

export default function TuTabla(): JSX.Element {
  // 1. Obtener datos (React Query o hook personalizado)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tuDato"],
    queryFn: async () => await tuService.obtenerDatos(),
  });

  // 2. Definir columnas
  const columns = useMemo<MRT_ColumnDef<TuTipoDTO>[]>(
    () => [
      {
        accessorKey: "campo1",
        header: "Campo 1",
        size: 150,
        enableColumnFilter: true,
        enableSorting: true,
      },
      // ... más columnas
    ],
    []
  );

  // 3. Configurar tabla
  const table = useMaterialReactTable({
    columns,
    data: data || [],
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enablePagination: true,
    enableSorting: true,
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
    },
    localization: MRT_Localization_ES,
  });

  // 4. Renderizar
  if (isLoading) return <Loader text="Cargando..." />;
  if (isError) return <ErrorComponent />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Título de la Tabla</h1>
      <div className="bg-white rounded-lg shadow">
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}
```

### 2. Columnas Comunes

#### Columna de Texto
```typescript
{
  accessorKey: "nombre",
  header: "Nombre",
  size: 200,
  enableColumnFilter: true,
  enableSorting: true,
}
```

#### Columna Numérica con Formato
```typescript
{
  accessorKey: "monto",
  header: "Monto",
  size: 120,
  Cell: ({ cell }) => {
    const valor = cell.getValue<number>();
    return `$${valor.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },
  enableColumnFilter: true,
  filterFn: "between", // Para rangos numéricos
}
```

#### Columna de Fecha
```typescript
{
  accessorKey: "fechaAlta",
  header: "Fecha Alta",
  size: 120,
  Cell: ({ cell }) => {
    const fecha = cell.getValue<string | Date>();
    return new Date(fecha).toLocaleDateString("es-MX");
  },
  enableColumnFilter: true,
  filterFn: "dateRange",
}
```

#### Columna con Badge/Estado
```typescript
{
  accessorKey: "estatus",
  header: "Estatus",
  size: 150,
  Cell: ({ cell }) => {
    const estatus = cell.getValue<number>();
    const estatusMap: Record<number, { label: string; className: string }> = {
      1: { label: "Activo", className: "bg-green-100 text-green-800" },
      2: { label: "Inactivo", className: "bg-red-100 text-red-800" },
    };
    const estado = estatusMap[estatus] || { label: "Desconocido", className: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estado.className}`}>
        {estado.label}
      </span>
    );
  },
  enableColumnFilter: true,
  filterFn: "equals",
}
```

#### Columna con Acciones
```typescript
{
  id: "acciones",
  header: "Acciones",
  size: 100,
  Cell: ({ row }) => (
    <div className="flex gap-2">
      <button
        onClick={() => handleEditar(row.original)}
        className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
      >
        Editar
      </button>
      <button
        onClick={() => handleEliminar(row.original.id)}
        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
      >
        Eliminar
      </button>
    </div>
  ),
  enableColumnFilter: false,
  enableSorting: false,
}
```

### 3. Filtros Complejos (si es necesario)

Si necesitas filtros complejos que MRT no maneja bien, usa el componente `FiltrosComplejosGastos` como referencia:

```typescript
import FiltrosComplejosGastos from "../../components/FiltrosComplejosGastos";

// En el componente:
<FiltrosComplejosGastos />
```

O crea tu propio componente de filtros complejos usando `useFiltrosGastos` como referencia.

### 4. Configuración Avanzada

#### Con Selección de Filas
```typescript
const table = useMaterialReactTable({
  columns,
  data,
  enableRowSelection: true,
  onRowSelectionChange: (updater) => {
    const newSelection = typeof updater === "function" 
      ? updater(table.getState().rowSelection) 
      : updater;
    // Manejar selección
  },
});
```

#### Con Acciones de Fila
```typescript
{
  id: "acciones",
  header: "Acciones",
  Cell: ({ row }) => (
    <MRT_RowActionsMenu row={row} table={table} />
  ),
}
```

#### Con Detalle Expandible
```typescript
const table = useMaterialReactTable({
  columns,
  data,
  enableExpanding: true,
  renderDetailPanel: ({ row }) => (
    <div className="p-4">
      <h3>Detalles de {row.original.nombre}</h3>
      {/* Contenido del detalle */}
    </div>
  ),
});
```

## 📚 Ejemplos Implementados

### Tablas Migradas:
1. ✅ `ListadoGastos.tsx` - Listado completo de gastos
2. ✅ `MisGastos.tsx` - Gastos del usuario actual

### Componentes de Soporte:
1. ✅ `FiltrosComplejosGastos.tsx` - Filtros complejos reutilizables

## 🔧 Mejores Prácticas

1. **Siempre memoiza las columnas** con `useMemo`
2. **Usa localización en español** con `MRT_Localization_ES`
3. **Habilita solo las features que necesitas** (mejor rendimiento)
4. **Usa filtros complejos solo cuando sea necesario**
5. **Mantén el estado de UI en el store**, no en MRT
6. **Usa React Query para data fetching**, no MRT directamente

## 📖 Recursos

- [Documentación Oficial de MRT](https://www.material-react-table.com/)
- [Ejemplos de MRT](https://www.material-react-table.com/docs/examples)
- [Guías de MRT](https://www.material-react-table.com/docs/guides)
- [API Reference](https://www.material-react-table.com/docs/api-reference)

## ⚠️ Notas Importantes

- **NO** crees filtros simples en el store si MRT los puede manejar
- **NO** implementes paginación manual si MRT la puede manejar
- **SÍ** usa filtros complejos en el store cuando MRT no los maneja bien
- **SÍ** mantén el estado de UI (modales, selección) en el store

---

**Última actualización**: Fase 3 completada
**Estado**: ✅ Listo para usar en todas las tablas nuevas

