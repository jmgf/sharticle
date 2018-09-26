
# EXTERNAL LIBRARIES
from datetime import datetime, timedelta
import time
import json
import uuid

# DJANGO MODULES
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import last_modified
from django.views.decorators.cache import cache_page, cache_control
from django.core.cache import cache
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q

# from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError

# APPLICATION CODE
from .models import SharticleUser, Article, Tag, Comment
from articles import tasks










# =============================================================================
# REGISTER view ===============================================================
# =============================================================================

#@cache_control(max_age=3600, public=True)
#@cache_page(60*60)

def register(request):
    # If the method is POST
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password1"]
        email_address = request.POST["email_address"]

        try:
            q = Q(username = username) | Q(email = email_address)
            user = SharticleUser.objects.get(q)


            # If the user already exists
            if (user.username == username):
                context = { 'user_already_exists': True, 'username': username }

            # If the email already exists
            elif (user.email == email_address):
                context = { 'email_already_exists': True, 'email': email_address }

            return render(request, 'articles/register.html', context)
            

        # If the user still does not exist
        except SharticleUser.DoesNotExist:     

            # Generate confirmation code
            code = str(uuid.uuid4())
            print('===' + code + '===')

            # Store confirmation code in cache for later verification
            cache.set(username + '_registration_confirmation_code', code, None)

            # Send confirmation email (asynchronous task)
            tasks.send_confirmation_email.delay(code, email_address)

            '''
            for i in range(1,10):
                start = time.time()
                # tasks.send_confirmation_email.delay(code, email_address)
                tasks.send_confirmation_email(code, email_address)
                print(1000 * (time.time() - start))
            '''
            # Return confirmation template
            context = { 'username': username, 'email_address': email_address, 'password': password }
            return render(request, 'articles/confirm_registration.html', context)


    # If the method is GET
    return render(request, 'articles/register.html')











def confirm_registration(request):

    # If the method is POST
    if request.method == "POST":
        username = request.POST["username"]
        email_address = request.POST["email_address"]
        password = request.POST["password"]
        code = request.POST["code"]

        # Retrieve confirmation code from cache
        stored_code = cache.get(username + '_registration_confirmation_code')

        # If both codes are the same
        if (code == stored_code):

            # Create a user and save it to the database
            user = SharticleUser.objects.create_user(username, email_address, password)

            # Update cache
            cache.delete(username + '_registration_confirmation_code') 

            # Insert user object in the cache !!!
            # cache.set(username, user, None)
            
            #return HttpResponse("Your account has been created, " + user.username + ".")
            #return redirect('articles:login') 
            context = { 'success': True, 'username': username } 
            return render(request, 'articles/confirm_registration.html', context)
        
        # If the codes are different
        else:
            # Return confirmation template with error
            context = { 'wrong_code': True, 'success': False } 
            return render(request, 'articles/confirm_registration.html', context)













# =============================================================================
# LOGIN view ==================================================================
# =============================================================================

#@cache_control(max_age=3600, public=True)
#@cache_page(60*60)

def login(request):
    # If the method is POST
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        # Check user credentials
        user = authenticate(request, username = username, password = password)
        if user is not None:
            # Log in user
            auth_login(request, user)
            # SUBSTITUIR "request.user.username" POR "user.username" PARA EVITAR ACESSOS À BASE DE DADOS
            
            response = redirect('articles:edit_profile')
            response.set_cookie('username', username)
            response.set_cookie('profile_image', user.profileImagePath)
            return response
            # return HttpResponse("You have been successfully logged in, " + request.user.username  + "!")

        # If the user does not exist or the password is wrong
        else:
            context = { 'wrong_credentials': True }
            return render(request, 'articles/login.html', context)
    
    # If the method is GET
    return render(request, 'articles/login.html')










# =============================================================================
# LOGOUT view =================================================================
# =============================================================================

def logout(request):
    start = time.time()

    # Update user status
    auth_logout(request)
    
    end = time.time()
    print(1000*(end - start))
    
    # Redirect to login page
    response = redirect('articles:login')
    response.delete_cookie('username')
    response.delete_cookie('profile_image')
    return response










# =============================================================================
# PROFILE view ================================================================
# =============================================================================


def last_modified_func(request, username):
    try:
        start = time.time()
        selected_user = SharticleUser.objects.get(username = username)
        end = time.time()
        print("SELECT user FROM DATABASE:" + str(1000*(end - start)))
        return selected_user.profile_last_modified_date
        
    # If the user does not exist
    except SharticleUser.DoesNotExist:
        return datetime(2019,1,1)



