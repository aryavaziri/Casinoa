# from models import *
# from serializers import *
import datetime
from base.models import Table, Game, Player
from base.serializers import GameSerializer, TableSerializer, PlayerSerializer
import random
import time
import math
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json


class Poker:
    def __init__(self, pk):
        self.pk = int(pk)
        self.table = Table.objects.get(_id=pk)
        self.newGame(pk)

    def newGame(self, pk):
        table = Table.objects.get(_id=self.pk)
        oldGame = Game.objects.filter(table=pk).last()
        small = 0
        online = Table.objects.get(_id= self.pk).JSON_table['online']
        new_order = []

        if oldGame is not None:
            pre_small = oldGame.small_blind  # get ID of previous small blind on the table
            for player in oldGame.player.all().order_by('joined_at'):
                if player not in online:
                    player.credit_total += player.balance
                    player.balance = 0
                if (player.user.id in online) and (player.balance > (table.small*2)):
                    new_order.append(player.user.id)
            for user in online:
                if not new_order.count(user):
                    new_order.append(user)
            try:
                i = 0
                while i < len(online):
                    small = online[(online.index(pre_small) + 1 + i) % len(online)]
                    if (new_order.count(small)):
                        break
                    i += 1
            except:
                small = online[0]
        else:
            small = online[0]
            for id in online:
                player = Player.objects.get(user=id)
                print(player)
                print(player.balance)
                if (player.balance > (table.small*2)):
                    new_order.append(id)

        print("<<<<<<new_order>>>>>>>>>")
        print(new_order)

        self.game = Game.objects.create(table=self.table)
        game = self.game

        self.shuffle(len(new_order))

        game.small_blind = small
        game.bet = self.table.small*2
        game.pot = self.table.small*3
        game.turn = new_order[(new_order.index(small) + 2) % len(new_order)]
        game.JSON_data['ground'] = self.ground
        game.JSON_data['bets'] = [0] * len(new_order)
        game.JSON_data['playerCards'] = self.playerCards
        game.JSON_data['orders'] = new_order
        for p in range(len(new_order)):
            player = Player.objects.get(user=new_order[(p + new_order.index(small)) % len(new_order)])
            game.player.add(player)
            player.small = False
            player.big = False
            player.turn = False
            player.dealer = False
            player.bet = 0
            player.status = 0
            if (p == 0):
                player.small = True
                player.bet = self.table.small
            elif (p == 1):
                player.big = True
                player.bet = self.table.small * 2
            if (p == len(new_order)-1):
                player.dealer = True
            if (p == 2 % len(new_order)):
                player.turn = True
            player.balance -= player.bet
            player.card1 = game.JSON_data['playerCards'][(
                p + new_order.index(small)) % len(new_order)][0]
            player.card2 = game.JSON_data['playerCards'][(
                p + new_order.index(small)) % len(new_order)][1]
            player.save()
        game.isPlayed = True
        game.gameObject = self
        game.save()
        async_to_sync(get_channel_layer().group_send)(str(self.table._id), {'type': 'disp'})

    def shuffle(self, count):
        self.cards = list(range(1, 53))
        random.shuffle(self.cards)
        print(self.cards)
        self.playerCards = []
        for p in range(int(count)):
            self.playerCards.append(
                [self.cards[p], self.cards[p + int(count)]])
        self.ground = [
            self.cards[(int(count) * 2) + 1],
            self.cards[(int(count) * 2) + 2],
            self.cards[(int(count) * 2) + 3],
            self.cards[(int(count) * 2) + 5],
            self.cards[(int(count) * 2) + 7]]

    def winner(self):
        pass

    def userAction(self, action, userID, new_bet=0):
        order = self.game.JSON_data['orders']
        bet = self.game.bet
        if (action == "leave"):
            player = Player.objects.get(user=userID)
            player.credit_total += player.balance
            player.balance = 0
            # player.status = 1
            player.save()
            return

        if not (self.game.turn == userID):
            # player = Player.objects.get(user=self.game.turn)
            return
        else:
            player = Player.objects.get(user=self.game.turn)

        if ((action == "check" and bet > player.bet) or (action == "call" and bet == player.bet) or (action == "raise" and ((new_bet < bet*2) or ((bet == 0) and (new_bet < self.table.small * 2))))):
            print("adam bash")
            return
        else:
            if (action == "fold"):
                player.status = 1

            if (action == "check"):
                player.status = 2

            if (action == "call"):
                player.status = 3
                player.balance -= bet - player.bet
                self.game.pot += bet - player.bet
                player.bet = bet

            if (action == "raise"):
                self.game.JSON_data['bets'] = [(i if (i == 1 or i == 5) else 0) for i in self.game.JSON_data['bets']]
                for i in range(0, len(self.game.JSON_data['bets'])):
                    p = Player.objects.get(user=order[i])
                    if (self.game.JSON_data['bets'][i] != 1 and self.game.JSON_data['bets'][i] != 5):
                        p.status = 0
                        p.save()
                player.status = 4
                player.balance -= new_bet - player.bet
                self.game.pot += new_bet - player.bet
                player.bet = new_bet
                self.game.bet = new_bet

            if (action == "allin"):
                player.status = 5
                player.bet += player.balance
                self.game.pot += player.balance
                player.balance = 0

            self.game.JSON_data['bets'][(order.index(self.game.turn))] = player.status
            self.game.save()
            player.turn = False
            player.save()
            self.after()


    def after(self):
        order = self.game.JSON_data['orders']
        if self.game.JSON_data['bets'].count(0):
            self.game.turn = (order[(order.index(self.game.turn)+1) % len(order)])
            self.game.save()
            #If person is not online, then fold him
            print(Player.objects.get(user=self.game.turn).user.id)
            print(self.table.JSON_table['online'])
            print(Table.objects.get(_id= self.pk).JSON_table['online'])

            if (Player.objects.get(user=self.game.turn).user.id not in Table.objects.get(_id= self.pk).JSON_table['online']):

                print("------------------------------OK--------------------------------------------------------------------------")
                # Player.objects.filter(user=self.game.turn).update(status=1)
                # self.game.JSON_data['bets'][(order.index(self.game.turn))]=1
                Poker.userAction(self, "fold", self.game.turn)
            #If person is fold or allin, go to next person
            while (Player.objects.get(user=self.game.turn).status == 1 or Player.objects.get(user=self.game.turn) == 5):
                self.game.turn = (order[(order.index(self.game.turn)+1) % len(order)]) 
            nextPlayer = Player.objects.get(user=self.game.turn)
            nextPlayer.turn = True
            nextPlayer.save()
            print("next player")
        if not self.game.JSON_data['bets'].count(0):
            for i in range(len(self.game.JSON_data['bets'])):
                if (self.game.JSON_data['bets'][i] != 1 and self.game.JSON_data['bets'][i] != 5):
                    # print(order[i])
                    temp = Player.objects.get(user=order[i])
                    temp.status = 0
                    if (order[i] == self.game.small_blind):
                        temp.turn = True
                    temp.bet = 0
                    temp.save()
            print("next round")
            self.game.JSON_data['bets'] = [(i if (i == 1 or i == 5) else 0) for i in self.game.JSON_data['bets']]
            self.game.stage += 1
            self.game.turn = self.game.small_blind
            self.game.bet = 0

        if (self.game.stage == 1):
            self.game.JSON_ground['ground'][0] = self.game.JSON_data['ground'][0]
            self.game.JSON_ground['ground'][1] = self.game.JSON_data['ground'][1]
            self.game.JSON_ground['ground'][2] = self.game.JSON_data['ground'][2]
        if (self.game.stage == 2):
            self.game.JSON_ground['ground'][3] = self.game.JSON_data['ground'][3]
        if (self.game.stage == 3):
            self.game.JSON_ground['ground'][4] = self.game.JSON_data['ground'][4]
        if (self.game.stage == 4):
            print("NEXT GAME")
            self.game.isFinished = True


        print(self.game.JSON_data['bets'])

        self.game.save()
        self.post_action()


    def post_action(self):
        game = self.game
        temp_fold = 0
        for player in game.player.all():
            if (player.status == 1) or (player.status == 5):
                temp_fold += 1
            if (temp_fold >= game.player.count()-1):
                game.isFinished = True

        if (game.isFinished):
            game.player.filter(turn=True).update(turn=False)
            game.turn = 0
            print("Next game is going to start")
            game.JSON_ground['ground'] = game.JSON_data['ground']
            print((game.JSON_ground)['ground'])
            game.save()
            # self.newGame()
            # time.sleep(5)  #goes to the next game after 5 seconds
        async_to_sync(get_channel_layer().group_send)(str(self.table._id), {'type': 'disp'})




    def evaluate(cards):
        temp1=[] #sort
        temp2=[] #count
        temp3=[] #suits
        temp4=[] #unique1
        temp5=[] #unique2
        winner=[] #winner hand cards
        for card in cards:
            x = int(math.fmod(card-1,13)+1)
            if x==1:
                x=14
            temp1.append(x)
        temp1.sort(reverse=True)
        for card in temp1:
            temp2.append(temp1.count(card))
        for card in cards:
            temp3.append(int((card-1)/13)+1)
        # temp3.sort()
        for card in temp1:
            if card not in temp4:
                temp4.append(card)
        for card in temp4:
            x = card
            if x==14:
                x=1
            temp5.append(x)
        temp5.sort(reverse=True)

        
        print(cards)
        print(temp1)
        print(temp4)




        temp6=[]
        
        if (set([1,10,11,12,13]).issubset(set(cards))) or (set([14,23,24,25,26]).issubset(set(cards))) or (set([27,36,37,38,39]).issubset(set(cards))) or (set([40,49,50,51,52]).issubset(set(cards))):
            return["royal flash", [10,11,12,13,14]]

        for suit in temp3:
            if temp3.count(suit)>4:
                print(temp3)
                for i in range(len(temp3)):
                    if temp3[i] is suit:
                        temp6.append(cards[i])
                print(temp6)
                temp6.sort(reverse=True)
                for i in range(len(temp6)-4):
                    if(temp6[0+i]==temp6[4+i]+4):
                        # winner = list(temp6[i:i+5])
                        for card in temp6[i:i+5]:
                            winner.append(int(math.fmod(card-1,13)+1))
                        return ["straight flash",winner]


        



        if max(temp2) == 4:
            winner = [temp1[temp2.index(4)]]*4
            return ["four of a kind",winner]
        if max(temp2) == 3 and (temp2.count(3)>3 or temp2.count(2)):
            winner = [temp1[temp2.index(3)]]*3
            return ["full house",winner]

        for suit in temp3:
            if temp3.count(suit)>4:
                for card in cards:
                    if(int((card-1)/13)+1==suit):
                        x = int(math.fmod(card-1,13)+1)
                        if x==1:
                            x=14
                        winner.append(x)
                    winner.sort(reverse=True)
                return ["flush",winner[:5]]

        if (len(temp4)>4):
            for i in range(len(temp4)-4):
                if(temp4[0+i]==temp4[4+i]+4):
                    winner = list(temp4[i:i+5])
                    return ["straight",winner]
                if(temp5[0+i]==temp5[4+i]+4):
                    winner = list(temp5[i:i+5])
                    return ["straight",winner]

                
        if max(temp2) == 3:
            winner = [temp1[temp2.index(3)]]*3
            for card in temp1:
                if card not in winner and len(winner)<5:
                    winner.append(card)
            return ["three of a kind",winner]

        if max(temp2) == 2 and temp2.count(2) > 2:
            for i in range(len(temp1)):
                if(temp2[i]==2):
                    winner.append(temp1[i])
            for card in temp1:
                if card not in winner and len(winner)<5:
                    winner.append(card)
            return ["two pair",winner]

        if max(temp2) == 2:
            winner = [temp1[temp2.index(2)]]*2
            for card in temp1:
                if card not in winner and len(winner)<5:
                    winner.append(card)
            return ["pair",winner]
        return ["high card",temp1[:5]]

