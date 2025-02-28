from django.shortcuts import render
from rest_framework.decorators import api_view,  permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import UserProfile, Team, Room, Message, Invitation, UserSkill, JoinRequest
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    TeamSerializer,
    RoomSerializer,
    MessageSerializer,
    InvitationSerializer,
    UserSkillSerializer,
    JoinRequestSerializer,
)

# Create your views here.

@api_view(["GET"])
def getRoutes(request):
    """Returns a list of available API endpoints."""
    routes = [
        # Users
        {"GET": "/api/users/"},
        {"GET": "/api/users/{id}/"},
        # Profiles
        {"GET": "/api/profiles/"},
        {"GET": "/api/profiles/{id}/"},
        {"PUT": "/api/profiles/{id}/"},
        {"DELETE": "/api/profiles/{id}/"},
        # Teams
        {"GET": "/api/teams/"},
        {"POST": "/api/teams/"},
        {"GET": "/api/teams/{id}/"},
        {"PUT": "/api/teams/{id}/"},
        {"DELETE": "/api/teams/{id}/"},
        # Chat Rooms
        {"GET": "/api/rooms/"},
        {"POST": "/api/rooms/"},
        {"GET": "/api/rooms/{id}/"},
        {"PUT": "/api/rooms/{id}/"},
        {"DELETE": "/api/rooms/{id}/"},
        # Messages
        {"GET": "/api/messages/"},
        {"POST": "/api/messages/"},
        {"GET": "/api/messages/{id}/"},
        {"PUT": "/api/messages/{id}/"},
        {"DELETE": "/api/messages/{id}/"},
    ]
    return Response(routes)


@api_view(["POST"])
@permission_classes([AllowAny])  # Allows access without authentication
def signup_view(request):
    username = request.data.get("username")
    # email = request.data.get("email")
    password = request.data.get("password")
    confirm_password = request.data.get("confirm_password")

    if password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    user.save()

    # Automatically log in the user after signup
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])  # Allows access without authentication
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            }
        )
    return Response({"error": "Invalid Credentials"}, status=400)


# ✅ User ViewSet (Handles User & Profile)
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Handles listing and retrieving users (Read-Only)"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    # permission_classes = [permissions.IsAuthenticated]