@last_modified(last_modified_func)

def profile(request, username):
    try:
        selected_user = SharticleUser.objects.get(username = username)

        # Retrieve articles from cache
        articles = cache.get(username + '_articles')
        if articles is None:
            print('from DATABASE')
            # Retrieve articles from database
            articles = Article.objects.filter(author = username, already_published = True)
            # Update cache with articles list
            if (len(articles)>0):
                cache.set(username + '_articles', articles, None)
        else:
            print('from CACHE')

        context = {'selected_user' : selected_user, 'articles' : articles}
        
        response = render(request, 'articles/profile.html', context = context)
        response['Cache-Control'] = 'no-cache'
        return response
    # If the user does not exist
    except SharticleUser.DoesNotExist:
        return HttpResponse("User does not exist!")










# =============================================================================
# EDIT PROFILE view ===========================================================
# =============================================================================

def some_func(request):
    user = request.user
    if user.is_authenticated:
        # Return user's profile last modified date
        return user.profile_last_modified_date
    else:
        # Redirect to login page (user is not logged in)
        return datetime(2018,1,1)



@last_modified(some_func)

def edit_profile(request):
    # If the user is authenticated
    if request.user.is_authenticated:

        # If the method is POST
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
            #if request.POST['email']:
            #    theUser.email = request.POST['email']
            
            # Update user's profile last modified date
            theUser.profile_last_modified_date = datetime.now()

            # Save user object to the database
            theUser.save()
            return render(request, 'articles/edit_profile.html')
        
        # If the method is GET
        else:
            start = time.time()
            t = render(request, 'articles/edit_profile.html')
            # cache.set('edit_profile_page', t)
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

    # If the user is not authenticated
    else:
        # Redirect to login page
        return redirect('articles:login')










# =============================================================================
# ARTICLES view ===============================================================
# =============================================================================

def drafts_last_modified_func(request):
    user = request.user
    if request.user.is_authenticated:
        return user.drafts_last_modified_date
    else:
        return datetime(2018,1,1)



@last_modified(drafts_last_modified_func)

def draft_articles_view(request):  
    # If the user is authenticated
    if request.user.is_authenticated:  
        user = request.user 

        
        # PLAYING AROUND WITH THE CACHE
        # article1 = Article(author = 'author', title = 'title', description = 'description', content = 'content', image_path = 'image_name', tags=[])
        # cache.set('article', article1, None)
        # article2 = cache.get('article')
        # print(article2.image_path)
        
        # Store articles in cache
        # cache.set(request.user.username + 'articles', articles, None)
        # Retrieve articles from cache
        # articles = cache.get(request.user.username + 'articles')
        # END_OF_PLAY


        # Retrieve articles from the db
        articles = Article.objects.filter(author = user.username, already_published = False)
        # Construct response
        response = render(request, 'articles/articles.html', context = {'drafts': True, 'articles': articles})
        response['Cache-Control'] = 'no-cache'
        return response
    
    # If the user is not authenticated
    else:
        # Redirect to login page
        return redirect('articles:login')





def articles_last_modified_func(request):
    user = request.user
    if request.user.is_authenticated:
        return user.articles_last_modified_date
    else:
        return datetime(2018,1,1)


@last_modified(articles_last_modified_func)

def published_articles_view(request):    
    # If the user is authenticated
    if request.user.is_authenticated:  
        user = request.user

        # Retrieve articles from the db
        articles = Article.objects.filter(author = user.username, already_published = True)
        
        # Construct response
        response = render(request, 'articles/articles.html', context = {'published': True, 'articles': articles})
        response['Cache-Control'] = 'no-cache'
        return response
    
    # If the user is not authenticated
    else:
        # Redirect to login page
        return redirect('articles:login')





@last_modified(articles_last_modified_func)

def json_published_articles(request):
    # If the user is authenticated
    if request.user.is_authenticated:  
        # Get list of articles from db
        user = request.user
        articles = Article.objects.filter(author = user.username, already_published = True)  

        # Serialize response in JSON format
        json_data = { 'articles': list(articles.values('id', 'title', 'description', 'author', 'image_path', 'last_modified_date')),
                    'author': { 'username' : user.username, 'resume' : user.resume, 'profileImagePath' : user.profileImagePath } }
        
        response = JsonResponse(json_data)
        response['Cache-Control'] = 'no-cache'
        return response
    
    # If the user is not authenticated
    else:
        # Return unsuccessful response
        return JsonResponse({'success' : False})
    




