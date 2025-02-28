from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    UserProfileViewSet,
    getRoutes,
    login_view,
    signup_view,
)


# ✅ Create a Router
router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"profiles", UserProfileViewSet, basename="profile")

from rest_framework_simplejwt.views import TokenRefreshView

# ✅ Include router-generated URLs
urlpatterns = [

    path("routes/", getRoutes, name="routes"),
    path("", include(router.urls)),
    path("login/", login_view, name="login"),
    path("signup/", signup_view, name="signup"),
    
]
