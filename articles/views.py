from django.shortcuts import render

from django.http import HttpResponse

from django.contrib.auth.models import User

from django.contrib.auth import authenticate, login

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
            user = User.objects.create_user(username, username + '@domain.com', password)
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
    return HttpResponse("This is the login view")