@last_modified(drafts_last_modified_func)

def json_draft_articles(request):
    # If the user is authenticated
    if request.user.is_authenticated:  
        # Get list of articles from db
        user = request.user
        articles = Article.objects.filter(author = user.username, already_published = False)

        # Serialize response in JSON format
        json_data = { 'articles': list(articles.values('id', 'title', 'description', 'author', 'image_path', 'last_modified_date')),
                    'author': { 'username' : user.username, 'resume' : user.resume, 'profileImagePath' : user.profileImagePath } }

        response = JsonResponse(json_data)
        response['Cache-Control'] = 'no-cache'
        return response
    
    # If the user is not authenticated
    else:
        # Return unsuccessful response
        return JsonResponse({'success' : False})










# =============================================================================
# CREATE NEW ARTICLE view =====================================================
# =============================================================================

def create_article(request):    
    user = request.user

    # If the method is POST
    if request.method == "POST":

        # Retrieve POST data
        if request.POST["title"]:
            title = request.POST["title"]
        if request.POST["description"]:
            description = request.POST["description"]     
        
        # In case of successful image upload  
        if request.FILES:
            image = request.FILES["file"]     
            image_extension = image.name.split(".")[-1]        
            static_url = '/home/joao/Desktop/staticfiles/articles/'
            image_name = 'article_' + str(uuid.uuid4()) + '.' + image_extension
            dir = static_url + image_name

            # Write image to disk
            with open(dir, 'wb+') as destination:
                for chunk in image.chunks():
                    destination.write(chunk)

        # If no image was uploaded
        else:
            image_name = ''
                
        # Create new article and save it to the db
        article = Article(author = user.username, title = title, description = description, content='', image_path = image_name, tags=[])
        article.save()

        # Increment user's draft articles count
        user.number_of_drafts = user.number_of_drafts + 1

        # Update user draft articles' last modified date (used for HTTP caching)
        current_date = datetime.now()
        user.drafts_last_modified_date = current_date
        user.save()

        # Return article editing view
        response = render(request, 'articles/edit_article.html', context = {'article': article, 'topics': dict(Article.TOPICS).items()})
        return response










# =============================================================================
# EDIT ARTICLE view ===========================================================
# =============================================================================

def article_last_modified_func(request, id):
    try:
        return Article.objects.get(id = id).last_modified_date
    # If the requested article does not exist
    except Article.DoesNotExist:
        return datetime(2018,1,1)


@last_modified(article_last_modified_func)

def edit_article(request, id):   
    user = request.user
    
    # Check user authentication status
    if user.is_authenticated:

        try:
            # Retrieve article from db
            article = Article.objects.get(id = id)

            # Check if user is the author and the article is a draft
            if user.username == article.author and not article.already_published:
                response = render(request, 'articles/edit_article.html', context = {'article': article, 'topics': dict(Article.TOPICS).items()})    
            
            # If the user is not the article's author or the article is not a draft
            else:
                response = HttpResponse("You can not edit this article!")

            response['Cache-Control'] = 'no-cache'
            return response

        # If the article does not exist
        except Article.DoesNotExist:
            return HttpResponse("There is no article with id " + id + "!")
    
    # If the user is not authenticated, redirect to login page
    else:
        return redirect('articles:login')










# =============================================================================
# DELETE ARTICLE view =========================================================
# =============================================================================

def delete_article(request, id):  
    # If the method is POST
    if request.method == "POST":  
        user = request.user
        
        try:
            article = Article.objects.get(id = id)
            
            # Check if user is the author
            if user.username == article.author:
                if not article.already_published:
                    draft = True
                else:
                    draft = False

                # Remove article from db
                article.delete()

                current_date = datetime.now()
                
                if draft:
                     # Decrement user's draft articles count
                    user.number_of_drafts = user.number_of_drafts - 1

                    # Update user draft articles' last modified date (used for HTTP caching)
                    # ( No need to update user.profile_last_modified_date, 
                    #   since the profile view does not change )
                    user.drafts_last_modified_date = current_date

                else:
                    # Decrement user's published articles count
                    user.number_of_articles = user.number_of_articles - 1

                    # Update user profile + published articles' last modified date (used for HTTP caching)
                    user.profile_last_modified_date = current_date
                    user.articles_last_modified_date = current_date
                    
                user.save()
        
                # ??? Update article's last modified date (used for HTTP caching) ???
                # ??? ... ???

                # Return successful JSON encoded response
                return JsonResponse({'success' : True})

            # If the user is not the article's author
            else:
                # Return unsuccessful response
                return JsonResponse({'success' : False, 'error_message' : "You can not delete this article!"})

        # If the article does not exist
        except Article.DoesNotExist:
            # Return unsuccessful response
            return JsonResponse({'success' : False, 'error_message' : "There is no article with id " + id + "!"})










