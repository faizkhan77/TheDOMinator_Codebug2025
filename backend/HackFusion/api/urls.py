from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    UserProfileViewSet,
    TeamViewSet,
    RoomViewSet,
    MessageViewSet,
    getRoutes,
    login_view,
    signup_view,
    kick_member_from_team,
    InvitationViewSet,
    UserSkillViewSet,
    JoinRequestViewSet,
    recommend_teams,
    recommend_users,
    UserProjectViewSet,
)


# ✅ Create a Router
router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"profiles", UserProfileViewSet, basename="profile")
router.register(r"teams", TeamViewSet, basename="team")
router.register(r"rooms", RoomViewSet, basename="room")
router.register(r"messages", MessageViewSet, basename="message")
router.register(r"invitations", InvitationViewSet, basename="invitation")
router.register(r"join-requests", JoinRequestViewSet, basename="join-request")
router.register(r"skills", UserSkillViewSet, basename="skill")
router.register(r"projects", UserProjectViewSet, basename="project")


from rest_framework_simplejwt.views import TokenRefreshView

# ✅ Include router-generated URLs
urlpatterns = [
    path("api-auth/", include("rest_framework.urls")),  # Adds Login UI
    path("routes", getRoutes, name="routes"),
    path("", include(router.urls)),
    path("login/", login_view, name="login"),
    path("signup/", signup_view, name="signup"),
    path("teams/<int:team_id>/kick/", kick_member_from_team, name="kick-member"),
    path("recommend-teams/", recommend_teams, name="recommend-teams"),
    path("recommend-users/<int:team_id>/", recommend_users, name="recommend-users"),
    path(
        "token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),  #  (to refresh JWT tokens)
]
