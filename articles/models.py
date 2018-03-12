from django.db import models

from django.contrib.auth.models import AbstractUser

# Create your models here.



# Extends Django's default user implementation
class SharticleUser(AbstractUser):
    resume = models.CharField(max_length = 512)
    number_of_articles = models.IntegerField(default = 0)

    class Meta:
        db_table = 'sharticle_user'
