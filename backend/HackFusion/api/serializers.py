from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile,
    Team,
    Room,
    Message,
    Invitation,
    UserSkill,
    JoinRequest,
    UserProject,
    UploadedPDF,
)


class UserSkillSerializer(serializers.ModelSerializer):
    """Serializer for UserSkill model"""

    class Meta:
        model = UserSkill
        fields = ["id", "user_profile", "skill_name", "verified"]

    def create(self, validated_data):
        """Create a new skill"""
        skill_name = validated_data.get("skill_name")
        user_profile = validated_data.get("user_profile")

        # Check if the skill already exists
        skill, created = UserSkill.objects.get_or_create(
            user_profile=user_profile, skill_name=skill_name
        )
        return skill

    def update(self, instance, validated_data):
        """Update an existing skill"""
        instance.skill_name = validated_data.get("skill_name", instance.skill_name)
        instance.verified = validated_data.get("verified", instance.verified)
        instance.save()
        return instance


class UserProjectSerializer(serializers.ModelSerializer):
    """Serializer for UserProject model"""

    # profile = UserProfileSerializer()  # Nesting UserProfile data

    class Meta:
        model = UserProject
        fields = [
            "id",
            "user_profile",
            "title",
            "summary",
            "cover_image",
            "github_link",
            "live_demo",
            "created",
            "updated",
            # "profile"
        ]
        read_only_fields = [
            "id",
            "created",
            "updated",
        ]  # Prevent modification of these fields


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""

    teams = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(), many=True, required=False
    )  # Set required=False

    # Skills should be writable now
    skills = UserSkillSerializer(many=True, required=False)

    projects = UserProjectSerializer(many=True, required=False)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",
            "teams",
            "full_name",
            "avatar",
            "role",
            "skills",
            "experience",
            "github",
            "linkedin",
            "instagram",
            "portfolio",
            "created",
            "updated",
            "email",
            "bio",
            "location",
            "projects",
        ]
        read_only_fields = ["created", "updated"]

    def update(self, instance, validated_data):
        """Update the user profile and skills"""
        skills_data = validated_data.pop("skills", None)
        instance = super().update(instance, validated_data)

        if skills_data:
            # Use bulk_create to avoid multiple database hits
            skills = []
            for skill_data in skills_data:
                skill_name = skill_data.get("skill_name")
                verified = skill_data.get("verified", False)
                skills.append(
                    UserSkill(
                        user_profile=instance, skill_name=skill_name, verified=verified
                    )
                )
            UserSkill.objects.bulk_create(skills)

        return instance


class UserSerializer(serializers.ModelSerializer):
    """Serializer for Django User model, including the profile"""

    profile = UserProfileSerializer()  # Nesting UserProfile data

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile"]


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model"""

    admin = UserSerializer(read_only=True)  # Display admin details
    members = UserSerializer(many=True, read_only=True)  # Display member details
    chatroom_id = serializers.IntegerField(
        source="chatroom.id", read_only=True
    )  # Chatroom ID

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "admin",
            "description",
            "project_idea",
            "looking_for",
            "members",
            "members_limit",
            "chatroom_id",
            "created",
            "updated",
            "team_type",
        ]
        read_only_fields = ["created", "updated"]


class InvitationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = Invitation
        fields = ["id", "sender", "recipient", "team", "status", "created_at"]


class JoinRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = JoinRequest
        fields = "__all__"


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for Room model"""

    team = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all()
    )  # Store only team ID
    admin = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ["id", "team", "admin", "room_type", "members", "created"]
        read_only_fields = ["created"]


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Chat Messages"""

    sender = UserSerializer(read_only=True)  # Show sender details
    room = serializers.PrimaryKeyRelatedField(
        queryset=Room.objects.all()
    )  # Store only room ID

    class Meta:
        model = Message
        fields = ["id", "room", "sender", "content", "timestamp"]
        read_only_fields = ["timestamp"]


class PDFSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedPDF
        fields = "__all__"
