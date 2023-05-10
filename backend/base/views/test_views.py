from django.shortcuts import render
import random

from rest_framework.decorators import api_view
from rest_framework.response import Response
from base.models import Table
from base.serializers import TableSerializer

from base.poker import Poker


def testtt(count):
        cards = list(range(1, 53))
        random.shuffle(cards)
        print(cards)
        playerCards = []
        for p in range(int(count)):
            playerCards.append(
                [cards[p], cards[p + int(count)]])
        ground = [
            cards[(int(count) * 2) + 1],
            cards[(int(count) * 2) + 2],
            cards[(int(count) * 2) + 3],
            cards[(int(count) * 2) + 5],
            cards[(int(count) * 2) + 7]]
        player_hand = []
        status = []
        for player in playerCards:
            temp = list(ground)
            temp.insert(0, player[0])
            temp.insert(1, player[1])
            player_hand.append(temp[:7])
        for cards in player_hand:
            status.append(Poker.evaluate(cards)) 
        # print(status)
        status.sort()
        return (status)
        # return (Poker.evaluate([9,23,11,12,13]))
            
@api_view(['GET'])
def test(request):
    return Response(testtt(9))

