from django.apps import AppConfig

class BaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'base'

    def ready(self):
        import base.signals
        # from .models import Table, Player
        # tables = Table.objects.all()
        # players = Player.objects.all()
        # for table in tables:
        #     table.JSON_table['online']= []
        #     table.save()
