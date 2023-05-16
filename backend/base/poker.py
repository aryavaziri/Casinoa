# from models import *
# from serializers import *
import datetime
import copy
from base.models import Table, Game, Player
from base.serializers import GameSerializer, TableSerializer, PlayerSerializer
import random
import time
import math
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json
from django.contrib.auth import get_user_model

User = get_user_model()


class Poker:
    def __init__(self, pk):
        self.pk = int(pk)
        self.table = Table.objects.get(_id=pk)
        self.newGame(pk)

    def newGame(self, pk):
        table = Table.objects.get(_id=self.pk)
        oldGame = Game.objects.filter(table=pk).last()
        small = 0
        # table.JSON_table["online"] = [1, 4, 2, 3]  # For testing
        # table.save()
        online = table.JSON_table["online"]
        new_order = []

        if oldGame is not None:
            pre_small = (
                oldGame.small_blind
            )  # get ID of previous small blind on the table
            if pre_small == 0:
                pre_small = online[0]
            for player in oldGame.player.all().order_by("joined_at"):
                if player not in online:
                    player.credit_total += player.balance
                    player.balance = 0
                if (player.user.id in online) and (player.balance > (table.small * 2)):
                    new_order.append(player.user.id)

            for user in online:
                if not new_order.count(user):
                    new_order.append(user)
            try:
                i = 0
                print("online: ", online)
                print("pre_small: ", pre_small)
                print("new_order: ", new_order)
                while i < len(online):
                    small = online[(online.index(pre_small) + 1 + i) % len(online)]
                    if new_order.count(small):
                        break
                    i += 1
                print("small: ", small)
            except:
                small = online[0]
                print("EXCEPT")
        else:  ##Initialize
            small = online[0]
            for id in online:
                player = Player.objects.get(user=id)
                print(player)
                print(player.balance)
                if player.balance > (table.small * 2):
                    new_order.append(id)

        print("<<<<<<new_order>>>>>>>>>")
        print(new_order)

        self.game = Game.objects.create(table=self.table)
        game = self.game

        self.shuffle(len(new_order))

        game.small_blind = small
        game.bet = self.table.small * 2
        game.pot = self.table.small * 3
        game.turn = new_order[(new_order.index(small) + 2) % len(new_order)]
        game.JSON_data["ground"] = self.ground
        game.JSON_data["actions"] = [0] * len(new_order)
        game.JSON_data["playerCards"] = self.playerCards
        game.JSON_data["orders"] = new_order
        game.JSON_data["card_winner"] = [None] * len(new_order)
        game.JSON_data["allin_pots"] = [0] * len(new_order)
        game.JSON_data["bets"] = [0] * len(new_order)
        game.JSON_data["bets"][new_order.index(small)] = self.table.small
        game.JSON_data["bets"][(new_order.index(small) + 1) % len(new_order)] = (
            self.table.small * 2
        )
        game.JSON_data["game_winner"] = []
        game.JSON_data["stage_pots"] = [0]

        for p in range(len(new_order)):
            card_winner = self.ground.copy()
            card_winner.extend(
                self.playerCards[(p + new_order.index(small)) % len(new_order)]
            )
            eval = self.evaluate(card_winner)
            game.JSON_data["card_winner"][
                (p + new_order.index(small)) % len(new_order)
            ] = eval
            player = Player.objects.get(
                user=new_order[(p + new_order.index(small)) % len(new_order)]
            )
            game.player.add(player)
            [player.title] = eval[0]
            player.small = False
            player.big = False
            player.turn = False
            player.dealer = False
            player.winner = False
            player.bet = 0
            player.status = 0
            if p == 0:
                player.small = True
                player.bet = self.table.small
            elif p == 1:
                player.big = True
                player.bet = self.table.small * 2
            if p == len(new_order) - 1:
                player.dealer = True
            if p == 2 % len(new_order):
                player.turn = True
            player.balance -= player.bet
            player.JSON["winner_hand"] = self.evaluate(card_winner)[1]
            player.card1 = game.JSON_data["playerCards"][
                (p + new_order.index(small)) % len(new_order)
            ][0]
            player.card2 = game.JSON_data["playerCards"][
                (p + new_order.index(small)) % len(new_order)
            ][1]
            player.save()

        game.isPlayed = True
        game.gameObject = self
        # self.onFinish()
        game.save()
        print(game.JSON_data["card_winner"])
        async_to_sync(get_channel_layer().group_send)(
            str(self.table._id), {"type": "disp"}
        )

    def shuffle(self, count):
        self.cards = list(range(1, 53))
        random.shuffle(self.cards)
        print(self.cards)
        self.playerCards = []
        for p in range(int(count)):
            self.playerCards.append([self.cards[p], self.cards[p + int(count)]])
        self.ground = [
            self.cards[(int(count) * 2) + 1],
            self.cards[(int(count) * 2) + 2],
            self.cards[(int(count) * 2) + 3],
            self.cards[(int(count) * 2) + 5],
            self.cards[(int(count) * 2) + 7],
        ]

    def userAction(self, action, userID, new_bet=0, is_staff=False):
        order = self.game.JSON_data["orders"]
        pot = self.game.JSON_data["stage_pots"][-1]
        bet = self.game.bet
        if action == "leave":
            player = Player.objects.get(user=userID)
            player.credit_total += player.balance
            player.balance = 0
            # player.status = 1
            player.save()
            return
        if is_staff:
            if action == "end":
                self.onFinish()
                return

        if not (self.game.turn == userID):
            if not is_staff:
                return
            player = Player.objects.get(user=self.game.turn)
        else:
            player = Player.objects.get(user=self.game.turn)

        if (
            (action == "check" and bet > player.bet)
            or (action == "call" and player.balance + player.bet <= bet)
            or (action == "call" and player.bet == bet)
            or (action == "call" and bet == 0)
            or (
                action == "raise"
                and (
                    (new_bet <= bet)
                    or ((bet == 0) and (new_bet < self.table.small * 2))
                    or (
                        len(self.game.JSON_data["actions"])
                        - (
                            self.game.JSON_data["actions"].count(5)
                            + self.game.JSON_data["actions"].count(1)
                        )
                        <= 1
                    )
                )
            )
        ):
            print("adam bash")
            return
        else:
            if action == "fold":
                player.status = 1

            if action == "check":
                player.status = 2

            if action == "call":
                player.status = 3
                player.balance -= bet - player.bet
                self.game.pot += bet - player.bet
                player.bet = bet

            if action == "raise":
                player.status = 4
                player.balance -= new_bet - player.bet

                self.game.pot += new_bet - player.bet
                player.bet = new_bet
                self.game.bet = new_bet

            if action == "allin":
                player.status = 5
                player.bet += player.balance
                self.game.pot += player.balance
                if player.bet > bet:
                    self.game.bet = player.bet
                player.balance = 0

            if action == "raise" or action == "allin":
                for i in range(len(self.game.JSON_data["actions"])):
                    p = Player.objects.get(user=order[i])
                    if (
                        self.game.JSON_data["actions"][i] != 1
                        and self.game.JSON_data["actions"][i] != 5
                        and p.bet < self.game.bet
                    ):
                        p.status = 0
                        p.save()
                        self.game.JSON_data["actions"][i] = 0

            self.game.JSON_data["actions"][
                (order.index(self.game.turn))
            ] = player.status
            self.game.JSON_data["bets"][(order.index(self.game.turn))] = player.bet
            self.game.save()
            player.turn = False
            player.save()
            self.after()

    def after(self):
        order = self.game.JSON_data["orders"]
        if self.game.JSON_data["actions"].count(0):
            self.game.turn = order[(order.index(self.game.turn) + 1) % len(order)]
            self.game.save()
            # If person is not online, then fold him
            if (
                Player.objects.get(user=self.game.turn).user.id
                not in Table.objects.get(_id=self.pk).JSON_table["online"]
            ):
                Poker.userAction(self, "fold", self.game.turn)

            # If player is fold or allin, go to next person
            while (
                Player.objects.get(user=self.game.turn).status == 1
                or Player.objects.get(user=self.game.turn).status == 5
            ):
                self.game.turn = order[(order.index(self.game.turn) + 1) % len(order)]
            nextPlayer = Player.objects.get(user=self.game.turn)
            nextPlayer.turn = True
            nextPlayer.save()
            print("next player")
        else:
            print("next round")
            if self.game.JSON_data["actions"].count(5):
                for k in range(len(self.game.JSON_data["orders"])):
                    temp_player = Player.objects.get(
                        user=self.game.JSON_data["orders"][k]
                    )
                    if temp_player.status != 1:
                        if temp_player.bet:
                            self.game.JSON_data["allin_pots"][k] = self.game.JSON_data[
                                "stage_pots"
                            ][-1]
                            for player_2 in self.game.player.all():
                                if self.game.bet == temp_player.bet:
                                    self.game.JSON_data["allin_pots"][k] += player_2.bet
                                else:
                                    self.game.JSON_data["allin_pots"][k] += min(
                                        temp_player.bet, player_2.bet
                                    )

                    else:
                        self.game.JSON_data["allin_pots"][k] = 0

            for i in range(
                len(self.game.JSON_data["actions"])
            ):  ##Reseting bets list to prepare it for the next round
                temp = Player.objects.get(user=order[i])
                temp.bet = 0
                if (
                    self.game.JSON_data["actions"][i] != 1
                    and self.game.JSON_data["actions"][i] != 5
                ):
                    # print(order[i])
                    temp.status = 0
                    if order[i] == self.game.small_blind:
                        temp.turn = True
                temp.save()
            self.game.JSON_data["actions"] = [
                (i if (i == 1 or i == 5) else 0) for i in self.game.JSON_data["actions"]
            ]
            self.game.JSON_data["stage_pots"].append(self.game.pot)
            self.game.stage += 1
            self.game.turn = self.game.small_blind
            self.game.bet = 0
            self.game.JSON_data["bets"] = [0] * len(order)
            self.game.save()
            if (
                self.game.JSON_data["actions"].count(1)
                + self.game.JSON_data["actions"].count(5)
                + 1
            ) < len(self.game.JSON_data["actions"]):
                while (
                    Player.objects.get(user=self.game.turn).status == 1
                    or Player.objects.get(user=self.game.turn).status == 5
                ):
                    self.game.turn = order[
                        (order.index(self.game.turn) + 1) % len(order)
                    ]
                nextPlayer = Player.objects.get(user=self.game.turn)
                nextPlayer.turn = True
                nextPlayer.save()
            else:
                self.game.stage = 4

        if self.game.stage >= 1:
            self.game.JSON_ground["ground"][0] = self.game.JSON_data["ground"][0]
            self.game.JSON_ground["ground"][1] = self.game.JSON_data["ground"][1]
            self.game.JSON_ground["ground"][2] = self.game.JSON_data["ground"][2]
        if self.game.stage >= 2:
            self.game.JSON_ground["ground"][3] = self.game.JSON_data["ground"][3]
        if self.game.stage >= 3:
            self.game.JSON_ground["ground"][4] = self.game.JSON_data["ground"][4]
        if self.game.stage > 3:
            print("Round Finished")

        if (
            (self.game.stage > 3)
            or self.game.JSON_data["actions"].count(1) + 1 >= self.game.player.count()
            or self.game.JSON_data["actions"].count(1)
            + self.game.JSON_data["actions"].count(5)
            >= self.game.player.count()
        ):
            self.onFinish()

        self.game.save()
        async_to_sync(get_channel_layer().group_send)(
            str(self.table._id), {"type": "disp"}
        )

    def onFinish(self):
        game = self.game
        if game.JSON_data["allin_pots"].count(0) == game.player.count():
            game.JSON_data["allin_pots"] = [game.pot] * game.player.count()
        game.isFinished = True
        game.player.filter(turn=True).update(turn=False)
        game.turn = 0
        result = self.winner()
        print("result: ", result)
        game.JSON_data["winner"] = result
        for p in range(len(game.JSON_data["orders"])):
            player = Player.objects.get(user=game.JSON_data["orders"][p])
            if game.JSON_data["orders"][p] in [x[0] for x in result]:
                player.winner = True
                player.win_amount = result[[x[0] for x in result].index(game.JSON_data["orders"][p])][1]
                player.save()
        game.save()
        print("Next game is going to start")

        async_to_sync(get_channel_layer().group_send)(
            str(self.table._id), {"type": "disp"}
        )

    def winner(self):
        game = self.game
        temp1 = copy.deepcopy(game.JSON_data["card_winner"])
        for i in range(len(temp1)):
            temp1[i].append(game.JSON_data["orders"][i])
        for p in range(len(temp1)):
            if game.JSON_data["actions"][p] == 1:
                temp1[p][0] = [0]
        temp = sorted(
            temp1,
            key=lambda x: (x[0][0], x[1][0], x[1][1], x[1][2], x[1][3], x[1][4]),
            reverse=True,
        )
        # print("temp: ", temp)
        temp2 = copy.deepcopy(temp)
        for i in range(len(temp2)):
            quota = self.game.JSON_data["allin_pots"][
                game.JSON_data["orders"].index(temp2[i][2])
            ]
            temp2[i].append(quota)
        for i in reversed(range(len(temp2))):
            if temp2[i][0][0] == 0:
                temp2.pop(i)
        # print("temp2: ", temp2)
        result = []

        while(game.pot):
            t = 0
            temp3 = []
            count = [x[:2] for x in temp2].count(temp2[0][:2])
            award = max(temp2[:count], key= lambda x:x[3])[3]
            # print("award", award)
            game.pot -= award
            for x in temp2[count:]:
                if x[3]>award:
                    x[3] -= award
                else:
                    x[3] = 0
            game.save()
            while(t<count):
                temp3.append(temp2.pop(0))
                t += 1
            try:
                for i in range(len(temp2)):
                    if temp2[i][3] == 0:
                        temp2.pop(i)
            except:
                pass
            temp3 = sorted(temp3, key=lambda x: x[3])
            # print("temp2: ", temp2)
            print("temp3: ", temp3)
            win_amount = [0]*count
            for i in range(count):
                for j in range(count-i):
                    win_amount[j+i] += temp3[i][3]/(count-i)-(temp3[i-1][3] if i >0 else 0)
            print("win_amount: ", win_amount)
            for i in range(len(temp3)):
                if(win_amount[i]):
                    result.append([temp3[i][2],win_amount[i],[temp3[i][0], temp3[i][1]]])
                player = Player.objects.get(user=temp3[i][2])
                player.balance += win_amount[i]
                player.save()

        # winner = []
        # winners = []
        # if [temp.count(temp[0])] == 1:
        #     winner = list(
        #         map(
        #             lambda x: x[1],
        #             # if Player.objects.get(user=game.JSON_data["orders"][x[0]])
        #             # if Player.objects.get(user=x[2])
        #             # else 0,
        #             enumerate(temp),
        #         )
        #     )
        # else:
        #     winner = [temp[0]] * temp.count(temp[0])
        # # print("winner: ", winner)
        # if len(winner) == 1:
        #     winners = [
        #         game.JSON_data["orders"][game.JSON_data["card_winner"].index(winner[0])]
        #     ]
        # else:
        #     for k in range(len(game.JSON_data["orders"])):
        #         if game.JSON_data["card_winner"][k] == winner[0]:
        #             winners.append(game.JSON_data["orders"][k])
        print("result: ",result)
        for winner in result:
            systemlog = winner[0],winner[2][0][0],winner[1], winner[2][1]
            async_to_sync(get_channel_layer().group_send)(
                str(self.table._id), {"type": "finish", "systemlog": systemlog}
            )

        # print("--------------------------->>>>>userID ",winners," is winner with ",winner[0][1])
        return result

    def evaluate(self, cards):
        cards = list(cards)
        cards.sort(reverse=True)
        temp1 = []  # sort
        temp2 = []  # count
        temp3 = []  # suits
        temp4 = []  # unique1
        temp5 = []  # unique2
        winner = []  # winner hand cards
        for card in cards:
            x = int(math.fmod(card - 1, 13) + 1)
            if x == 1:
                x = 14
            temp1.append(x)
        temp1.sort(reverse=True)
        for card in temp1:
            temp2.append(temp1.count(card))
        for card in cards:
            temp3.append(int((card - 1) / 13) + 1)
        for card in temp1:
            if card not in temp4:
                temp4.append(card)
        for card in temp4:
            x = card
            if x == 14:
                x = 1
            temp5.append(x)
        temp5.sort(reverse=True)

        if (
            (set([1, 10, 11, 12, 13]).issubset(set(cards)))
            or (set([14, 23, 24, 25, 26]).issubset(set(cards)))
            or (set([27, 36, 37, 38, 39]).issubset(set(cards)))
            or (set([40, 49, 50, 51, 52]).issubset(set(cards)))
        ):
            return [[10], [10, 11, 12, 13, 14]]

        for suit in temp3:
            temp6 = []
            if temp3.count(suit) > 4:
                for i in range(len(temp3)):
                    if temp3[i] is suit:
                        temp6.append(cards[i])
                temp6.sort(reverse=True)
                # print("temp6", temp6)
                for i in range(len(temp6) - 4):
                    if temp6[0 + i] == temp6[4 + i] + 4:
                        for card in temp6[i : i + 5]:
                            winner.append(int(math.fmod(card - 1, 13) + 1))
                        return [[9], winner]
        if max(temp2) == 4:
            winner = [temp1[temp2.index(4)]] * 4
            return [[8], winner]
        if max(temp2) == 3 and (temp2.count(3) > 3 or temp2.count(2)):
            if temp2.count(3) == 3:
                winner = [temp1[temp2.index(3)]] * 3
                winner.append(temp1[temp2.index(2)])
                winner.append(temp1[temp2.index(2)])
            if temp2.count(3) > 3:
                for i in range(len(temp1)):
                    if temp2[i] == 3 and len(winner) < 5:
                        winner.append(temp1[i])

            return [[7], winner]

        for suit in temp3:
            if temp3.count(suit) > 4:
                for card in cards:
                    if int((card - 1) / 13) + 1 == suit:
                        x = int(math.fmod(card - 1, 13) + 1)
                        if x == 1:
                            x = 14
                        winner.append(x)
                    winner.sort(reverse=True)
                return [[6], winner[:5]]

        if len(temp4) > 4:
            for i in range(len(temp4) - 4):
                if temp4[0 + i] == temp4[4 + i] + 4:
                    winner = list(temp4[i : i + 5])
                    return [[5], winner]
                if temp5[0 + i] == temp5[4 + i] + 4:
                    winner = list(temp5[i : i + 5])
                    return [[5], winner]

        if max(temp2) == 3:
            winner = [temp1[temp2.index(3)]] * 3
            for card in temp1:
                if card not in winner and len(winner) < 5:
                    winner.append(card)
            return [[4], winner]

        if max(temp2) == 2 and temp2.count(2) > 2:
            for i in range(len(temp1)):
                if temp2[i] == 2:
                    if len(winner) < 4:
                        winner.append(temp1[i])
            for card in temp1:
                if card not in winner and len(winner) < 5:
                    winner.append(card)
            return [[3], winner]

        if max(temp2) == 2:
            winner = [temp1[temp2.index(2)]] * 2
            for card in temp1:
                if card not in winner and len(winner) < 5:
                    winner.append(card)
            return [[2], winner]
        return [[1], temp1[:5]]
