from django.db import models

from django.contrib.auth.models import AbstractUser

# Create your models here.



# Extends Django's default user implementation
class SharticleUser(AbstractUser):
    resume = models.CharField(max_length = 512, null=True, blank=True)
    number_of_articles = models.IntegerField(default = 0)
    number_of_followers = models.IntegerField(default = 0)
    number_of_followees = models.IntegerField(default = 0)
    profileImagePath = models.CharField(max_length = 512, null=True, blank=True)
    date_last_modified = models.DateTimeField(auto_now_add = True)

    class Meta:
        db_table = 'sharticle_user'
