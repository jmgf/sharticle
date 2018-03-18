from django.shortcuts import render, redirect

from django.http import HttpResponse

# from django.contrib.auth.models import User
from .models import SharticleUser

from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout

from django.db import IntegrityError



# =============================================================================
# Register view ===============================================================
# =============================================================================

def register(request):
    # Método POST
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password1"]

        try:
            # Create a user and save it to the database
            user = SharticleUser.objects.create_user(username, username + '@domain.com', password)
            return HttpResponse("Your account has been created, " + user.username + ".")

        # In case the user already exists
        except IntegrityError:
            context = { 'user_already_exists': True, 'username': username }
            return render(request, 'articles/register.html', context)

    # Método GET
    return render(request, 'articles/register.html')



# =============================================================================
# Login view ==================================================================
# =============================================================================

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
            return HttpResponse("You have been successfully logged in, " + request.user.username  + "!")

        # In case the user does not exist or the password is wrong
        else:
            context = { 'wrong_credentials': True }
            return render(request, 'articles/login.html', context)
    # Método GET
    return render(request, 'articles/login.html')



# =============================================================================
# Logout view =================================================================
# =============================================================================

def logout(request):
    auth_logout(request)
    return HttpResponse("You have been logged out!");



# =============================================================================
# Profile view ================================================================
# =============================================================================

def profile(request, username):
    selected_user = SharticleUser.objects.get(username = username);
    return render(request, 'articles/profile.html', context = {'selected_user' : selected_user})



# =============================================================================
# Edit profile view ===========================================================
# =============================================================================

def edit_profile(request):
    if request.user.is_authenticated:
        if request.method == "POST":
            theUser = request.user
            # Update user's resume
            if request.POST['resume']:
                request.user.resume = request.POST['resume']
            # Update user's first name
            if request.POST['first_name']:
                theUser.first_name = request.POST['first_name']
            # Update user's last name
            if request.POST['last_name']:
                theUser.last_name = request.POST['last_name']
            # Update user's email
            if request.POST['email']:
                theUser.email = request.POST['email']
            # Save user object to the database
            theUser.save()
            return render(request, 'articles/edit_profile.html')
        else:
            return render(request, 'articles/edit_profile.html')
    # In case the user is not authenticated, redirect to login page
    else:
        return redirect('articles:login')
