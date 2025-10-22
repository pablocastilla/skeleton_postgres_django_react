from django.contrib import admin

from inventory.models import InventoryItem


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("name", "quantity", "location", "updated_at")
    search_fields = ("name", "location")
