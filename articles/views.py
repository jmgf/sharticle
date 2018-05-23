from django.shortcuts import render, redirect

from django.core.cache import cache

from django.http import HttpResponse, JsonResponse

# from django.contrib.auth.models import User
from .models import SharticleUser, Article

from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout

from django.db import IntegrityError

from django.views.decorators.cache import cache_page, cache_control

from django.views.decorators.http import last_modified

from datetime import datetime

import json

import time





# =============================================================================
# REGISTER view ===============================================================
# =============================================================================

#@cache_control(max_age=3600, public=True)
#@cache_page(60*60)

def register(request):
    # Método POST
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password1"]

        try:
            # Create a user and save it to the database
            user = SharticleUser.objects.create_user(username, username + '@domain.com', password)
            
            #return HttpResponse("Your account has been created, " + user.username + ".")
            return redirect('articles:login')

        # In case the user already exists
        except IntegrityError:
            context = { 'user_already_exists': True, 'username': username }
            return render(request, 'articles/register.html', context)

    # Método GET
    return render(request, 'articles/register.html')





# =============================================================================
# LOGIN view ==================================================================
# =============================================================================

#@cache_control(max_age=3600, public=True)
#@cache_page(60*60)

def login(request):
    # Método POST
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        # Check user credentials
        user = authenticate(request, username = username, password = password)
        if user is not None:
            # Log in user
            auth_login(request, user)
            # SUBSTITUIR "request.user.username" POR "user.username" PARA EVITAR ACESSOS À BASE DE DADOS
            
            return redirect('articles:edit_profile')
            # return HttpResponse("You have been successfully logged in, " + request.user.username  + "!")

        # In case the user does not exist or the password is wrong
        else:
            context = { 'wrong_credentials': True }
            return render(request, 'articles/login.html', context)
    # Método GET
    return render(request, 'articles/login.html')





# =============================================================================
# LOGOUT view =================================================================
# =============================================================================

def logout(request):
    start = time.time()

    auth_logout(request)
    
    end = time.time()
    print(1000*(end - start))
    
    return HttpResponse("You have been logged out!")





# =============================================================================
# PROFILE view ================================================================
# =============================================================================


def last_modified_func(request, username):
    start = time.time()
    selected_user = SharticleUser.objects.get(username = username)
    end = time.time()
    print("SELECT user FROM DATABASE:" + str(1000*(end - start)))
    return selected_user.date_last_modified

@last_modified(last_modified_func)
def profile(request, username):
    try:
        selected_user = SharticleUser.objects.get(username = username)
        response = render(request, 'articles/profile.html', context = {'selected_user' : selected_user})
        response['Cache-Control'] = 'no-cache'
        return response
    # In case the user does not exist
    except SharticleUser.DoesNotExist:
        return HttpResponse("User does not exist!")





# =============================================================================
# EDIT PROFILE view ===========================================================
# =============================================================================

def some_func(request):
    user = request.user
    if user.is_authenticated:
        # Return user's profile last modified date
        return user.date_last_modified
    else:
        # Redirect to login page (user is not logged in)
        return datetime(2018,1,1)

@last_modified(some_func)

def edit_profile(request):
    if request.user.is_authenticated:
        if request.method == "POST":
            theUser = request.user

            # Update user's resume
            theUser.resume = request.POST['resume']
            
            # Update user's first name
            if request.POST['first_name']:
                theUser.first_name = request.POST['first_name']
            
            # Update user's last name
            if request.POST['last_name']:
                theUser.last_name = request.POST['last_name']
            
            # Update user's email
            if request.POST['email']:
                theUser.email = request.POST['email']
            
            # Update user's profile last modified date
            theUser.date_last_modified = datetime.now()
            # Save user object to the database
            theUser.save()
            return render(request, 'articles/edit_profile.html')

        else:
            start = time.time()
            t = render(request, 'articles/edit_profile.html')
            end = time.time()
            print(1000*(end - start))

            start = time.time()
            cache.delete('edit_profile_page')
            #r = cache.get('edit_profile_page')
            end = time.time()
            print(1000*(end - start))

            if ("a"!="a"):
                print("Damn!")
            else:
                print ("YEAH!!")

            return t
    # In case the user is not authenticated, redirect to login page
    else:
        return redirect('articles:login')





# =============================================================================
# ARTICLES view ===============================================================
# =============================================================================

def draft_articles_view(request):    
    user = request.user
    articles = Article.objects.filter(author = user.username, already_published = False)
    response = render(request, 'articles/articles.html', context = {'drafts': True, 'articles': articles})
    return response



def published_articles_view(request):    
    user = request.user
    articles = Article.objects.filter(author = user.username, already_published = True)
    response = render(request, 'articles/articles.html', context = {'published': True, 'articles': articles})
    return response





def json_published_articles(request):
    # Get list of articles from db
    user = request.user
    articles = Article.objects.filter(author = user.username, already_published = True)  

    # Serialize response in JSON format
    json_data = { 'articles': list(articles.values()), 
                  'author': { 'username' : user.username, 'resume' : user.resume, 'profileImagePath' : user.profileImagePath } }
    return JsonResponse(json_data)



def json_draft_articles(request):
    # Get list of articles from db
    user = request.user
    articles = Article.objects.filter(author = user.username, already_published = False)

    # Serialize response in JSON format
    json_data = { 'articles': list(articles.values()), 
                  'author': { 'username' : user.username, 'resume' : user.resume, 'profileImagePath' : user.profileImagePath } }
    return JsonResponse(json_data)





# =============================================================================
# CREATE NEW ARTICLE view =====================================================
# =============================================================================

def create_article(request):    
    # If the method is POST
    if request.method == "POST":
        # Retrieve POST data
        title = request.POST["title"]
        description = request.POST["description"]        
        # Create new article and save it to the db
        article = Article(author = request.user.username, title = title, description = description, content='', image_path = '')
        article.save()
        # Return article editing view
        response = render(request, 'articles/edit_article.html', context = {'article': article})
        return response





# =============================================================================
# EDIT ARTICLE view ===========================================================
# =============================================================================

def edit_article(request, id):    
    article = Article.objects.get(id = id)
    #a = Article(title='Birds are the flying singers of Nature', description='Do you know the benefits of having birds around? Find out here!', author='jmgf', image_path='https://www.gettyimages.ie/gi-resources/images/Homepage/Hero/UK/CMS_Creative_164657191_Kingfisher.jpg')
    #a.save()
    response = render(request, 'articles/edit_article.html', context = {'article': article})
    return response





# =============================================================================
# DELETE ARTICLE view =========================================================
# =============================================================================

def delete_article(request, id):    
    # Delete article from db
    try:
        number_of_deletions = Article.objects.get(id = id, author = request.user.username).delete()[0]
        if number_of_deletions == 1:
            # Return successful JSON encoded response
            return JsonResponse({'success' : True})
    
    # In case the article does not exist
    except Article.DoesNotExist:
        # Return unsuccessful response
        return JsonResponse({'success' : False})

