import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
          <h1>Términos de Servicio</h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar Clone Drive ("el Servicio"), aceptas estar sujeto a estos Términos de Servicio. 
            Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
          </p>

          <h2>2. Descripción del Servicio</h2>
          <p>
            Clone Drive es una aplicación web que permite a los usuarios copiar archivos y carpetas desde enlaces 
            compartidos de Google Drive y Dropbox a su propia cuenta de almacenamiento en la nube. El servicio 
            actúa como intermediario para facilitar la transferencia de archivos entre cuentas de almacenamiento.
          </p>

          <h2>3. Requisitos de Cuenta</h2>
          <p>Para utilizar el Servicio, debes:</p>
          <ul>
            <li>Tener al menos 13 años de edad</li>
            <li>Proporcionar información de registro precisa y completa</li>
            <li>Mantener la seguridad de tu cuenta y contraseña</li>
            <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
          </ul>

          <h2>4. Uso Aceptable</h2>
          <p>Te comprometes a NO utilizar el Servicio para:</p>
          <ul>
            <li>Copiar, almacenar o distribuir contenido que viole derechos de autor, marcas registradas u otros derechos de propiedad intelectual</li>
            <li>Distribuir malware, virus o cualquier código malicioso</li>
            <li>Realizar actividades ilegales o fraudulentas</li>
            <li>Intentar obtener acceso no autorizado a nuestros sistemas o a las cuentas de otros usuarios</li>
            <li>Sobrecargar o interferir con la infraestructura del Servicio</li>
            <li>Copiar archivos de los cuales no tienes permiso legítimo de acceso</li>
          </ul>

          <h2>5. Autorización de Google Drive y Dropbox</h2>
          <p>
            Al conectar tu cuenta de Google Drive o Dropbox, nos autorizas a:
          </p>
          <ul>
            <li>Acceder a archivos y carpetas compartidos contigo</li>
            <li>Crear copias de archivos en tu almacenamiento personal</li>
            <li>Leer metadatos de archivos (nombre, tamaño, tipo)</li>
          </ul>
          <p>
            Puedes revocar este acceso en cualquier momento desde la configuración de tu cuenta de Google o Dropbox.
          </p>

          <h2>6. Límites del Servicio</h2>
          <p>El Servicio puede tener límites en:</p>
          <ul>
            <li>Número de operaciones de copia por día</li>
            <li>Tamaño máximo de archivos que se pueden copiar</li>
            <li>Cantidad total de almacenamiento utilizado</li>
            <li>Número de operaciones concurrentes</li>
          </ul>
          <p>
            Estos límites pueden variar según tu plan de membresía y pueden cambiar sin previo aviso.
          </p>

          <h2>7. Propiedad Intelectual</h2>
          <p>
            El Servicio y su contenido original (excluyendo el contenido proporcionado por los usuarios) son propiedad 
            de Clone Drive y están protegidos por derechos de autor, marcas registradas y otras leyes.
          </p>

          <h2>8. Responsabilidad del Usuario por el Contenido</h2>
          <p>
            Eres el único responsable de todo el contenido que copies, almacenes o compartas a través del Servicio. 
            Garantizas que tienes todos los derechos necesarios sobre el contenido que procesas a través de nuestro servicio.
          </p>

          <h2>9. Limitación de Responsabilidad</h2>
          <p>
            EN LA MEDIDA MÁXIMA PERMITIDA POR LA LEY, CLONE DRIVE NO SERÁ RESPONSABLE DE:
          </p>
          <ul>
            <li>Pérdida de datos, archivos o información</li>
            <li>Interrupciones del servicio o errores técnicos</li>
            <li>Daños indirectos, incidentales o consecuentes</li>
            <li>Uso no autorizado de tu cuenta</li>
            <li>Contenido copiado que viole derechos de terceros</li>
          </ul>
          <p>
            EL SERVICIO SE PROPORCIONA "TAL CUAL" SIN GARANTÍAS DE NINGÚN TIPO, YA SEAN EXPRESAS O IMPLÍCITAS.
          </p>

          <h2>10. Modificaciones al Servicio</h2>
          <p>
            Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio (o cualquier parte del mismo) 
            en cualquier momento, con o sin previo aviso. No seremos responsables ante ti ni ante terceros por cualquier 
            modificación, suspensión o discontinuación del Servicio.
          </p>

          <h2>11. Terminación</h2>
          <p>
            Podemos terminar o suspender tu acceso al Servicio inmediatamente, sin previo aviso, por cualquier motivo, 
            incluyendo, sin limitación, si incumples estos Términos de Servicio.
          </p>

          <h2>12. Cambios a los Términos</h2>
          <p>
            Nos reservamos el derecho de actualizar estos Términos en cualquier momento. Te notificaremos sobre cambios 
            significativos publicando los nuevos términos en esta página y actualizando la fecha de "Última actualización".
          </p>

          <h2>13. Ley Aplicable</h2>
          <p>
            Estos Términos se regirán e interpretarán de acuerdo con las leyes de tu jurisdicción local, 
            sin dar efecto a ningún principio de conflictos de leyes.
          </p>

          <h2>14. Contacto</h2>
          <p>
            Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos en:
          </p>
          <p>
            <strong>Email:</strong> facupiriz87@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
