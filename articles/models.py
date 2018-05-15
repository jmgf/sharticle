from django.db import models

from django.contrib.auth.models import AbstractUser

from djongo import models as djongo_models

# Create your models here.



# Extends Django's default user implementation
class SharticleUser(AbstractUser):
    resume = models.CharField(max_length = 512, null = True, blank = True)
    number_of_drafts = models.IntegerField(default = 0)
    number_of_articles = models.IntegerField(default = 0)
    number_of_followers = models.IntegerField(default = 0)
    number_of_followees = models.IntegerField(default = 0)
    profileImagePath = models.CharField(max_length = 512, null = True, blank = True)
    date_last_modified = models.DateTimeField(auto_now_add = True)

    class Meta:
        db_table = 'sharticle_user'




class Article(djongo_models.Model):
    title = djongo_models.CharField(max_length = 128)
    description = djongo_models.CharField(max_length = 512)
    author = djongo_models.CharField(max_length = 512)
    pub_date = djongo_models.DateField(auto_now_add = True)
    image_path = models.CharField(max_length = 512, null = True, blank = True)
    date_last_modified = djongo_models.DateTimeField(auto_now_add = True)
    number_of_comments = djongo_models.IntegerField(default = 0)
    rating = djongo_models.FloatField(default = 0)

    objects = djongo_models.DjongoManager()

    def __str__(self):
        return self.author + ' (' + str(self.pub_date) + ')' + ' : "' + self.title  + '"'