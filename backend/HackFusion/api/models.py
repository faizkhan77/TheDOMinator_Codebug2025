from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(models.Model):
    """User profile to store additional details"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    # teams = models.ManyToManyField(
    #     "Team", related_name="user_profiles", blank=True
    # )  # New field
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

