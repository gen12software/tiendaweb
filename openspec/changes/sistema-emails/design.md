## Context

El sistema de emails actual usa Resend con templates en React Email. La infraestructura base existe y funciona en el happy path, pero tiene bugs que impiden el envío en casos concretos y carece de emails para los eventos más importantes del ciclo de vida de una orden. Los problemas se agrupan en dos capas:

1. **Capa de configuración y confiabilidad** — bugs que hacen que emails no lleguen silenciosamente
2. **Capa de cobertura** — eventos del negocio que no tienen comunicación con el comprador

La tabla `email_logs` ya existe y tiene el mecanismo correcto de deduplicación (usado por expiration-reminders). La estrategia es extenderla para cubrir todos los tipos de email.

---

## Decisions

### D1 — Validación de API key en el cliente Resend

**Decisión**: En `lib/email/client.ts`, cuando `RESEND_API_KEY` está ausente o es `null`, lanzar un `console.error` con un mensaje claro al momento de importar el módulo, no al momento de enviar. Adicionalmente, detectar si la key empieza con `re_test_` y loguear una advertencia de que solo se enviarán mails a la dirección verificada de la cuenta.

**Rationale**: El fallo silencioso actual (el cliente es `null` y cada función loguea un `console.warn`) hace imposible diagnosticar el problema en producción sin revisar logs. Un error en arranque es inmediatamente visible.

**Alternativa descartada**: Lanzar una excepción que frene el servidor. Demasiado agresivo — en staging puede que no haya RESEND_API_KEY intencionalmente.

---

### D2 — `await` en welcome email y manejo de error explícito

**Decisión**: En `app/auth/callback/route.ts`, envolver el envío del welcome email en:

```typescript
try {
  await sendWelcomeEmail(user.email!, fullName)
} catch (err) {
  console.error('[email] welcome email failed', { email: user.email, err })
}
```

El redirect al dashboard ocurre después del bloque, no antes. Si el envío falla, el error queda logueado pero el usuario igual es redirigido — el welcome email no es crítico para la sesión.

**Rationale**: En funciones serverless, una Promise sin `await` puede no resolverse si el runtime termina antes. El `await` garantiza que el envío se complete dentro del mismo ciclo de request.

---

### D3 — Deduplicación de emails de orden y pago via `email_logs`

**Decisión**: Antes de enviar cualquier email de confirmación de orden o pago, verificar en `email_logs` si ya existe una fila con `(user_id_or_order_id, email_type, sent_date)`. Si existe, no reenviar. Si no existe, enviar y luego insertar la fila de log.

Para órdenes de invitado (sin `user_id`), usar `order_id` como identificador en la columna `reference_id` (nueva columna en la migración).

**Esquema de extensión:**

```sql
-- Agregar columna reference_id para identificar órdenes de invitado
ALTER TABLE email_logs ADD COLUMN reference_id TEXT;

-- Nuevos valores válidos para email_type
-- 'order_confirmation', 'payment_confirmation', 'order_status_change', 'order_cancelled'
-- (los existentes son: 'expiration_7d', 'expiration_1d', 'welcome')
```

**Rationale**: El webhook de MercadoPago reintenta notificaciones si no recibe 200. Sin deduplicación, cada reintento dispara un nuevo email. Con `email_logs`, el segundo intento detecta que ya se envió y lo omite.

---

### D4 — Emails de cambio de estado: trigger en `updateOrderAction`

**Decisión**: En `app/admin/ordenes/[id]/actions.ts`, después de hacer el UPDATE del estado de la orden, disparar el email correspondiente según la transición:

| Estado nuevo | Email enviado |
|---|---|
| `en_preparacion` | "Tu pedido está siendo preparado" |
| `enviado` | "Tu pedido fue despachado" + tracking number si está cargado |
| `entregado` | "Tu pedido fue entregado" |
| `cancelado` | Email de cancelación (ver D5) |

El email se envía con `await` dentro de un try/catch — si falla, se loguea el error pero la actualización de estado ya fue confirmada (no se hace rollback por un email fallido).

**Rationale**: El admin es quien mueve los estados — es el momento natural para disparar la comunicación. No requiere infraestructura adicional de eventos.

---

### D5 — Email de cancelación con contexto de reembolso

**Decisión**: El template de cancelación incluye:
- Número de orden y resumen de ítems
- Texto de reembolso condicional: si el pago fue por MercadoPago, incluir el mensaje "El reembolso se procesará en los próximos 5-10 días hábiles según tu banco". Si fue en efectivo u otro medio, el texto es genérico.
- El método de pago se lee de la tabla `payments` al momento de enviar.

**Rationale**: El comprador necesita saber si va a recibir su dinero de vuelta. No incluir esa información genera consultas innecesarias al negocio.

---

### D6 — Aviso de stock bajo: trigger post-decremento en el webhook

**Decisión**: Después de decrementar el stock en el webhook, consultar el stock resultante de cada variante modificada. Si alguna variante queda por debajo del umbral (configurable en `config` de Supabase, default: 5), enviar un email al `config.admin_email` con la lista de variantes en stock bajo.

Deduplicación: un aviso por variante por día (via `email_logs` con `reference_id = variant_id`).

**Rationale**: El webhook es el único lugar donde el stock decrementa, lo que lo convierte en el trigger natural. La deduplicación evita spam de avisos si se venden muchas unidades en el mismo día.

---

### D7 — Resumen semanal via cron

**Decisión**: Nuevo endpoint `POST /api/cron/weekly-summary` protegido con `Authorization: Bearer ${CRON_SECRET}`. Se ejecuta los lunes a las 9:00 AM hora local (configurar en Vercel Cron o servicio externo).

El email incluye:
- Total de órdenes de la semana y monto total
- Top 5 productos más vendidos (por cantidad)
- Órdenes pendientes (en estado `nueva` o `en_preparacion`) que llevan más de 48hs sin actualización

Destinatario: `config.admin_email` de la tabla de configuración.

**Rationale**: El admin necesita visibilidad del negocio sin tener que entrar al panel todos los días. Un resumen lunes a la mañana cubre la semana anterior y ayuda a planificar la semana nueva.

---

## Risks / Trade-offs

**[D3 — deduplicación agrega una query extra por email]** → Latencia marginal (~20ms). Aceptable. La tabla `email_logs` ya tiene índice en `(user_id, email_type, sent_date)` — la query es O(1).

**[D4 — email falla pero el cambio de estado ya fue confirmado]** → El comprador no recibe notificación aunque el estado cambió. Mitigación: el comprador siempre puede ver el estado en la página de seguimiento con su número de orden y email. A futuro se puede agregar un mecanismo de reintento.

**[D6 — aviso de stock bajo puede llegar tarde si el stock era bajo desde antes]** → El aviso solo se dispara cuando una venta baja el stock por debajo del umbral. Si el admin cargó stock manualmente dejándolo en 3 y no hubo ventas, no recibe aviso. Aceptable para el scope de este change — el umbral es una señal de alerta temprana, no un inventario completo.
