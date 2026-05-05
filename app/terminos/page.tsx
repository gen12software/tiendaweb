import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso del servicio.',
}

export default function TerminosPage() {
  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Términos y Condiciones
        </h1>
        <p className="mt-2 text-sm text-gray-500">Última actualización: mayo de 2025</p>

        <div className="prose prose-gray mt-10 max-w-none text-gray-700 space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Aceptación de los términos</h2>
            <p className="mt-3 leading-7">
              Al registrarte y utilizar esta plataforma, aceptás estos Términos y Condiciones en su totalidad.
              Si no estás de acuerdo con alguno de los puntos aquí descritos, no debés utilizar el servicio.
              Estos términos constituyen un acuerdo legal entre vos (el usuario) y el titular del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Descripción del servicio</h2>
            <p className="mt-3 leading-7">
              La plataforma ofrece acceso a contenido digital (videos, materiales y recursos) mediante la
              contratación de planes de suscripción pagos. El acceso al contenido queda habilitado una vez
              confirmado el pago correspondiente al plan elegido.
            </p>
            <p className="mt-3 leading-7">
              El contenido disponible puede modificarse, ampliarse o actualizarse sin previo aviso. El
              titular se reserva el derecho de discontinuar cualquier contenido o funcionalidad en cualquier
              momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Registro y cuenta de usuario</h2>
            <p className="mt-3 leading-7">
              Para acceder al contenido es necesario crear una cuenta con un correo electrónico válido y una
              contraseña segura. Sos responsable de mantener la confidencialidad de tus credenciales y de
              todas las actividades que ocurran bajo tu cuenta. En caso de uso no autorizado, debés
              notificarnos de inmediato.
            </p>
            <p className="mt-3 leading-7">
              No está permitido compartir tu cuenta con terceros ni ceder el acceso de ninguna forma. El
              incumplimiento de esta condición podrá dar lugar a la suspensión inmediata de la cuenta sin
              derecho a reembolso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Planes y pagos</h2>
            <p className="mt-3 leading-7">
              Los precios de los planes se expresan en pesos argentinos (ARS) e incluyen los impuestos
              aplicables. El pago se procesa a través de MercadoPago. El acceso se habilita automáticamente
              una vez acreditado el pago.
            </p>
            <p className="mt-3 leading-7">
              Los planes tienen una duración determinada (expresada en días) desde la fecha de activación.
              Al vencimiento, el acceso se suspende automáticamente y no se realizan renovaciones
              automáticas salvo que se contrate un nuevo plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Política de reembolsos</h2>
            <p className="mt-3 leading-7">
              Dado que se trata de contenido digital con acceso inmediato tras la compra, no se realizan
              reembolsos una vez que el plan haya sido activado. En caso de problemas técnicos imputables
              al servicio, podrá evaluarse una compensación a criterio del titular.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Propiedad intelectual</h2>
            <p className="mt-3 leading-7">
              Todo el contenido disponible en la plataforma (videos, textos, imágenes, materiales
              descargables) es propiedad del titular o se utiliza bajo licencia. Queda prohibida la
              reproducción, distribución, modificación o comercialización del contenido sin autorización
              expresa y por escrito del titular.
            </p>
            <p className="mt-3 leading-7">
              La compra de un plan otorga únicamente una licencia de uso personal, intransferible y no
              exclusiva para acceder al contenido durante la vigencia del plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Conducta del usuario</h2>
            <p className="mt-3 leading-7">
              Está prohibido utilizar la plataforma para fines ilegales, difamar a terceros, distribuir
              contenido malicioso, o intentar acceder a sistemas sin autorización. El incumplimiento de
              estas normas habilitará al titular a suspender o cancelar la cuenta del usuario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Limitación de responsabilidad</h2>
            <p className="mt-3 leading-7">
              El servicio se provee "tal cual". El titular no garantiza disponibilidad ininterrumpida y
              no se responsabiliza por daños directos o indirectos derivados del uso o imposibilidad de
              uso de la plataforma, incluyendo pérdida de datos o lucro cesante.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Modificaciones</h2>
            <p className="mt-3 leading-7">
              El titular podrá modificar estos Términos y Condiciones en cualquier momento. Los cambios
              se comunicarán a través de la plataforma y entrarán en vigencia a los 10 días de su
              publicación. El uso continuado del servicio implica la aceptación de los términos
              actualizados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Jurisdicción</h2>
            <p className="mt-3 leading-7">
              Estos Términos se rigen por las leyes de la República Argentina. Ante cualquier
              controversia, las partes se someten a la jurisdicción de los tribunales ordinarios de la
              Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero que pudiere
              corresponder.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">11. Contacto</h2>
            <p className="mt-3 leading-7">
              Para consultas sobre estos Términos y Condiciones podés contactarnos a través de la
              sección <a href="/contacto" className="text-indigo-600 hover:underline">Contacto</a> de la plataforma.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
