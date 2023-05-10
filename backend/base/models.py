from django.db import models
from django.contrib.auth.models import AbstractBaseUser, AbstractUser, PermissionsMixin
from django.contrib.auth.models import BaseUserManager, UserManager
from picklefield.fields import PickledObjectField

class CustomUserManager(UserManager):
    def _create_user(self, email, password=None,name=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        extra_fields.setdefault('is_active', True)
        if password is not None:
            user.set_password(password)
        else:
            print("Password not provided")
        user.save()
        p = Player(user=user)
        p.nick_name = name
        p.save()
        return user

    def create_user(self, email=None, password=None, name=None, **extra_fields):
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_staff', False)
        return self._create_user(email, password, name, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class Meta:
        ordering = ["id"]
    email = models.EmailField("email address",unique=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        return self.email

def JSON():
    return {"winner_hand":[]}
def data():
    return {"ground":[0,0,0,0,0], "orders":[], "bets":[], "winner":[],"winner_hand":[]}
def ground():
    return {"ground":[0,0,0,0,0]}
def table():
    return {"online":[]}

class Table(models.Model):
    types = [
        (0, 'Holdem-Texas'),
        (1, 'Omaha'),
    ]
    maxs = [
        (0, '3'),
        (1, '6'),
        (2, '9'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    _id = models.AutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=200, null=True, blank=True)
    img = models.ImageField(null=True,default="/poker1.webp")
    type = models.IntegerField(choices=types, default=0)
    max = models.IntegerField(choices=maxs, default=1)
    min = models.IntegerField(default=0)
    small = models.IntegerField(null=True, default=1)
    createdAt = models.DateTimeField(auto_now_add=True)
    JSON_table = models.JSONField(default=table)
    # is_playing = models.BooleanField(default=False)
    # isAvailable = models.BooleanField(default=True)
    

    def __str__(self):
        return self.name

def upload_path(instance,filename):
    return '/'.join(['profiles',str(instance.user.id), filename])

class Player(models.Model):
    state = [
        (0, ''),
        (1, 'Fold'),
        (2, 'Check'),
        (3, 'Call'),
        (4, 'Raise'),
        (5, 'Allin'),
    ]
    title = [
        (1, 'High Card'),
        (2, 'Pair'),
        (3, 'Two pair'),
        (4, 'Set'),
        (5, 'Straight'),
        (6, 'Flush'),
        (7, 'Fullhouse'),
        (8, 'Four of a kind'),
        (9, 'Straight flush'),
        (10, 'Royal flush'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE,primary_key=True)
    nick_name = models.CharField(max_length=200, null=True, blank=True)
    balance = models.IntegerField(null=True, default=0)
    status = models.IntegerField(null=True, choices=state, default=0, blank=True)
    title = models.IntegerField(null=True, choices=title, default=1, blank=True)
    credit_total = models.IntegerField(default=1000, null=True)
    JSON = models.JSONField(default=JSON)
    turn = models.BooleanField(default=False)
    dealer = models.BooleanField(default=False)
    small = models.BooleanField(default=False)
    big = models.BooleanField(default=False)
    winner = models.BooleanField(default=False)
    bet = models.IntegerField(default=0)
    image = models.ImageField(default="/avatar1.webp", upload_to=upload_path)
    card1 = models.IntegerField(default=0)
    card2 = models.IntegerField(default=0)
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)

    # def ini(self):
    #     Game.objects.create(table=self).save()

    def __str__(self):
        return str(self.user.id) + " - " + str(self.user.email)

class Game(models.Model):
    stages = [
        (0, 'Preflap'),
        (1, 'Flap'),
        (2, 'Turn'),
        (3, 'River'),
    ]
    round = models.AutoField(primary_key=True, editable=False)
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    stage = models.IntegerField(choices=stages, default=0)
    turn = models.IntegerField(null=True, default=0)
    changer = models.IntegerField(null=True, default=0)
    small_blind = models.IntegerField(null=True, default=0)
    bet = models.IntegerField(null=True, default=0)
    pot = models.IntegerField(null=True, default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    JSON_data = models.JSONField(default=data)
    JSON_ground = models.JSONField(default=ground)
    player = models.ManyToManyField(Player, blank=True)
    isPlayed = models.BooleanField(default=False)
    isFinished = models.BooleanField(default=False)
    gameObject = PickledObjectField(blank = True, null=True)

    def __str__(self):
        return (str(self.round) + " - " + (self.table.name))
        # return ( " - " + (self.table.name))

