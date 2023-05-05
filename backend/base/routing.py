from django.urls import re_path
from . import consumers
websocket_urlpattern = [
    re_path(r'ws/poker/(?P<pk>\w+)/$', consumers.PokerConsumer.as_asgi())
]