# ✅ User Profile ViewSet (Handles Profile CRUD)
class UserProfileViewSet(viewsets.ModelViewSet):
    """Handles CRUD for user profiles"""

    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        print("\n🔹 retrieve() method called!")  # Debugging output
        print("Authorization Header:", request.headers.get("Authorization"))
        print("Authenticated User:", request.user)

        response = super().retrieve(request, *args, **kwargs)
        print("Response Data:", response.data)  # Log the response data here
        return response

    @action(detail=True, methods=["POST"])
    def add_skills(self, request, pk=None):
        """Add skills to an existing user profile"""
        profile = self.get_object()  # Get the user profile
        skills = request.data.get("skills", [])

        if not isinstance(skills, list):
            return Response(
                {"error": "Skills must be provided as a list of strings."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        skills = [str(skill).strip() for skill in skills if skill.strip()]

        if not skills:
            return Response(
                {"error": "No valid skills provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Add skills without checking for duplicates
        for skill_name in skills:
            # Only add the skill if it doesn't already exist
            skill, created = UserSkill.objects.get_or_create(
                user_profile=profile, skill_name=skill_name
            )
            if not created:  # Skill already exists
                return Response(
                    {"error": f"Skill '{skill_name}' already exists."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(
            {"message": "Skills added successfully!", "skills": skills},
            status=status.HTTP_201_CREATED,
        )


class UserSkillViewSet(viewsets.ViewSet):
    """Handles skill verification"""

    # permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """List all skills for the user profile"""
        skills = UserSkill.objects.all()
        serializer = UserSkillSerializer(skills, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["PUT"])
    def verify(self, request, pk=None):
        """Mark a skill as verified"""
        try:
            skill = UserSkill.objects.get(pk=pk, user_profile=request.user.profile)
            skill.verified = True
            skill.save()
            return Response(
                {"message": "Skill verified successfully!"}, status=status.HTTP_200_OK
            )
        except UserSkill.DoesNotExist:
            return Response(
                {"error": "Skill not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["DELETE"])
    def delete_skill(self, request, pk=None):
        """Delete a skill from the user profile"""
        try:
            skill = UserSkill.objects.get(pk=pk, user_profile=request.user.profile)
            skill.delete()
            return Response(
                {"message": "Skill deleted successfully!"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except UserSkill.DoesNotExist:
            return Response(
                {"error": "Skill not found"}, status=status.HTTP_404_NOT_FOUND
            )


# ✅ Team ViewSet
class TeamViewSet(viewsets.ModelViewSet):
    """Handles CRUD for teams"""

    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """Ensure the logged-in user becomes the admin and is added to the team."""
        user = self.request.user  # Get logged-in user
        team = serializer.save(admin=user)  # Assign admin

        # Automatically add the admin as a member
        team.members.add(user)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        """Allow a user to join a team if there's space."""
        team = self.get_object()
        user = request.user

        # Check if user is already a member
        if user in team.members.all():
            return Response(
                {"detail": "You are already a member."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if team is full
        if team.members.count() >= team.members_limit:
            return Response(
                {"detail": "Team is full."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Add user to the team
        team.members.add(user)
        return Response({"detail": "Joined successfully!"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        """Allow a user to leave the team."""
        team = self.get_object()
        user = request.user

        # Check if user is in the team
        if user not in team.members.all():
            return Response(
                {"detail": "You are not a member of this team."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent the admin from leaving (unless another admin is assigned)
        if user == team.admin:
            return Response(
                {"detail": "Admin cannot leave the team."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Remove user from the team
        team.members.remove(user)
        return Response(
            {"detail": "You have left the team."}, status=status.HTTP_200_OK
        )

class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        """Send an invitation to a user for a specific team."""
        sender = request.user
        recipient_id = request.data.get("recipient_id")
        team_id = request.data.get("team_id")

        # Ensure sender is in the team
        team = Team.objects.filter(id=team_id, members=sender).first()
        if not team:
            return Response(
                {"detail": "You are not a member of this team."},
                status=status.HTTP_403_FORBIDDEN,
            )

        recipient = User.objects.filter(id=recipient_id).first()
        if not recipient:
            return Response(
                {"detail": "Recipient not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if the invitation already exists
        if Invitation.objects.filter(
            sender=sender, recipient=recipient, team=team, status="pending"
        ).exists():
            return Response(
                {"detail": "An invitation is already pending."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create invitation
        invitation = Invitation.objects.create(
            sender=sender, recipient=recipient, team=team
        )
        return Response(
            InvitationSerializer(invitation).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"])
    def respond(self, request, pk=None):
        """Accept or reject an invitation."""
        invitation = self.get_object()

        if invitation.recipient != request.user:
            return Response(
                {"detail": "You are not allowed to respond to this invitation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        action = request.data.get("action")

        if action == "accept":
            invitation.team.members.add(invitation.recipient)  # Add user to team
            message = "You have joined the team!"
        elif action == "reject":
            message = "Invitation rejected."
        else:
            return Response(
                {"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST
            )

        # **Delete the invitation after responding**
        invitation.delete()

        return Response({"detail": message}, status=status.HTTP_200_OK)


class JoinRequestViewSet(viewsets.ModelViewSet):
    queryset = JoinRequest.objects.all()
    serializer_class = JoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        """Allow a user to request to join a private team."""
        user = request.user
        team_id = request.data.get("team_id")

        # Check if team exists
        team = get_object_or_404(Team, id=team_id)

        # Prevent sending request if already a member
        if team.members.filter(id=user.id).exists():
            return Response(
                {"detail": "You are already a member of this team."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only allow requests for private teams
        if team.team_type != "PRIVATE":
            return Response(
                {"detail": "Join requests are only allowed for private teams."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Prevent duplicate requests
        if JoinRequest.objects.filter(user=user, team=team, status="pending").exists():
            return Response(
                {"detail": "Join request already pending."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create join request
        join_request = JoinRequest.objects.create(user=user, team=team)
        return Response(
            JoinRequestSerializer(join_request).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"])
    def respond(self, request, pk=None):
        """Allow the team admin to accept or reject a join request."""
        join_request = get_object_or_404(JoinRequest, id=pk)

        # Only the team admin can accept/reject requests
        if join_request.team.admin != request.user:
            return Response(
                {"detail": "Only the team admin can respond to requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        action = request.data.get("action")

        if action == "accept":
            if join_request.team.members.count() < join_request.team.members_limit:
                join_request.team.members.add(join_request.user)

                # Update UserProfile to add this team
                user_profile, created = UserProfile.objects.get_or_create(
                    user=join_request.user
                )
                user_profile.teams.add(join_request.team)
                user_profile.save()

                message = "User has been added to the team."
            else:
                return Response(
                    {"detail": "Team is full."}, status=status.HTTP_400_BAD_REQUEST
                )

        elif action == "reject":
            message = "Join request rejected."
        else:
            return Response(
                {"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Delete request after responding
        join_request.delete()
        return Response({"detail": message}, status=status.HTTP_200_OK)





# ✅ Room (Chatroom) ViewSet
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        """Fetch messages for a specific chatroom"""
        room = self.get_object()
        messages = (
            room.messages.all()
        )  # Assuming a related_name='messages' in Message model
        return Response(
            MessageSerializer(messages, many=True).data, status=status.HTTP_200_OK
        )

class MessageViewSet(viewsets.ModelViewSet):
    """Handles CRUD for chat messages"""

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter messages based on room ID"""
        room_id = self.request.query_params.get("room")  # Get 'room' from query params
        if room_id:
            return Message.objects.filter(room_id=room_id).order_by("timestamp")
        return Message.objects.none()  # Return empty if no room ID provided

    def perform_create(self, serializer):
        """Set sender automatically from authenticated user"""
        serializer.save(sender=self.request.user)
