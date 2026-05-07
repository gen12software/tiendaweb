import { getSiteConfig } from '@/lib/site-config'

export type PaymentMethodId = 'mercadopago' | 'transferencia' | 'efectivo'

export interface PaymentMethodConfig {
  id: PaymentMethodId
  label: string
  description: string
}

export const ALL_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'mercadopago',   label: 'Mercado Pago',       description: 'Pagá con tarjeta, débito o dinero en cuenta' },
  { id: 'transferencia', label: 'Transferencia bancaria', description: 'Transferí desde tu banco o billetera virtual' },
  { id: 'efectivo',      label: 'Efectivo en local',   description: 'Abonás al retirar o al recibir el pedido' },
]

export interface EnabledPaymentMethods {
  methods: PaymentMethodConfig[]
  transferCbu: string
  transferAlias: string
  transferMessage: string
}

export async function getEnabledPaymentMethods(): Promise<EnabledPaymentMethods> {
  const config = await getSiteConfig()
  const enabled = config.payment_methods_enabled
    ? config.payment_methods_enabled.split(',').map((s) => s.trim()).filter(Boolean)
    : ['mercadopago']

  const methods = ALL_PAYMENT_METHODS.filter((m) => enabled.includes(m.id))

  return {
    methods: methods.length > 0 ? methods : [ALL_PAYMENT_METHODS[0]],
    transferCbu: config.transfer_cbu,
    transferAlias: config.transfer_alias,
    transferMessage: config.transfer_message,
  }
}
