export interface Neighborhood {
  id: string
  name: string
}

export interface City {
  id: string
  name: string
  slug: string
  neighborhoods: Neighborhood[]
}

export interface Amenity {
  id: string
  label: string
  slug: string
}