# =============================================================================
# SAVE ARTICLE view ===========================================================
# =============================================================================

def save_article(request, id):    
    # If the method is POST
    if request.method == "POST":
        
        if request.POST["content"]:
            user = request.user
            new_content = request.POST["content"]

            # ===========================================================================================
            # article = Article.objects.filter(id = id)
            # if user.username == article.author and not article.already_published:
            #     article.update(content = new_content))
            #     ...
            # ===========================================================================================

            current_date = datetime.now()

            # Update article in db      
            number_of_updates = Article.objects.filter(id = id, author = user.username, already_published = False).update(content = new_content, last_modified_date = current_date)
            
            # Check if user is the author and the article is a draft
            if number_of_updates == 1:                    
                
                # Return successful JSON encoded response
                return JsonResponse({'success' : True})
            
            # If user is not the article's author or the article is not a draft or does not exist
            else:
                # Return unsuccessful response
                return JsonResponse({'success' : False, 'error_message' : "You can not save this article!"})










# =============================================================================
# PUBLISH ARTICLE view ========================================================
# =============================================================================

def publish_article(request, id):  
    # If the method is POST
    if request.method == "POST":          

        user = request.user
        new_tags = []
        
        if request.POST["tags"]:
            for tag in request.POST["tags"].split(","):
                new_tags.append(Tag(tag = tag))
        
        if request.POST["topic"]:
            topic = request.POST["topic"]

        # ===========================================================================================
        # article = Article.objects.filter(id = id)
        # if user.username == article.author and not article.already_published:
        #     article.update(already_published = True, tags = new_tags))
        #     ...
        # ===========================================================================================

        current_date = datetime.now()

        # Update article in db      
        number_of_updates = Article.objects.filter(id = id, author = user.username, already_published = False).update(already_published = True, tags = new_tags, topic = topic, last_modified_date = current_date, pub_date = current_date)
        
        # Check if user is the author and the article is a draft
        if number_of_updates == 1:
                    
            # Update user's number of draft + published articles
            user.number_of_drafts = user.number_of_drafts - 1
            user.number_of_articles = user.number_of_articles + 1

            # Update user profile + draft + published articles' last modified date (used for HTTP caching)
            user.profile_last_modified_date = current_date
            user.drafts_last_modified_date = current_date
            user.articles_last_modified_date = current_date
            user.save()                
            
            # Return successful JSON encoded response
            return JsonResponse({'success' : True})

        # If user is not the article's author or the article is not a draft or does not exist
        else:
            # Return unsuccessful response
            return JsonResponse({'success' : False, 'error_message' : "You can not publish this article!"})
        










# =============================================================================
# ... view ====================================================================
# =============================================================================

def unvariable_view(request):
    response = render(request, 'articles/unvariable.html', context = {'current_date' : datetime.now().second })
    response["Cache-control"] = "max-age=30000"
    return response







def upload_article_image(request):
    user = request.user

    # If the method is POST
    if request.method == "POST":

        # Retrieve POST data
        if request.POST["article_id"]:
            id = request.POST["article_id"]
        
        # In case of successful image upload  
        if request.FILES:
            image = request.FILES["uploaded_image"]     
            image_extension = image.name.split(".")[-1]        
            static_url = '/home/joao/Desktop/staticfiles/articles/'
            image_name = 'article_' + id + "_" + str(uuid.uuid4()) + '.' + image_extension
            dir = static_url + image_name

            # Write image to disk
            with open(dir, 'wb+') as destination:
                for chunk in image.chunks():
                    destination.write(chunk)

        # If no image was uploaded
        else:
            image_name = ''
         

        return JsonResponse({'success' : True, 'imageSrc' : image_name})




















# =============================================================================
# TEST view ===================================================================
# =============================================================================

