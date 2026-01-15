# Resumen del Proyecto: App de Gestión y Sincronización de Archivos (Cloud Sync)

## 1. Propósito de la Aplicación
Una plataforma centralizada para gestionar, transferir y sincronizar archivos entre diferentes servicios de almacenamiento en la nube (Google Drive y Dropbox), con capacidades avanzadas de detección de duplicados y automatización de tareas.

## 2. Funcionalidades Principales

### A. Gestión de Archivos y Transferencia
- **Conectividad Multi-nube:** Conexión mediante OAuth a Google Drive y Dropbox.
- **Explorador de Archivos:** Navegación por carpetas de ambos servicios en una única interfaz.
- **Copia y Transferencia:** Capacidad de mover o copiar archivos y carpetas completas entre Google Drive y Dropbox directamente desde el servidor (sin consumir ancho de banda local del usuario).

### B. Sincronización (Sync Service)
- **Sincronización Unidireccional/Bidireccional:** Configuración de reglas para mantener carpetas idénticas entre servicios.
- **Monitoreo de Cambios:** El sistema detecta cambios en las fuentes y replica las acciones según la configuración.
- **Frecuencia:** Soporte para ejecuciones programadas (diarias, semanales, etc.).

### C. Detección de Duplicados (Duplicate Detection)
- **Escaneo Inteligente:** Algoritmo que compara archivos basados en nombre, tamaño y hash (cuando está disponible) para identificar archivos repetidos en una o varias cuentas.
- **Limpieza Automática:** Herramientas para seleccionar y eliminar duplicados de forma masiva para ahorrar espacio.

### D. Automatización y Tareas (Scheduler)
- **Cola de Tareas:** Procesamiento en segundo plano para operaciones largas (transferencias masivas).
- **Programador:** Ejecución automática de sincronizaciones sin intervención del usuario.

## 3. Arquitectura Técnica

### Backend (Node.js/Express)
- **Storage:** Implementación de persistencia de datos (Drizzle ORM con PostgreSQL).
- **Servicios Integrados (`server/services`):**
    - `googleDriveService.ts`: Lógica de API para Google.
    - `dropboxService.ts`: Lógica de API para Dropbox.
    - `syncService.ts`: Motor de sincronización.
    - `duplicateDetectionService.ts`: Lógica de comparación de archivos.
    - `schedulerService.ts`: Manejo de tareas programadas.
- **Seguridad:** Autenticación de usuarios y manejo seguro de tokens de acceso (OAuth).

### Frontend (React + Tailwind CSS)
- **UI Moderna:** Basada en componentes de Shadcn/UI.
- **Internacionalización (i18n):** Soporte completo para Español e Inglés (ubicado en `public/locales`).
- **Estado Global:** Uso de React Query para la gestión de datos asíncronos.

## 4. Esquema de Datos Clave (`shared/schema.ts`)
- **Users:** Perfiles de usuario y configuración.
- **Accounts:** Tokens y credenciales de servicios vinculados.
- **Jobs/Tasks:** Registro de operaciones activas, pendientes y completadas.
- **SyncRules:** Definición de qué carpetas se sincronizan y cómo.

## 5. Textos y Copys (Extracto de `public/locales/es`)
- **Copy:** "Copia tus archivos entre nubes de forma segura."
- **Sync:** "Sincronización en tiempo real para que nunca pierdas un archivo."
- **Duplicates:** "Optimiza tu almacenamiento eliminando lo que no necesitas."

---
*Este documento fue generado para facilitar la discusión sobre modelos de negocio y planes de suscripción.*
