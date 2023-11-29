import json
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from base.serializers import (
    UserSerializer,
    UserSerializerWithToken,
    TableSerializer,
    GameSerializer,
)
from django.contrib.auth import get_user_model
from datetime import datetime
import asyncio
from django.contrib.auth.models import AnonymousUser
from base.models import Game, Player, Table
from base.poker import Poker


class PokerConsumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def get_user(self):
        return UserSerializerWithToken(self.scope["user"]).data

    @database_sync_to_async
    def add_online(self):
        table = Table.objects.get(_id=self.table)
        game = Game.objects.filter(table=table).last()
        player = Player.objects.get(user=self.user["id"])
        if self.user["id"] not in table.JSON_table["online"]:
            table.JSON_table["online"].append(self.user["id"])
            table.save()
            player.balance += int(self.deposite)
            player.credit_total -= int(self.deposite)
            player.save()
        print(table.JSON_table)

    async def connect(self):
        self.user = await self.get_user()
        self.table = self.scope["url_route"]["kwargs"]["pk"]
        self.deposite = self.scope["deposite"]
        self.ai = self.scope["ai"]
        print(self.ai)
        if self.user is AnonymousUser():
            self.close()
        else:
            self.groupname = self.table
            await asyncio.sleep(1)
            await self.add_online()
            await self.accept()
            await self.channel_layer.group_add(self.groupname, self.channel_name)
            await self.channel_layer.group_send(
                self.groupname,
                {
                    "type": "hi_message",
                    "time": datetime.now().strftime("%H:%M"),
                    "user": self.user["nick_name"],
                },
            )
            await self.sendDispatch()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        try:
            message = text_data_json["message"]
        except:
            message = ""
        try:
            disp = text_data_json["disp"]
        except:
            disp = False

        if message:
            await self.channel_layer.group_send(
                self.groupname,
                {
                    "type": "chat_message",
                    "message": message,
                    "time": datetime.now().strftime("%H:%M"),
                    "sender": self.user["nick_name"],
                },
            )
        if disp:
            await self.channel_layer.group_send(
                self.groupname,
                {
                    "type": "disp",
                },
            )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "chat",
                    "sender": event["sender"],
                    "time": event["time"],
                    "message": event["message"],
                }
            )
        )

    async def sendDispatch(self):
        await self.channel_layer.group_send(
            self.groupname,
            {
                "type": "disp",
            },
        )

    async def disp(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "disp",
                    "message": "Dispatch from socket",
                }
            )
        )

    async def system(self):
        await self.channel_layer.group_send(
            self.groupname,
            {
                "type": "finish",
            },
        )

    async def finish(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "finish",
                    "message": event["systemlog"],
                }
            )
        )

    async def hi_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "connected",
                    "user": event["user"],
                    "time": event["time"],
                    "message": " connected now!",
                }
            )
        )

    async def disconnect(self, close_code):
        print("User disconnected")
        await self.channel_layer.group_send(
            self.groupname,
            {
                "type": "bye_message",
                "time": datetime.now().strftime("%H:%M"),
                "user": self.user["nick_name"],
            },
        )
        await self.channel_layer.group_discard(self.groupname, self.channel_name)

        await self.channel_layer.group_send(
            self.groupname,
            {
                "type": "disp",
            },
        )

        await self.gameLeave()

    async def bye_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "disconnected",
                    "user": event["user"],
                    "time": event["time"],
                    "message": " disconnected!",
                }
            )
        )

    @database_sync_to_async
    def gameLeave(self):
        table = Table.objects.get(_id=self.table)
        game = Game.objects.filter(table=table).last()
        try:
            table.JSON_table["online"].remove(self.user["id"])
            if 4 in table.JSON_table["online"] and len(table.JSON_table)==1:
                table.JSON_table["online"].remove(4)
            table.save()
            if 4 in table.JSON_table["online"] and len(table.JSON_table)==1:
                table.JSON_table["online"].remove(4)
                table.save()
            if table.JSON_table["online"] < 2:
                game.isFinished = True
                game.save()
        except:
            print("BEGAYI INJAST")
            # pass
        print(table.JSON_table)
