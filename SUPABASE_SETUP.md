# Configuración de Supabase - Guía de Solución para Enlaces de Verificación

## 🔴 Problema Identificado

El error "El enlace de verificación no es válido o ha expirado" ocurre por dos razones principales:

1. **URLs de redirección no configuradas correctamente** en el dashboard de Supabase
2. **Email scanners** (especialmente en Outlook/Microsoft 365) que escanean automáticamente los enlaces y consumen el token antes de que el usuario haga clic

## ✅ Solución Implementada

Se ha actualizado el código para incluir:
- Una **página intermedia de verificación** (`/auth/verify`) que previene el consumo prematuro de tokens
- Mejor manejo de errores con mensajes descriptivos
- URLs de redirección dinámicas que se adaptan al entorno

## 📋 Pasos de Configuración en Supabase

### 1. Acceder a la Configuración de URLs

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a: **Authentication** → **URL Configuration**

### 2. Configurar Site URL

En el campo **Site URL**, ingresa tu dominio principal de producción:

```
https://tu-app.onrender.com
```

**⚠️ Importante:** Reemplaza `tu-app.onrender.com` con el dominio real de tu aplicación en Render.

### 3. Configurar Redirect URLs

En el campo **Redirect URLs**, agrega las siguientes URLs (una por línea):

```
https://tu-app.onrender.com/auth/verify
https://tu-app.onrender.com/auth/confirm
https://tu-app.onrender.com/**
http://localhost:5000/auth/verify
http://localhost:5000/auth/confirm
```

**Notas:**
- La línea con `/**` permite cualquier ruta en tu dominio (útil para desarrollo)
- Las URLs de `localhost` son para pruebas en desarrollo local
- **DEBES** reemplazar `tu-app.onrender.com` con tu dominio real

### 4. Verificar Email Template

**IMPORTANTE:** No es necesario modificar el template de email. El sistema funciona con la configuración por defecto de Supabase.

El flujo funciona automáticamente:
1. El usuario hace clic en el enlace del email
2. Supabase redirige a `/auth/verify` (página intermedia)
3. El usuario hace clic en "Confirmar mi correo" 
4. La verificación se completa

Esto previene que email scanners consuman el token automáticamente, ya que se requiere una acción explícita del usuario.

### 5. Verificar Variables de Entorno en Render

Asegúrate de que en tu proyecto de Render estén configuradas estas variables:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Cómo Probar

1. **Limpiar cookies y caché** del navegador
2. Registrarse con un nuevo email
3. Revisar el correo de confirmación
4. Hacer clic en el enlace
5. Deberías ver una página intermedia con un botón "Confirmar mi correo"
6. Al hacer clic en el botón, se completará la verificación

## 🔍 Solución de Problemas

### Si el enlace sigue expirando:

1. **Verifica que las URLs en Supabase coincidan exactamente** con las de tu aplicación
2. **Revisa que no haya espacios o caracteres extra** en las URLs configuradas
3. **Asegúrate de que el protocolo sea correcto** (https en producción, http en desarrollo)

### Si aparece "Invalid redirect URL":

- Las URLs en el código deben estar EXACTAMENTE como están configuradas en Supabase
- Verifica que hayas guardado los cambios en el dashboard de Supabase

### Si el email no llega:

1. Revisa la carpeta de spam
2. Verifica que el email esté correctamente escrito
3. En el dashboard de Supabase, ve a **Authentication** → **Users** para ver si el usuario fue creado
4. Si aparece como "email not confirmed", el registro funcionó pero el email no llegó

### Para depurar en producción:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network" o "Red"
3. Intenta el registro nuevamente
4. Revisa si hay errores en las peticiones a Supabase
5. Copia cualquier mensaje de error y compártelo si necesitas ayuda adicional

## 📝 Cambios Realizados en el Código

1. **Nueva página**: `client/src/pages/EmailVerification.tsx` - Página intermedia de confirmación
2. **Actualizado**: `client/src/components/auth/SignupForm.tsx` - Cambio de redirect URL a `/auth/verify`
3. **Actualizado**: `client/src/pages/EmailConfirmation.tsx` - Mejor manejo de errores
4. **Actualizado**: `client/src/App.tsx` - Nueva ruta `/auth/verify`
5. **Actualizado**: `replit.md` - Documentación de la arquitectura

## 🎯 Próximos Pasos

1. Configurar las URLs en Supabase según esta guía
2. Hacer push de los cambios a GitHub
3. Esperar a que Render depliegue los cambios
4. Probar el flujo completo de registro

## ⚠️ Recordatorio Importante

Cada vez que cambies el dominio de tu aplicación o agregues un nuevo entorno (staging, preview, etc.), debes actualizar las Redirect URLs en Supabase para incluir los nuevos dominios.
