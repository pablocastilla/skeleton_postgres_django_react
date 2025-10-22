import type { InventoryItem, InventoryItemInput } from './types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function fetchItems(): Promise<InventoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/items/`)
  if (response.status === 204) {
    return []
  }
  return handleResponse<InventoryItem[]>(response)
}

export async function createItem(
  payload: InventoryItemInput,
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/items/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return handleResponse<InventoryItem>(response)
}

export async function updateItem(
  id: number,
  payload: Partial<InventoryItemInput>,
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return handleResponse<InventoryItem>(response)
}

export async function deleteItem(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
    method: 'DELETE',
  })
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete item ${id}`)
  }
}
