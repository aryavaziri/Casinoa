from django.contrib import admin
from .models import Table, Game, Player, User
# Register your models here.

class PlayerAdmin(admin.ModelAdmin):
    fields=[
        'user',
        'turn',
    ]
class UserAdmin(admin.ModelAdmin):
    fields=[
        'email',
        'last_login',
    ]

admin.site.register(User, UserAdmin)
admin.site.register(Table)
admin.site.register(Game)
# admin.site.register(Player, PlayerAdmin)
admin.site.register(Player)
