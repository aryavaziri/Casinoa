from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response
from base.models import Table
from base.serializers import TableSerializer

@api_view(['GET'])
def getTables(request):
    tables = Table.objects.all()
    serializer = TableSerializer(tables, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def getTable(request, pk):
    table = Table.objects.get(_id=pk)
    serializer = TableSerializer(table, many=False)
    return Response(serializer.data)
