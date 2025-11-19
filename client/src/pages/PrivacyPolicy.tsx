import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Política de Privacidad</h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2>1. Introducción</h2>
          <p>
            Clone Drive ("nosotros", "nuestro" o "el Servicio") se compromete a proteger tu privacidad. 
            Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información 
            cuando utilizas nuestro servicio de copia de archivos de almacenamiento en la nube.
          </p>

          <h2>2. Información que Recopilamos</h2>
          
          <h3>2.1 Información que Proporcionas Directamente</h3>
          <ul>
            <li><strong>Información de cuenta:</strong> nombre, apellido, dirección de correo electrónico</li>
            <li><strong>Credenciales de autenticación:</strong> tokens de acceso OAuth para Google Drive y Dropbox</li>
            <li><strong>Información de perfil:</strong> imagen de perfil (opcional)</li>
          </ul>

          <h3>2.2 Información Recopilada Automáticamente</h3>
          <ul>
            <li><strong>Datos de uso:</strong> URLs de archivos copiados, nombres de archivos, tamaños, fechas de operación</li>
            <li><strong>Metadatos de archivos:</strong> tipo de archivo, proveedor de almacenamiento (Google Drive/Dropbox)</li>
            <li><strong>Información técnica:</strong> dirección IP, tipo de navegador, sistema operativo</li>
            <li><strong>Cookies y tecnologías similares:</strong> para mantener tu sesión y preferencias</li>
          </ul>

          <h3>2.3 Información de Proveedores de Almacenamiento</h3>
          <p>
            Cuando conectas tu cuenta de Google Drive o Dropbox, recibimos:
          </p>
          <ul>
            <li>Información básica de perfil (nombre, email, foto)</li>
            <li>Tokens de acceso para realizar operaciones en tu nombre</li>
            <li>Lista de archivos y carpetas a los que tienes acceso</li>
          </ul>

          <h2>3. Cómo Utilizamos tu Información</h2>
          <p>Utilizamos la información recopilada para:</p>
          <ul>
            <li><strong>Proporcionar el Servicio:</strong> copiar archivos entre cuentas de almacenamiento en la nube</li>
            <li><strong>Gestionar tu cuenta:</strong> autenticación, acceso y configuraciones personales</li>
            <li><strong>Mejorar el Servicio:</strong> análisis de uso, corrección de errores, desarrollo de nuevas funcionalidades</li>
            <li><strong>Comunicarnos contigo:</strong> notificaciones de servicio, actualizaciones importantes</li>
            <li><strong>Seguridad:</strong> detectar y prevenir fraudes, abusos o actividades no autorizadas</li>
            <li><strong>Cumplimiento legal:</strong> responder a solicitudes legales y hacer cumplir nuestros términos</li>
          </ul>

          <h2>4. Acceso a Google Drive y Dropbox</h2>
          
          <h3>4.1 Scopes de Google Drive</h3>
          <p>Solicitamos los siguientes permisos de Google:</p>
          <ul>
            <li><code>https://www.googleapis.com/auth/drive</code> - Acceso completo a Google Drive para copiar archivos</li>
            <li><code>https://www.googleapis.com/auth/drive.file</code> - Acceso a archivos creados por la aplicación</li>
          </ul>

          <h3>4.2 Scopes de Dropbox</h3>
          <p>Solicitamos los siguientes permisos de Dropbox:</p>
          <ul>
            <li>Lectura y escritura de archivos</li>
            <li>Acceso a enlaces compartidos</li>
            <li>Creación de carpetas</li>
          </ul>

          <h3>4.3 Uso Limitado</h3>
          <p>
            El uso que hace Clone Drive de la información recibida de las APIs de Google y Dropbox cumple con las 
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
              Políticas de Datos de Usuario de Google API Services
            </a>, incluyendo los requisitos de Uso Limitado.
          </p>
          <p>
            <strong>NO</strong> transferimos, vendemos ni utilizamos datos de Google Drive o Dropbox para:
          </p>
          <ul>
            <li>Publicidad personalizada</li>
            <li>Perfiles de comportamiento de usuarios</li>
            <li>Entrenar modelos de inteligencia artificial</li>
            <li>Cualquier propósito no directamente relacionado con la funcionalidad de copia de archivos</li>
          </ul>

          <h2>5. Almacenamiento y Seguridad de Datos</h2>
          
          <h3>5.1 Dónde Almacenamos tus Datos</h3>
          <ul>
            <li><strong>Base de datos:</strong> PostgreSQL alojada en Neon (nube)</li>
            <li><strong>Tokens de autenticación:</strong> Encriptados en la base de datos</li>
            <li><strong>Archivos:</strong> NO almacenamos el contenido de tus archivos; solo metadatos</li>
          </ul>

          <h3>5.2 Medidas de Seguridad</h3>
          <ul>
            <li>Conexiones HTTPS/TLS encriptadas</li>
            <li>Tokens OAuth almacenados de forma segura</li>
            <li>Autenticación mediante Supabase con verificación de email</li>
            <li>Gestión de sesiones seguras</li>
            <li>Acceso limitado a datos del servidor</li>
          </ul>

          <h3>5.3 Retención de Datos</h3>
          <p>
            Conservamos tu información mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta 
            en cualquier momento, y eliminaremos tus datos dentro de los 30 días siguientes.
          </p>

          <h2>6. Compartir Información con Terceros</h2>
          <p>NO vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en los siguientes casos:</p>
          
          <h3>6.1 Proveedores de Servicios</h3>
          <ul>
            <li><strong>Supabase:</strong> Autenticación de usuarios</li>
            <li><strong>Neon/PostgreSQL:</strong> Almacenamiento de base de datos</li>
            <li><strong>Render:</strong> Hosting y deployment</li>
            <li><strong>Google/Dropbox:</strong> APIs de almacenamiento en la nube</li>
          </ul>

          <h3>6.2 Requisitos Legales</h3>
          <p>
            Podemos divulgar tu información si es requerido por ley, orden judicial, proceso legal o solicitud 
            gubernamental.
          </p>

          <h2>7. Tus Derechos y Opciones</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li><strong>Acceder:</strong> Solicitar una copia de tu información personal</li>
            <li><strong>Rectificar:</strong> Corregir información inexacta o incompleta</li>
            <li><strong>Eliminar:</strong> Solicitar la eliminación de tu cuenta y datos asociados</li>
            <li><strong>Revocar acceso:</strong> Desconectar Google Drive o Dropbox en cualquier momento</li>
            <li><strong>Portabilidad:</strong> Exportar tus datos en formato legible</li>
            <li><strong>Oponerte:</strong> Rechazar ciertos usos de tu información</li>
          </ul>
          <p>
            Para ejercer estos derechos, contáctanos en: <strong>facupiriz87@gmail.com</strong>
          </p>

          <h2>8. Cookies y Tecnologías de Seguimiento</h2>
          <p>Utilizamos cookies para:</p>
          <ul>
            <li>Mantener tu sesión de usuario iniciada</li>
            <li>Recordar tus preferencias de idioma y tema</li>
            <li>Analizar el uso del servicio (cookies analíticas opcionales)</li>
          </ul>
          <p>
            Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar la funcionalidad del servicio.
          </p>

          <h2>9. Privacidad de Menores</h2>
          <p>
            Nuestro servicio no está dirigido a menores de 13 años. No recopilamos conscientemente información 
            personal de menores de 13 años. Si descubrimos que hemos recopilado información de un menor sin 
            consentimiento parental, tomaremos medidas para eliminar esa información.
          </p>

          <h2>10. Transferencias Internacionales de Datos</h2>
          <p>
            Tus datos pueden ser transferidos y procesados en servidores ubicados fuera de tu país de residencia. 
            Tomamos medidas para garantizar que tus datos reciban un nivel adecuado de protección.
          </p>

          <h2>11. Cambios a esta Política de Privacidad</h2>
          <p>
            Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios significativos 
            publicando la nueva política en esta página y actualizando la fecha de "Última actualización".
          </p>

          <h2>12. Contacto</h2>
          <p>
            Si tienes preguntas, inquietudes o solicitudes sobre esta Política de Privacidad o el manejo de tus datos, 
            contáctanos en:
          </p>
          <p>
            <strong>Email:</strong> facupiriz87@gmail.com
          </p>

          <h2>13. Cumplimiento de GDPR (Usuarios de la UE)</h2>
          <p>
            Si resides en la Unión Europea, tienes derechos adicionales bajo el Reglamento General de Protección de Datos (GDPR):
          </p>
          <ul>
            <li>Base legal para el procesamiento: consentimiento y ejecución de contrato</li>
            <li>Derecho a presentar una queja ante una autoridad supervisora</li>
            <li>Derecho a la portabilidad de datos en formato estructurado</li>
            <li>Derecho a retirar el consentimiento en cualquier momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
