from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Team, Room, UserSkill

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""

    teams = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(), many=True, required=False
    )  # Set required=False

    # Skills should be writable now
    # skills = UserSkillSerializer(many=True, required=False)

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
