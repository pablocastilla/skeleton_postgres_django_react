from django.urls import include, path
from rest_framework import routers

from inventory.views import InventoryItemViewSet

router = routers.DefaultRouter()
router.register("items", InventoryItemViewSet, basename="inventoryitem")

urlpatterns = [
    path("", include(router.urls)),
]
