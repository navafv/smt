from django.apps import AppConfig


class FruitsConfig(AppConfig):
    name = 'fruits'

    def ready(self):
        import fruits.signals