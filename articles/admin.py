from django.contrib import admin

from articles.models import SharticleUser, Article

# Register your models here.


admin.site.register(SharticleUser)
admin.site.register(Article)
