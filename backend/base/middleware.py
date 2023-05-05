
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from channels.middleware import BaseMiddleware
from django.db import close_old_connections
import jwt
from django.conf import settings

@database_sync_to_async
def get_user(validated_token):
    try:
        user = get_user_model().objects.get(id=validated_token["user_id"])
        # print(f"{user}")
        return user
   
    except get_user_model().DoesNotExist:
        return AnonymousUser()



class JwtAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
       # Close old database connections to prevent usage of timed out connections
        close_old_connections()

        # Get the token
        token = False
        query = scope['query_string']
        if(query):
            query = query.decode()
        if(query):
            query = query.split('&')

        # if(query):
            query2 = query[1].split('=')
            query = query[0].split('=')
            # print(query2)
            if(query[0]=="token"):
                token = query[1]
            if(query2[0]=="deposite"):
                deposite = query2[1]
                # print(token)

        # Try to authenticate the user
        try:
            # This will automatically validate the token and raise an error if token is invalid
            UntypedToken(token=token)
        except (InvalidToken, TokenError) as e:
            # Token is invalid
            print(e)
            print("INVALIDETOKEN")
            return None
        else:
            #  Then token is valid, decode it
            decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            # print(decoded_data)
            # Will return a dictionary like -
            # {
            #     "token_type": "access",
            #     "exp": 1568770772,
            #     "jti": "5c15e80d65b04c20ad34d77b6703251b",
            #     "user_id": 6
            # }

            # Get the user using ID
            scope["user"] = await get_user(validated_token=decoded_data)
            scope["deposite"] = deposite
        return await super().__call__(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    # return (AuthMiddlewareStack(inner))
    # return JwtAuthMiddleware(AuthMiddlewareStack(inner))
    return JwtAuthMiddleware(inner)