from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from base.serializers import UserSerializer, UserSerializerWithToken
from ..models import Player
from ..serializers import PlayerSerializer

User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # print("Validating...")
        # print(self)
        data = super().validate(attrs)
        serializer = UserSerializerWithToken(self.user)
        for k, v in serializer.data.items():
            data[k] = v
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['POST'])
def registerUser(request):
    data = request.data
    try:
        user = User.objects.create_user(
            name=data['name'],
            email=data['email'],
            password=data['password'],
        )
        user.save()
        serializer = UserSerializerWithToken(user, many=False)
        return Response(serializer.data)
    except:
        message = {
            'detail': 'User with this email already exist by arya in python'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    serializer = UserSerializerWithToken(user, many=False)
    data = request.data
    user.email = data['email']
    if data['password'] != '':
        user.password = make_password(data['password'])
    user.save()
    # player = Player(user.id)
    player = Player.objects.get(user=user.id)
    serializer2 = PlayerSerializer(player, many=False)
    player.nick_name = data['name']
    if data['img'] != '':
        player.image = data['img']
    player.save()


    return Response([serializer.data, serializer2.data])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)

    player = Player.objects.get(user=user.id)
    serializer2 = PlayerSerializer(player, many=False)
    # print(serializer2.data)
    data = [serializer.data,serializer2.data]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
# @permission_classes([IsAdminUser])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
