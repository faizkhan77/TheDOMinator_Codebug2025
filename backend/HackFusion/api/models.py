from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(models.Model):
    """User profile to store additional details"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    teams = models.ManyToManyField(
        "Team", related_name="user_profiles", blank=True
    )  # New field
    full_name = models.CharField(max_length=150)
    avatar = models.ImageField(
        upload_to="avatars/", default="avatar.svg"
    )  # Profile picture
    role = models.CharField(
        max_length=100,
        help_text="E.g., Frontend Developer, Data Scientist, UI/UX Designer, etc.",
    )
    experience = models.TextField(
        blank=True, help_text="Brief work/education experience"
    )
    email = models.CharField(max_length=150, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=50, blank=True, null=True)
    # Social links
    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    portfolio = models.URLField(
        blank=True, help_text="Personal website or portfolio link"
    )

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name



class UserSkill(models.Model):
    """Model to store individual user skills with verification status"""

    user_profile = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="skills"
    )
    skill_name = models.CharField(max_length=100)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user_profile.full_name} - {self.skill_name} ({'Verified' if self.verified else 'Not Verified'})"



class Team(models.Model):
    TEAM_TYPES = [
        ("PUBLIC", "Public"),
        ("PRIVATE", "Private"),
    ]
    name = models.CharField(max_length=100, unique=True)
    admin = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="admin_teams"
    )
    description = models.TextField()  # Team description and goals
    project_idea = models.TextField(blank=True)  # Optional project idea
    looking_for = models.CharField(
        max_length=255,
        help_text="Roles needed (e.g., Frontend Developer, Designer, Backend, etc.)",
    )  # Roles needed for the team
    members = models.ManyToManyField(User, related_name="teams", blank=True)
    members_limit = models.PositiveIntegerField(default=5)  # Max members allowed
    team_type = models.CharField(max_length=7, choices=TEAM_TYPES, default="PUBLIC")
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Override save method to auto-create a chatroom for the team."""
        is_new = self.pk is None  # Check if the instance is being created
        super().save(*args, **kwargs)  # Save the team first

        if is_new:
            # Automatically create a Room when a new Team is created
            Room.objects.create(team=self, admin=self.admin)

    def add_member(self, user):
        """Method to add a member to the team if there's space."""
        if self.members.count() < self.members_limit:
            self.members.add(user)
            self.chatroom.members.add(user)  # Sync with chatroom
        else:
            raise ValueError("Team is full. Cannot add more members.")

    def __str__(self):
        return self.name



class Room(models.Model):
    # ROOM_TYPES = [
    #     ("PUBLIC", "Public"),
    #     ("PRIVATE", "Private"),
    # ]
    team = models.OneToOneField(
        Team, on_delete=models.CASCADE, related_name="chatroom"
    )  # Each team has one chatroom
    admin = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="admin_rooms"
    )
    # room_type = models.CharField(max_length=7, choices=ROOM_TYPES, default="PRIVATE")
    members = models.ManyToManyField(User, related_name="chatrooms", blank=True)
    created = models.DateTimeField(auto_now_add=True)

    # def add_message(self, user, content):
    #     """Function to send a message in the chatroom."""
    #     if user in self.members.all():
    #         Message.objects.create(room=self, sender=user, content=content)
    #     else:
    #         raise ValueError("User must be a member of the chatroom to send messages.")
    
class Message(models.Model):
    """Chat messages"""

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)