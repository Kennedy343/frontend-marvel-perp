import { registerAdministracionHandlers } from './administracion'
import { registerAuthHandlers } from './auth'
import { registerCatalogosHandlers } from './catalogos'
import { registerComprasHandlers } from './compras'
import { registerCrmHandlers } from './crm'
import { registerInventarioHandlers } from './inventario'
import { registerMovimientosHandlers } from './movimientos'
import { registerPreciosHandlers } from './precios'
import { registerProveedoresHandlers } from './proveedores'
import { registerVentasHandlers } from './ventas'

registerAuthHandlers()
registerCatalogosHandlers()
registerAdministracionHandlers()
registerCrmHandlers()
registerProveedoresHandlers()
registerInventarioHandlers()
registerMovimientosHandlers()
registerPreciosHandlers()
registerComprasHandlers()
registerVentasHandlers()
