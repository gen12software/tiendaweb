export interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export interface ProductImage {
  id: string
  url: string
  sort_order: number
}

export interface ProductVariant {
  id: string
  name: string
  options: Record<string, string>
  price_modifier: number
  stock: number
  sku: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  sort_order: number
  stock: number
  created_at: string
  categories?: Pick<Category, 'id' | 'name' | 'slug'> | null
  product_images?: ProductImage[]
  product_variants?: ProductVariant[]
}

export interface ShippingMethod {
  id: string
  name: string
  price: number
  estimated_days: number | null
  is_active: boolean
}

export interface CartItem {
  productId: string
  variantId: string | null
  name: string
  variantName: string | null
  price: number
  image: string | null
  quantity: number
  stock: number
}

export interface OrderAddress {
  full_name: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

export type OrderStatus =
  | 'nueva'
  | 'en_preparacion'
  | 'enviado'
  | 'listo_para_retirar'
  | 'entregado'
  | 'cancelado'

export interface Order {
  id: string
  number: string
  status: OrderStatus
  email: string
  user_id: string | null
  subtotal: number
  shipping_total: number
  total: number
  shipping_address: OrderAddress | null
  shipping_method_id: string | null
  notes: string | null
  tracking_number: string | null
  public_token: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  shipping_methods?: ShippingMethod | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  quantity: number
  unit_price: number
  total_price: number
  snapshot: {
    name: string
    variant_name?: string
    image?: string
  }
}
