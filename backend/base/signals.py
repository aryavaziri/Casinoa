from django.db.models.signals import pre_save, post_save, class_prepared
from django.contrib.auth.models import User
from .models import Table, Game, Player
from .serializers import GameSerializer
maxs = [
        3,
        6,
        9,
    ]


def balancer(sender, instance, **kwargs):
    player = instance
    print(player.balance)


def createGame(sender, instance, **kwargs):
    table = instance
    try:
        if len(Game.objects.filter(table=table)):
            pass
    except:
        print("ROUND FROM SIGNAL EXCEPT------------------------------->>>>>>>>>>>>>>>>>>")
        game = Game.objects.create(table=table)
        game.save()


def onlineCheck(sender, instance, **kwargs):
    game = instance
    try:
        table = game.table
        table.online = game.player.count()
        # table.save()
    except:
        table.online = 0
        # pass


post_save.connect(onlineCheck, sender=Game)
post_save.connect(createGame, sender=Table)
