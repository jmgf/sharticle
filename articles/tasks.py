from __future__ import absolute_import, unicode_literals
from celery import shared_task
from datetime import datetime, timedelta
from django.core.cache import cache
from articles.models import Article
from django.core.paginator import Paginator, EmptyPage
from django.core.mail import EmailMessage


@shared_task
def example_task():
    from datetime import datetime
    return str(datetime.now().second)


@shared_task
def send_confirmation_email(code, to):
    subject = 'Sharticle registration'
    body = 'Thank you for choosing Sharticle! \n Your verification code is ' + code + ' \n Please confirm your registration by accessing sharticle.ddns.net/login/'
    email = EmailMessage(subject, body, to = [to])
    email.send()


@shared_task
def populate_search_by_topic():

    previous_expiry_date = cache.get('topics_expiry_date')
    if not previous_expiry_date:
        previous_expiry_date = datetime.now() + timedelta(minutes = 30)
    
    new_expiry_date = previous_expiry_date + timedelta(minutes = 30)
    cache.set('topics_expiry_date', new_expiry_date, None)

    for topic in (
        Article.ARTIFICIAL_INTELLIGENCE,
        Article.WEB_PROGRAMMING,
        Article.SOFTWARE_ENGINEERING,
        Article.DATA_SCIENCE,
        Article.CRYPTOGRAPHY,
    ):
    
        #qs = Article.objects.filter(topic = topic, already_published = True).values('id', 'title', 'description', 'author', 'image_path', 'last_modified_date').order_by('pub_date')
        qs = Article.objects.filter(topic = topic).values('id', 'title', 'description', 'author', 'image_path', 'last_modified_date').order_by('pub_date')
        if qs:
            pass
            
        paginator = Paginator(qs, 50)

        for i in range(1, paginator.num_pages+1):
            articles = paginator.page(i).object_list
            cache.set(topic + str(i), articles, None)