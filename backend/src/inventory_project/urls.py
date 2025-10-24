"""
URL configuration for inventory_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path

from django.views.static import serve as static_serve
import os
from django.conf import settings


# Helper function to serve files from dist directory
def serve_from_dist(request, path):
    try:
        print(
            f"Serving file: {path} from {os.path.join(settings.BASE_DIR, 'src', 'static', 'dist')}"
        )
        return static_serve(
            request,
            path=path,
            document_root=os.path.join(settings.BASE_DIR, "src", "static", "dist"),
        )
    except Exception as e:
        print(f"Error serving {path}: {str(e)}")
        raise


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("inventory.urls")),
]

# En producción, WhiteNoise servirá los archivos estáticos incluyendo index.html
