import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './modules/auth/components/ProtectedRoute'
import RequirePermission from './modules/auth/components/RequirePermission'
import MainLayout from './components/layout/MainLayout'
import { Toaster } from './components/ui/sonner'

const LoginPage = lazy(() => import('./modules/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('./modules/dashboard/pages/DashboardPage'))
const ClientsPage = lazy(() => import('./modules/crm/pages/ClientsPage'))
const ClientFormPage = lazy(() => import('./modules/crm/pages/ClientFormPage'))
const UsuariosPage = lazy(() => import('./modules/administracion/pages/UsuariosPage'))
const CreateUsuarioPage = lazy(() => import('./modules/administracion/pages/CreateUsuarioPage'))
const EditarUsuarioPage = lazy(() => import('./modules/administracion/pages/EditarUsuarioPage'))
const RolesPage = lazy(() => import('./modules/administracion/pages/RolesPage'))
const CreateRolPage = lazy(() => import('./modules/administracion/pages/CreateRolPage'))
const EditarRolPermisosPage = lazy(() => import('./modules/administracion/pages/EditarRolPermisosPage'))
const ProveedoresPage = lazy(() => import('./modules/proveedores/pages/ProveedoresPage'))
const CreateProveedorPage = lazy(() => import('./modules/proveedores/pages/CreateProveedorPage'))
const EditarProveedorPage = lazy(() => import('./modules/proveedores/pages/EditarProveedorPage'))
const ProductosPage = lazy(() => import('./modules/inventario/pages/ProductosPage'))
const CategoriasPage = lazy(() => import('./modules/inventario/pages/CategoriasPage'))
const CreateCategoriaPage = lazy(() => import('./modules/inventario/pages/CreateCategoriaPage'))
const EditarCategoriaPage = lazy(() => import('./modules/inventario/pages/EditarCategoriaPage'))
const CreateProductoPage = lazy(() => import('./modules/inventario/pages/CreateProductoPage'))
const KardexPage = lazy(() => import('./modules/inventario/pages/KardexPage'))
const MovimientosPage = lazy(() => import('./modules/inventario/pages/MovimientosPage'))
const TrasladosPage = lazy(() => import('./modules/inventario/pages/TrasladosPage'))
const CreateTrasladoPage = lazy(() => import('./modules/inventario/pages/CreateTrasladoPage'))
const CreateCompraPage = lazy(() => import('./modules/compras/pages/CreateCompraPage'))
const ComprasPage = lazy(() => import('./modules/compras/pages/ComprasPage'))
const VentasPage = lazy(() => import('./modules/ventas/pages/VentasPage'))
const CreateVentaPage = lazy(() => import('./modules/ventas/pages/CreateVentaPage'))

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center bg-bg-gray">
            <p className="font-dm-sans text-sm font-medium text-gray-500">Cargando…</p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/administracion/usuarios" element={<RequirePermission recurso="usuarios"><UsuariosPage /></RequirePermission>} />
              <Route path="/administracion/usuarios/crear" element={<RequirePermission permiso="crear:usuarios"><CreateUsuarioPage /></RequirePermission>} />
              <Route path="/administracion/usuarios/:idUsuario/editar" element={<RequirePermission permiso="actualizar:usuarios"><EditarUsuarioPage /></RequirePermission>} />
              <Route path="/administracion/usuarios/editar" element={<Navigate to="/administracion/usuarios" replace />} />
              <Route path="/administracion/roles" element={<RequirePermission recurso="roles"><RolesPage /></RequirePermission>} />
              <Route path="/administracion/roles/nuevo" element={<RequirePermission permiso="crear:roles"><CreateRolPage /></RequirePermission>} />
              <Route path="/administracion/roles/permisos" element={<Navigate to="/administracion/roles" replace />} />
              <Route path="/administracion/roles/:idRol/permisos" element={<RequirePermission permiso="actualizar:rol-permisos"><EditarRolPermisosPage /></RequirePermission>} />
              <Route path="/crm/clientes" element={<RequirePermission recurso="clientes"><ClientsPage /></RequirePermission>} />
              <Route path="/crm/clientes/crear" element={<RequirePermission permiso="crear:clientes"><ClientFormPage /></RequirePermission>} />
              <Route path="/crm/clientes/nuevo" element={<RequirePermission permiso="crear:clientes"><ClientFormPage /></RequirePermission>} />
              <Route path="/crm/clientes/editar" element={<Navigate to="/crm/clientes" replace />} />
              <Route path="/crm/clientes/:idCliente/editar" element={<RequirePermission permiso="actualizar:clientes"><ClientFormPage /></RequirePermission>} />
              <Route path="/proveedores" element={<RequirePermission recurso="proveedores"><ProveedoresPage /></RequirePermission>} />
              <Route path="/proveedores/crear" element={<RequirePermission permiso="crear:proveedores"><CreateProveedorPage /></RequirePermission>} />
              <Route path="/proveedores/nuevo" element={<RequirePermission permiso="crear:proveedores"><CreateProveedorPage /></RequirePermission>} />
              <Route path="/proveedores/editar" element={<Navigate to="/proveedores" replace />} />
              <Route path="/proveedores/:idProveedor/editar" element={<RequirePermission permiso="actualizar:proveedores"><EditarProveedorPage /></RequirePermission>} />
              <Route path="/inventario/kardex" element={<RequirePermission recurso="inventario-sucursal"><KardexPage /></RequirePermission>} />
              <Route path="/inventario/movimientos" element={<RequirePermission recurso="movimientos-inventario"><MovimientosPage /></RequirePermission>} />
              <Route path="/inventario/traslados" element={<RequirePermission recurso="traslados"><TrasladosPage /></RequirePermission>} />
              <Route path="/inventario/traslados/crear" element={<RequirePermission permiso="crear:traslados"><CreateTrasladoPage /></RequirePermission>} />
              <Route path="/inventario/productos" element={<RequirePermission recurso="productos"><ProductosPage /></RequirePermission>} />
              <Route path="/inventario/productos/crear" element={<RequirePermission permiso="crear:productos"><CreateProductoPage /></RequirePermission>} />
              <Route path="/inventario/categorias" element={<RequirePermission recurso="categorias-producto"><CategoriasPage /></RequirePermission>} />
              <Route path="/inventario/categorias/crear" element={<RequirePermission permiso="crear:categorias-producto"><CreateCategoriaPage /></RequirePermission>} />
              <Route path="/inventario/categorias/:idCategoria/editar" element={<RequirePermission permiso="actualizar:categorias-producto"><EditarCategoriaPage /></RequirePermission>} />
              <Route path="/compras" element={<RequirePermission recurso="compras"><ComprasPage /></RequirePermission>} />
              <Route path="/compras/crear" element={<RequirePermission permiso="crear:compras"><CreateCompraPage /></RequirePermission>} />
              <Route path="/ventas" element={<RequirePermission recurso="ventas"><VentasPage /></RequirePermission>} />
              <Route path="/ventas/crear" element={<RequirePermission permiso="crear:ventas"><CreateVentaPage /></RequirePermission>} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App