import { getSession, loadDb, setSession } from '../db'
import { registerRoute } from '../registry'
import { httpError, parseBody } from '../utils'
import { buildPermisosUsuario, buildUsuarioPerfil } from './shared'
import type { LoginCredentials } from '../../types/auth'

function resolveSession() {
  const session = getSession()
  if (!session) return null

  const db = loadDb()
  const usuario = db.usuarios.find((item) => item.idUsuario === session.idUsuario)
  if (!usuario || !usuario.usuarioActivo) return null

  return { db, usuario }
}

export function registerAuthHandlers(): void {
  registerRoute({
    method: 'POST',
    pattern: /^\/auth\/login$/,
    handler: ({ body }) => {
      const db = loadDb()
      const credentials = parseBody<LoginCredentials>(body)

      if (!credentials?.correoUsuario || !credentials.passwordUsuario) {
        throw httpError(400, 'Correo y contraseña son obligatorios')
      }

      const correo = credentials.correoUsuario.trim().toLowerCase()
      const usuario = db.usuarios.find(
        (item) => item.correoUsuario.toLowerCase() === correo,
      )

      if (
        !usuario ||
        usuario.passwordUsuario !== credentials.passwordUsuario ||
        !usuario.usuarioActivo
      ) {
        throw httpError(401, 'Credenciales inválidas')
      }

      const token = `mock-token-${usuario.idUsuario}`
      setSession({ token, idUsuario: usuario.idUsuario })

      return { accessToken: token, usuario: buildUsuarioPerfil(db, usuario) }
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/auth\/refresh$/,
    handler: () => {
      const session = getSession()
      if (!session) throw httpError(401, 'Sesión no válida')
      return { accessToken: session.token }
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/auth\/logout$/,
    handler: () => {
      setSession(null)
      return { success: true }
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/auth\/me$/,
    handler: () => {
      const found = resolveSession()
      if (!found) throw httpError(401, 'No autorizado')

      const { db, usuario } = found
      return {
        ...buildUsuarioPerfil(db, usuario),
        permisos: buildPermisosUsuario(db, usuario),
      }
    },
  })
}
