from django.urls import path

from . import views



app_name = 'articles'

urlpatterns = [
    # BASE FEATURES
    path('', views.login, name="default"),
    path('register/', views.register, name="register"),
    path('login/', views.login, name="login"),
    path('logout/', views.logout, name="logout"),
    # PROFILE
    path('profile/@<username>/', views.profile, name="profile"),
    path('profile/edit/', views.edit_profile, name="edit_profile"),
    # OWN ARTICLES
    path('articles/', views.draft_articles_view, name="articles_view"),
    path('articles/drafts/', views.draft_articles_view, name="draft_articles_view"),
    path('articles/drafts/json/', views.json_draft_articles, name="json_draft_articles"),
    path('articles/published/', views.published_articles_view, name="published_articles_view"),
    path('articles/published/json/', views.json_published_articles, name="json_published_articles"),
    path('articles/new/', views.create_article, name="create_article"),
    path('articles/edit/<title>/', views.edit_article, name="edit_article"),
    # GENERAL ARTICLES
    #path('@<author>/<title>/', views.read_article, name="read_article"),
]