def test_view(request):
    from .tests import topics_pagination_testing, db_index_testing
    # test_results = topics_pagination_testing()
    test_results = db_index_testing()
    return HttpResponse(test_results)

    '''
    start = time.time()
    qs = Article.objects.filter(topic = 'AI').values('id', 'title', 'description', 'author', 'image_path', 'last_modified_date').order_by('pub_date')
    paginator = Paginator(qs, 50)
    articles = paginator.page(1).object_list
    if articles:
        pass
        
    res = 1000*(time.time()-start)
    print(res)
    return HttpResponse(res)
    '''










# =============================================================================
# READ ARTICLE view ===========================================================
# =============================================================================


def read_article(request, id):   
    
    try:
        # Retrieve article from db
        article = Article.objects.get(id = id)
        
        # Retrieve author from CACHE / DATABASE
        author = SharticleUser.objects.get(username = article.author)

        # Generate response
        response = render(request, 'articles/read_article.html', context = {'article': article, 'topic': dict(Article.TOPICS)[article.topic], 'author': author}) 
        response['Cache-Control'] = 'max-age=1000'
        return response

    # If the article does not exist
    except Article.DoesNotExist:
        return HttpResponse("There is no article with id " + id + "!")







def comments(request, id):

    # If the method is GET
    if request.method == "GET":

        time.sleep(1)

        page_number = int(request.GET["page"])
        qs = Comment.objects.filter(article_id = id).order_by('-date')
        paginator = Paginator(qs, 10)
        try:
            comments = paginator.page(page_number).object_list
            json_data = { 'comments': list(comments.values()) } 
        except EmptyPage:
            json_data = { 'comments': {} } 

        #Comment(article_id = 8, content = 'This is the comment that someone posted and it can be very long, spanning over two lines of text, as ya\'ll can see in this example, made on purpose for testing', author = 'admin').save()
        response = JsonResponse(json_data)


    # If the method is POST
    elif request.method == "POST":
        user = request.user
        content = request.POST["comment"]

        comment = Comment(article_id = id, content = content, author = user.username)
        comment.save()

        return JsonResponse({'success' : True, 'comment': comment.content, 'date': comment.date})
        


    return response







def csrf_view(request):
    return render(request, 'articles/csrf.html')










# =============================================================================
# SEARCH BY TOPIC view ========================================================
# =============================================================================


def search_by_topic(request, topic = 'WP'):   

    if topic in (
        Article.ARTIFICIAL_INTELLIGENCE,
        Article.WEB_PROGRAMMING,
        Article.SOFTWARE_ENGINEERING,
        Article.DATA_SCIENCE,
        Article.CRYPTOGRAPHY,
    ):
        '''
        # Retrieve articles from db
        qs = Article.objects.filter(topic = topic).order_by('pub_date').all()
        paginator = Paginator(qs, 50)
        articles = paginator.page(1).object_list
        '''

        # Retrieve articles from cache
        articles = cache.get(topic + '1')
        
        # Generate response
        response = render(request, 'articles/search_by_topic.html', context = {'articles': articles, 'topic': dict(Article.TOPICS)[topic], 'topic_key': topic, 'topics': dict(Article.TOPICS).items()}) 
        
        # Cache response for 30 minutes
        if cache.get('topics_expiry_date') is None:
            cache.set('topics_expiry_date', datetime.now() + timedelta(minutes = 30), None)
        expiry_date = cache.get('topics_expiry_date')
        response['Expires'] = expiry_date
        return response


    # If the topic does not exist
    else:
        return HttpResponse("Topic " + topic + " does not exist!")
    






def json_search_by_topic(request, topic, page_number = 1):

    # Check if the topic exists
    if topic in (
        Article.ARTIFICIAL_INTELLIGENCE,
        Article.WEB_PROGRAMMING,
        Article.SOFTWARE_ENGINEERING,
        Article.DATA_SCIENCE,
        Article.CRYPTOGRAPHY,
    ):
        
        '''
        try:
            # Retrieve articles from db
            qs = Article.objects.filter(topic = topic).order_by('pub_date').all()
            paginator = Paginator(qs, 50)
            articles_list = paginator.page(page_number).object_list
            articles = list(articles_list.values('id', 'title', 'description', 'author', 'image_path', 'last_modified_date'))
        except EmptyPage:
            articles = None
        '''

        # Retrieve articles from cache
        articles = cache.get(topic + str(page_number))
                
        # Serialize response in JSON format
        json_data = { 'articles': articles }
        
        response = JsonResponse(json_data)

        # Cache response for 30 minutes
        expiry_date = cache.get('topics_expiry_date')
        response['Expires'] = expiry_date
        return response
    
    # If the topic does not exist
    else:
        # Return unsuccessful response
        return JsonResponse({'success' : False})










