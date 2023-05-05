from django.urls import path
from base.views import poker_views as views

urlpatterns = [
    # path('', views.getTables, name="tables"),
    path('<str:pk>/', views.getGame, name="poker"),
    path('<str:pk>/new/', views.newGame, name="New"),
    path('<str:pk>/action/', views.action, name="Action"),
]
