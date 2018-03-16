from django.urls import path

from . import views



app_name = 'articles'

urlpatterns = [
    path('', views.login, name="default"),
    path('register/', views.register, name="register"),
    path('login/', views.login, name="login"),
    path('logout/', views.logout, name="logout"),
    path('profile/@<username>/', views.profile, name="profile"),
]
