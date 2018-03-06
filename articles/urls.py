from django.urls import path

from . import views



app_name = 'articles'

urlpatterns = [
    path('register/', views.register, name="register"),
]
