import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y tratamiento de datos personales.',
}

export default function PrivacidadPage() {
  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-gray-500">Última actualización: mayo de 2025</p>

        <div className="prose prose-gray mt-10 max-w-none text-gray-700 space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Responsable del tratamiento</h2>
            <p className="mt-3 leading-7">
              El titular de la plataforma es responsable del tratamiento de los datos personales
              recolectados a través de este sitio. Para cualquier consulta relacionada con el tratamiento
              de tus datos podés contactarnos a través de la sección{' '}
              <a href="/contacto" className="text-indigo-600 hover:underline">Contacto</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Datos que recolectamos</h2>
            <p className="mt-3 leading-7">
              Al registrarte y utilizar la plataforma recolectamos los siguientes datos:
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1 leading-7">
              <li><strong>Datos de registro:</strong> nombre completo y dirección de correo electrónico.</li>
              <li><strong>Datos de pago:</strong> los pagos son procesados por MercadoPago. No almacenamos datos de tarjetas ni información bancaria sensible.</li>
              <li><strong>Datos de uso:</strong> información sobre el contenido accedido, fechas de acceso y preferencias de navegación.</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador y dispositivo, con fines de seguridad y mejora del servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Finalidad del tratamiento</h2>
            <p className="mt-3 leading-7">
              Utilizamos tus datos personales para:
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1 leading-7">
              <li>Gestionar tu cuenta y el acceso al contenido contratado.</li>
              <li>Procesar y verificar pagos.</li>
              <li>Enviarte notificaciones relacionadas con tu cuenta (activación de plan, vencimientos, confirmaciones).</li>
              <li>Mejorar la experiencia de uso de la plataforma.</li>
              <li>Cumplir obligaciones legales aplicables.</li>
            </ul>
            <p className="mt-3 leading-7">
              No utilizamos tus datos para fines publicitarios ni los cedemos a terceros con ese propósito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Base legal del tratamiento</h2>
            <p className="mt-3 leading-7">
              El tratamiento de tus datos se basa en:
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1 leading-7">
              <li><strong>Ejecución del contrato:</strong> los datos son necesarios para prestarte el servicio contratado.</li>
              <li><strong>Consentimiento:</strong> al registrarte aceptás esta Política de Privacidad.</li>
              <li><strong>Obligación legal:</strong> en los casos requeridos por la normativa vigente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Compartición de datos con terceros</h2>
            <p className="mt-3 leading-7">
              Tus datos pueden ser compartidos únicamente con:
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1 leading-7">
              <li>
                <strong>MercadoPago:</strong> para el procesamiento de pagos. Aplica la{' '}
                <a
                  href="https://www.mercadopago.com.ar/privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  política de privacidad de MercadoPago
                </a>.
              </li>
              <li>
                <strong>Supabase:</strong> proveedor de base de datos e infraestructura. Los datos se
                almacenan en servidores con altos estándares de seguridad.
              </li>
              <li>
                <strong>Autoridades competentes:</strong> cuando así lo requiera la ley argentina.
              </li>
            </ul>
            <p className="mt-3 leading-7">
              No vendemos ni cedemos tus datos a terceros con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Seguridad de los datos</h2>
            <p className="mt-3 leading-7">
              Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos contra
              accesos no autorizados, pérdida o alteración. Las contraseñas se almacenan cifradas y nunca
              en texto plano. La comunicación entre tu navegador y nuestros servidores se realiza mediante
              protocolo HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Conservación de los datos</h2>
            <p className="mt-3 leading-7">
              Conservamos tus datos mientras tu cuenta esté activa. Si solicitás la eliminación de tu
              cuenta, procederemos a eliminar o anonimizar tus datos personales salvo que exista una
              obligación legal de conservarlos (por ejemplo, comprobantes de pago por el plazo legal
              establecido).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Tus derechos</h2>
            <p className="mt-3 leading-7">
              De acuerdo con la Ley N.° 25.326 de Protección de Datos Personales de la República
              Argentina, tenés derecho a:
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1 leading-7">
              <li><strong>Acceso:</strong> conocer qué datos tuyos tenemos almacenados.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios para la finalidad que motivó su recolección.</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos en determinadas circunstancias.</li>
            </ul>
            <p className="mt-3 leading-7">
              Para ejercer cualquiera de estos derechos, contactanos a través de la sección{' '}
              <a href="/contacto" className="text-indigo-600 hover:underline">Contacto</a>. La AGPD
              (Agencia de Acceso a la Información Pública) es el organismo de control en materia de
              protección de datos personales en Argentina.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Cookies</h2>
            <p className="mt-3 leading-7">
              Utilizamos cookies de sesión estrictamente necesarias para mantener tu sesión iniciada.
              No utilizamos cookies de seguimiento publicitario ni compartimos información de navegación
              con redes publicitarias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Cambios en esta política</h2>
            <p className="mt-3 leading-7">
              Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos los cambios
              relevantes a través de la plataforma. El uso continuado del servicio tras la publicación de
              cambios implica tu aceptación.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
