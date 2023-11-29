from django.shortcuts import render
from django.contrib.auth.models import User
from base.serializers import UserSerializer, UserSerializerWithToken
import datetime
from base.poker import Poker
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from base.models import Game, Player, Table
from base.serializers import GameSerializer, PlayerSerializer, TableSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getGame(request, pk):
    game = Game.objects.filter(table=pk).last()
    serializer2 = GameSerializer(
        game,
        many=False,
        context={"own": request.user.id, "is_staff": request.user.is_staff},
    )
    return Response(serializer2.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def gameEnter(request, pk):
    game = Game.objects.filter(table=pk).last()
    serializer = GameSerializer(
        game,
        many=False,
        context={"own": request.user.id, "is_staff": request.user.is_staff},
    )
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def newGame(request, pk):
    Poker(pk)
    async_to_sync(get_channel_layer().group_send)(str(pk), {"type": "disp"})
    game = Game.objects.filter(table=pk).last()
    serializer = GameSerializer(
        game,
        many=False,
        context={"own": request.user.id, "is_staff": request.user.is_staff},
    )
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def action(request, pk):
    game = Game.objects.filter(table=pk).last()
    action = request.data["act"]
    table = Table.objects.get(_id=pk)
    user = request.user
    new_bet = int(request.data["bet"])

    if action == "NewGame":
        try:
            if game.isFinished or request.user.is_staff:
                if len(table.JSON_table["online"]) < 2:
                    bot = Player.objects.get(user=4)
                    game.player.add(bot)
                    bot.balance = 100
                    bot.save()
                    if 4 not in table.JSON_table["online"]:
                        table.JSON_table["online"].append(4)
                        table.save()

                Poker(pk)
        except:
            if len(table.JSON_table["online"]) > 1:
                Poker(pk)

    else:
        if game is not None:
            Poker.userAction(
                game.gameObject, action, user.id, new_bet, request.user.is_staff
            )
    serializer = GameSerializer(
        game,
        many=False,
        context={"own": request.user.id, "is_staff": request.user.is_staff},
    )
    return Response(serializer.data)
