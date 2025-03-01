from django.contrib import admin

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


# Register your models here.
admin.site.register(UserProfile)
admin.site.register(Team)
admin.site.register(Room)
admin.site.register(Message)
admin.site.register(Invitation)
admin.site.register(JoinRequest)
admin.site.register(UserSkill)
admin.site.register(UserProject)
admin.site.register(UploadedPDF)
