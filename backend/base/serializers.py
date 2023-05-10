from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Table, Game, Player
from django.db import models
from django.apps import AppConfig
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "id"]


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        exclude = ["card1", "card2"]


class PlayerSerializer2(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = "__all__"


class UserSerializerWithToken(UserSerializer):
    nick_name = serializers.SerializerMethodField(read_only=True)
    access = serializers.SerializerMethodField(read_only=True)
    refresh = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ["email", "id", "nick_name", "access", "refresh"]

    def get_nick_name(self, obj):
        serializer = PlayerSerializer(Player.objects.get(user_id=obj.id), many=False)
        return serializer.data["nick_name"]

    def get_access(self, obj):
        access_token = AccessToken.for_user(obj)
        return str(access_token)

    def get_refresh(self, obj):
        refresh_token = RefreshToken.for_user(obj)
        return str(refresh_token)


class GameSerializer(serializers.ModelSerializer):
    player = serializers.SerializerMethodField(read_only=True)
    online = serializers.SerializerMethodField(read_only=True)
    own = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Game
        # fields = '__all__'
        exclude = [
            "gameObject",
        ]

    def get_player(self, obj):
        if self.context["is_staff"]:
            serializer = PlayerSerializer2(obj.player.all(), many=True)
        else:
            serializer = PlayerSerializer(obj.player.all(), many=True)
        return serializer.data

    def get_online(self, obj):
        try:
            return obj.player.count()
        except:
            return 0

    def get_own(self, obj):
        try:
            serializer = PlayerSerializer2(
                Player.objects.get(user_id=self.context["own"]), many=False
            )
            return serializer.data
        except:
            pass


class TableSerializer(serializers.ModelSerializer):
    isAvailable = serializers.SerializerMethodField(read_only=True)
    isPlaying = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Table
        fields = "__all__"

    def get_isAvailable(self, obj):
        maxs = [
            3,
            6,
            9,
        ]
        # print(obj)
        # mx = maxs[obj.max]
        try:
            serializer = GameSerializer(
                Game.objects.filter(table=obj).last(), many=False
            )
            if serializer.data["online"] < 10:
                return True
            else:
                return False
        except:
            return True

    def get_isPlaying(self, obj):
        try:
            serializer = GameSerializer(
                Game.objects.filter(table=obj).last(), many=False
            )
            if serializer.data["isPlayed"]:
                return True
            else:
                return False
        except:
            return False


class removeOnline(AppConfig):
    def ready(self):
        # importing model classes
        from .models import Table  # or...

        print(Table.objects.all())
