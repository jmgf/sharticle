from django.db import models

from django.contrib.auth.models import AbstractUser

from djongo import models as djongo_models

from django.forms import ModelForm

# Create your models here.



# Extends Django's default user implementation
class SharticleUser(AbstractUser):
    resume = models.CharField(max_length = 512, null = True, blank = True)
    number_of_drafts = models.IntegerField(default = 0)
    number_of_articles = models.IntegerField(default = 0)
    number_of_followers = models.IntegerField(default = 0)
    number_of_followees = models.IntegerField(default = 0)
    profileImagePath = models.CharField(max_length = 512, null = True, blank = True)
    profile_last_modified_date = models.DateTimeField(auto_now_add = True)
    drafts_last_modified_date = models.DateTimeField(auto_now_add = True)
    articles_last_modified_date = models.DateTimeField(auto_now_add = True)

    class Meta:
        db_table = 'sharticle_user'


class Tag(djongo_models.Model):
    tag = models.CharField(max_length = 64)

    objects = djongo_models.DjongoManager()

class TagForm(ModelForm):
    class Meta:
        model = Tag
        fields = ['tag']




class Article(djongo_models.Model):
    title = djongo_models.CharField(max_length = 128)
    description = djongo_models.CharField(max_length = 512)
    author = djongo_models.CharField(max_length = 512)
    pub_date = djongo_models.DateTimeField(null = True, blank = True)    
    image_path = models.CharField(max_length = 512, null = True, blank = True)
    last_modified_date = djongo_models.DateTimeField(auto_now_add = True)
    number_of_comments = djongo_models.IntegerField(default = 0)
    rating = djongo_models.FloatField(default = 0)
    content = djongo_models.CharField(max_length = 4096, default='')
    already_published = djongo_models.BooleanField(default = False)
    tags = djongo_models.ArrayModelField(
        model_container = Tag,
        model_form_class = TagForm,
        null = True,
    )

    objects = djongo_models.DjongoManager()

    def __str__(self):
        return '"' + self.title + '" - '  + self.author + ' (' + str(self.pub_date) + ')'