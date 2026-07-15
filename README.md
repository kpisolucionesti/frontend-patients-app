# Emerboard Frontend

SPA React con Material UI para el sistema de gestión de emergencias.

## Scripts

```bash
yarn start       # Desarrollo (hot reload en :3000)
yarn build       # Compilación producción a build/
yarn test        # Tests (Jest + React Testing Library)
yarn lint        # ESLint
```

## Componentes principales

| Componente | Ruta | Descripción |
|------------|------|-------------|
| SignIn | `/` | Login por username |
| CurrentPatients | `/patients/emergencia` | Tabla de emergencias activas |
| CaseDetailModal | — | Modal con detalle + indicaciones médicas |
| TablePatients | `/patients/historial` | Historial con filtros y paginación |
| MedicalPlanSection | — | CRUD de indicaciones médicas |
| UsersList | `/patients/configuraciones` | Gestión de usuarios |
| UserPermissionModal | — | Permisos agrupados por secciones |

## Autenticación

Token almacenado en `localStorage`. Se envía como `Authorization: Bearer <token>` en cada request.

## API Endpoint

Configurar `REACT_APP_API_ENDPOINT` en `.env.development` o `.env.production`.

## Testing

```bash
yarn test --watchAll=false   # Una sola ejecución
yarn test                    # Modo watch
```
