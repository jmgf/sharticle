from django.urls import path

from . import views



app_name = 'articles'

urlpatterns = [
    path('', views.search_by_topic, name="search_by_topic"),
    # BASE FEATURES
    path('csrf/', views.csrf_view, name="csrf"),
    path('register/', views.register, name="register"),
    path('login/', views.login, name="login"),
    path('logout/', views.logout, name="logout"),
    path('confirm/', views.confirm_registration, name="confirm_registration"),
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
    path('articles/edit/<id>/', views.edit_article, name="edit_article"),
    path('articles/delete/<id>/', views.delete_article, name="delete_article"),
    path('articles/save/<id>/', views.save_article, name="save_article"),
    path('articles/publish/<id>/', views.publish_article, name="publish_article"),
    path('articles/uploads/images/', views.upload_article_image, name="upload_article_image"),
    path('unvariable/', views.unvariable_view, name="unvariable_view"),
    # TESTING
    path('test/', views.test_view),

    # GENERAL ARTICLES
    path('articles/<id>/', views.read_article, name="read_article"),
    path('comments/<id>/', views.comments, name="comments"),
    path('topic/<slug:topic>/', views.search_by_topic, name="search_by_topic"),
    path('topic/<slug:topic>/json/<int:page_number>/', views.json_search_by_topic, name="json_search_by_topic"),
    path('topics/', views.search_by_topic, name="search_by_topic"),
    path('search/', views.search, name="search"),
]
