export interface Tour {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  price: number
  currency: string
  duration_days: number
  destination: string
  country: string
  category: string
  image_url: string
  gallery: string[]
  featured: boolean
  rating: number
  review_count: number
  max_persons: number
  departure_date?: string
  includes: string[]
  excludes: string[]
  created_at: string
}

export interface Destination {
  id: string
  name: string
  country: string
  description: string
  image_url: string
  tour_count: number
  slug: string
}

export interface Testimonial {
  id: string
  name: string
  avatar_url: string
  rating: number
  comment: string
  tour_title: string
  date: string
}

export interface SliderItem {
  id: string
  type: 'image' | 'video'
  src: string
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}
