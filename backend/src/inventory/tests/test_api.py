import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from inventory.models import InventoryItem


@pytest.fixture()
def api_client() -> APIClient:
    return APIClient()


@pytest.mark.django_db()
def test_create_inventory_item(api_client: APIClient) -> None:
    url = reverse("inventoryitem-list")
    payload = {
        "name": "Laptop",
        "description": "Ultrabook",
        "quantity": 5,
        "location": "HQ",
    }

    response = api_client.post(url, payload, format="json")

    assert response.status_code == 201
    item = InventoryItem.objects.get()
    assert item.name == payload["name"]
    assert item.quantity == payload["quantity"]


@pytest.mark.django_db()
def test_list_inventory_items(api_client: APIClient) -> None:
    InventoryItem.objects.create(name="Mouse", quantity=10)
    InventoryItem.objects.create(name="Keyboard", quantity=6)

    url = reverse("inventoryitem-list")
    response = api_client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = {entry["name"] for entry in data}
    assert names == {"Mouse", "Keyboard"}