# =============================================================================
# SEARCH ARTICLES/PEOPLE view =================================================
# =============================================================================


def search(request):

    '''
    import string
    import random
    # Create some users
    for i in range(100):
        username = ''.join(random.choice(string.ascii_lowercase) for x in range(5 + i%2 + i%3))
        user = SharticleUser.objects.create_user(username, username + '@domain.com', 'pass')
    '''

    # If the method is GET
    if request.method == "GET":

        # Search for articles
        if request.GET.get("articles"):
            keyword = request.GET["articles"].split(' ')[0]
            page_number = int(request.GET["page"])

            #users = SharticleUser.objects.raw('SELECT id FROM sharticle_user LIMIT 1')

            q = Q(title__contains = keyword) | Q(description__contains = keyword)
            
            #qs = Article.objects.filter(q).order_by('id')
            #, already_published = True)


            # ====================================================================
            start = time.time()
            articles = Article.objects.filter(Q(description__contains = keyword))
            if articles:
                pass
            end = time.time()
            print('?slow? = ' + str(1000*(end - start)))
            #print(articles)
            # ====================================================================


            # ====================================================================
            start = time.time()
            articles = Article.objects.mongo_find({'$and': [{'$text': { '$search': keyword }}, {'already_published':True}]}, {'_id':0})
            if articles:
                pass
            end = time.time()
            print('INDEX = ' + str(1000*(end - start)))
            #.skip(page_number-1).limit(1)
            # ====================================================================

            large_content = '''
                Anyone who reads Old and Middle English literary texts will be familiar with the mid-brown volumes of the EETS, with the symbol of Alfred's jewel embossed on the front cover. Most of the works attributed to King Alfred or to Aelfric, along with some of those by bishop Wulfstan and much anonymous prose and verse from the pre-Conquest period, are to be found within the Society's three series; all of the surviving medieval drama, most of the Middle English romances, much religious and secular prose and verse including the English works of John Gower, Thomas Hoccleve and most of Caxton's prints all find their place in the publications. Without EETS editions, study of medieval English texts would hardly be possible.

As its name states, EETS was begun as a 'club', and it retains certain features of that even now. It has no physical location, or even office, no paid staff or editors, but books in the Original Series are published in the first place to satisfy subscriptions paid by individuals or institutions. This means that there is need for a regular sequence of new editions, normally one or two per year; achieving that sequence can pose problems for the Editorial Secretary, who may have too few or too many texts ready for publication at any one time. Details on a separate sheet explain how individual (but not institutional) members can choose to take certain back volumes in place of the newly published volumes against their subscriptions. On the same sheet are given details about the very advantageous discount available to individual members on all back numbers. In 1970 a Supplementary Series was begun, a series which only appears occasionally (it currently has 24 volumes within it); some of these are new editions of texts earlier appearing in the main series. Again these volumes are available at publication and later at a substantial discount to members. All these advantages can only be obtained through the Membership Secretary (the books are sent by post); they are not available through bookshops, and such bookstores as carry EETS books have only a very limited selection of the many published.

Editors, who receive no royalties or expenses and who are only very rarely commissioned by the Society, are encouraged to approach the Editorial Secretary with a detailed proposal of the text they wish to suggest to the Society early in their work; interest may be expressed at that point, but before any text is accepted for publication the final typescript must be approved by the Council (a body of some twenty scholars), and then assigned a place in the printing schedule. The Society now has a stylesheet to guide editors in the layout and conventions acceptable within its series. No prescriptive set of editorial principles is laid down, but it is usually expected that the evidence of all relevant medieval copies of the text(s) in question will have been considered, and that the texts edited will be complete whatever their length. Editions are directed at a scholarly readership rather than a popular one; though they normally provide a glossary and notes, no translation is provided.

EETS was founded in 1864 by Frederick James Furnivall, with the help of Richard Morris, Walter Skeat, and others, to bring the mass of unprinted Early English literature within the reach of students. It was also intended to provide accurate texts from which the New (later Oxford) English Dictionary could quote; the ongoing work on the revision of that Dictionary is still heavily dependent on the Society's editions, as are the Middle English Dictionary and the Toronto Dictionary of Old English. In 1867 an Extra Series was started, intended to contain texts already printed but not in satisfactory or readily obtainable editions; this series was discontinued in 1921, and from then on all the Society's editions, apart from the handful in the Supplementary Series described above, were listed and numbered as part of the Original Series. In all the Society has now published some 475 volumes; all except for a very small number (mostly of editions superseded within the series) are available in print. The early history of the Society is only traceable in outline: no details about nineteenth-century membership are available, and the secretarial records of the early twentieth century were largely lost during the second world war. By the 1950s a very large number of the Society's editions were out of print, and finances allowed for only a very limited reprinting programme. Around 1970 an advantageous arrangement was agreed with an American reprint firm to make almost all the volumes available once more whilst maintaining the membership discounts. Though this arrangement was superseded towards the end of the twentieth century and the cost of reprinting has reverted to the Society, as a result of the effort then it has proved possible to keep the bulk of the list in print.

Many comparable societies, with different areas of interest, were founded in the nineteenth century (several of them also by Furnivall); not all have survived, and few have produced as many valuable volumes as EETS. The Society's success continues to depend very heavily on the loyalty of members, and especially on the energy and devotion of a series of scholars who have been involved with the administration of the Society - the amount of time and effort spent by those who over the years have filled the role of Editorial Secretary is immeasurable. Plans for publications for the coming years are well in hand: there are a number of important texts which should be published within the next five years. At present, notably because of the efforts of a series of Executive and Membership Secretaries, the Society's finances are in reasonable shape; but certain trends give concern to the Council. The Society's continuance is dependent on two factors: the first is obviously the supply of scholarly editions suitable to be included in its series; the second is on the maintenance of subscriptions and sales of volumes at a level which will cover the printing and distribution costs of the new and reprinted books. The normal copyright laws cover the Society's volumes. All enquiries about large scale reproduction, whether by photocopying or on the internet, should be directed to the Executive Secretary in the first instance. The Society's continued usefulness depends on its editors and on its ability to maintain its (re)printing programme - and that depends on those who traditionally have become members of the Society. We hope you will maintain your membership, and will encourage both the libraries you use and also other individuals to join. Membership conveys many benefits for you, and for the wider academic community concerned for the understanding of medieval texts.                
            '''
            small_content = '''
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
                awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome awesome 
            '''

            large_article = Article(author = 'author', title = 'title', description = large_content, already_published = True, content = 'content', image_path = 'image_name', tags=[])
            small_article = Article(author = 'author', title = 'title', description = small_content, already_published = True, content = 'content', image_path = 'image_name', tags=[])


            # ====================================================================
            start = time.time()
            #large_article.save()
            end = time.time()
            print('LARGE content = ' + str(1000*(end - start)))
            # ====================================================================
            start = time.time()
            #small_article.save()
            end = time.time()
            print('SMALL content = ' + str(1000*(end - start)))
            # ====================================================================


            # articles = Article.objects.raw('{$or: [{title:/1/}, {description:/ar/}]}')
            # articles = Article.objects.mongo_find({'$or': [{'title': '1'}, {'description': '2'}]}, {'_id':0})
            # print(list(articles))

            
            new_list = []
            for article in articles:
                # print(article)
                new_list.append(list(article.values()))

            #paginator = Paginator(articles, 5)
            #articles = paginator.page(page_number).object_list


            # Serialize response in JSON format
            if articles:
                json_data = { 'articles': new_list }
                # json_data = { 'articles': list(articles.values('id', 'title', 'description', 'author', 'image_path', 'last_modified_date')) }
            else:
                json_data = { 'articles': None }                
            response = JsonResponse(json_data)
            return response     


        # Search for people
        elif request.GET.get("people"):
            keyword = request.GET["people"].split(' ')[0]
            page_number = int(request.GET["page"])

            q = Q(username__contains = keyword)
            qs = SharticleUser.objects.filter(q).order_by('id')
            #, already_published = True)

            paginator = Paginator(qs, 5)
            people = paginator.page(page_number).object_list

            if people:
                json_data = { 'people': list(people.values()) }
            else:
                json_data = { 'people': None }  
            response = JsonResponse(json_data)
            return response     

        
        # HTTP request
        else:
            return render(request, 'articles/search.html')





#print(Article.objects.filter(tags={'tag':'taggy'}))