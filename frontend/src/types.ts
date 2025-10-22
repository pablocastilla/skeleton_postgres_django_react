export type InventoryItem = {
  id: number
  name: string
  description: string
  quantity: number
  location: string
  created_at: string
  updated_at: string
}

export type InventoryItemInput = Omit<
  InventoryItem,
  'id' | 'created_at' | 'updated_at'
>
