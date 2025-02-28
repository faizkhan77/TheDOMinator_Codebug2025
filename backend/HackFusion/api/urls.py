from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import getRoutes

# ✅ Include router-generated URLs
urlpatterns = [

    path("routes/", getRoutes, name="routes"),
    
]
