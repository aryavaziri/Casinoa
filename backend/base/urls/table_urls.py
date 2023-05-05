from django.urls import path
from base.views import table_views as views

urlpatterns = [
    path('', views.getTables, name="tables"),
    path('<str:pk>/', views.getTable, name="table"),
]
