import time

from django.test import TestCase

from django.db import models
from django.contrib.auth.models import AbstractUser
from djongo import models as djongo_models
from django.forms import ModelForm

from .models import SharticleUser, Article, Tag


# #######################################################################
# MODELS for performance testing
# #######################################################################


class TestTag(models.Model):
    tag_title = models.CharField(max_length = 64)

class TestArticle(models.Model):
    title = djongo_models.CharField(max_length = 128)
    description = djongo_models.CharField(max_length = 512)
    author = djongo_models.CharField(max_length = 512)
    pub_date = djongo_models.DateTimeField(null = True, blank = True)    
    image_path = models.CharField(max_length = 512, null = True, blank = True)
    last_modified_date = djongo_models.DateTimeField(auto_now_add = True)
    number_of_comments = djongo_models.IntegerField(default = 0)
    rating = djongo_models.FloatField(default = 0)
    content = djongo_models.CharField(max_length = 4096, default='')
    already_published = djongo_models.BooleanField(default = False)
    article_tags = models.ManyToManyField(TestTag)


# #######################################################################
# End of MODELS
# #######################################################################





# #######################################################################
# PERFORMANCE TESTS
# #######################################################################


def db_index_testing():

    '''
    for j in range(10):
        lst = []
        for i in range(1000):
            lst.append(Article(author = 'ZZZ', title = 'ZZZ', description = 'ZZZ', content = 'ZZZ', image_path = 'ZZZ', tags=[]))
            lst.append(Article(author = 'YYY', title = 'YYY', description = 'YYY', content = 'YYY', image_path = 'YYY', tags=[]))
        Article.objects.bulk_create(lst)
        print(str((j+1)*10) + '%')
    '''

    set1 = []
    set2 = []

    for i in range(10):        
        ###############################################
        start = time.time()    
        a = Article.objects.filter(author = 'ZZZ').all()
        set1.append(1000*(time.time() - start))
        ###############################################

    for i in range(10):
        ###############################################
        start = time.time()    
        Article.objects.get(id = 5)        
        set2.append(1000*(time.time() - start))
        ###############################################


    print(','.join(map(str, set1)))
    print(','.join(map(str, set2)))
    
    print("SELECT ARTICLE(author): " + str(sum(set1) / float(len(set1))))
    print("SELECT ARTICLE(id): " + str(sum(set2) / float(len(set2))))








def nosql_testing():
    
    set1 = []
    set2 = []
    set3 = []
    set4 = []

    for i in range(10):
        nosql_test_function(set1, set2, set3, set4)

    print(','.join(map(str, set1)))
    print(','.join(map(str, set2)))
    print(','.join(map(str, set3)))
    
    print("RELATIONAL , MASS operation: " + str(sum(set1) / float(len(set1))))
    print("Relational , one by one: " + str(sum(set2) / float(len(set2))))
    print("NoSQL: " + str(sum(set3) / float(len(set3))))
    print("NoSQL (change already_published): " + str(sum(set4) / float(len(set4))))



def nosql_test_function(set1, set2, set3, set4):

    # Reset the database
    TestTag.objects.all().delete()
    TestArticle.objects.all().delete()
    # Create some tags
    tag1 = TestTag(tag_title = 'Sports')
    tag1.save()
    tag2 = TestTag(tag_title = 'Culture')
    tag2.save()
    tag3 = TestTag(tag_title = 'Philosophy')
    tag3.save()
    tag4 = TestTag(tag_title = 'Entrepreneurship')
    tag4.save()
    tag5 = TestTag(tag_title = 'Arts')
    tag5.save()
    tag6 = TestTag(tag_title = 'Nature')
    tag6.save()
    tag7 = TestTag(tag_title = 'Nature')
    tag7.save()
    tag8 = TestTag(tag_title = 'Nature')
    tag8.save()
    tag9 = TestTag(tag_title = 'Nature')
    tag9.save()
    tag10 = TestTag(tag_title = 'Nature')
    tag10.save()
    tag11 = TestTag(tag_title = 'Nature')
    tag11.save()
    tag12 = TestTag(tag_title = 'Nature')
    tag12.save()
    tagA = Tag(tag='Sports')
    tagB = Tag(tag='Culture')
    tagC = Tag(tag='Philosophy')
    tagD = Tag(tag='Entrepreneurship')
    tagE = Tag(tag='Arts')
    tagF = Tag(tag='Nature')
    tagG = Tag(tag='Sportss')
    tagH = Tag(tag='Culturee')
    tagI = Tag(tag='Philosophyy')
    tagJ = Tag(tag='Entrepreneurshipp')
    tagK = Tag(tag='Artss')
    tagL = Tag(tag='Naturee')
    # Create a simple article
    simple_article = TestArticle(title = 'Is this the end of football as we know it?')
    simple_article.save()
    # Create an article with tags
    article_with_tags = Article(author = 'ZZZ', title = 'ZZZ', description = 'ZZZ', content = 'ZZZ', image_path = 'ZZZ', tags=[])
    article_with_tags.save()



    ###############################################
    start = time.time()    

    # Update article's tags (Relational , MASS operation)
    simple_article.article_tags.add(tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, tag11, tag12)
    # simple_article.already_published = True
    #simple_article.save()
    
    set1.append(1000*(time.time() - start))
    ###############################################



    ###############################################
    simple_article.article_tags.all().delete()
    start = time.time()    

    # Update article's tags (Relational , one by one)
    simple_article.article_tags.add(tag1)
    simple_article.article_tags.add(tag2)
    simple_article.article_tags.add(tag3)
    simple_article.article_tags.add(tag4)
    simple_article.article_tags.add(tag5)
    simple_article.article_tags.add(tag6)
    simple_article.article_tags.add(tag7)
    simple_article.article_tags.add(tag8)
    simple_article.article_tags.add(tag9)
    simple_article.article_tags.add(tag10)
    simple_article.article_tags.add(tag11)
    simple_article.article_tags.add(tag12)

    #simple_article.already_published = True
    #simple_article.save()

    set2.append(1000*(time.time() - start))
    ###############################################



    ###############################################
    start = time.time()
    
    # Update article's tags (NoSQL)
    article_with_tags.tags = [tagA, tagB, tagC, tagD, tagE, tagF, tagG, tagH, tagI, tagJ, tagK, tagL]
    #article_with_tags.already_published = True
    article_with_tags.save()

    set3.append(1000*(time.time() - start))

    start = time.time()
    
    # Update article's already_published (NoSQL)
    # article_with_tags.tags = [tagA, tagB, tagC, tagD, tagE, tagF, tagG, tagH, tagI, tagJ, tagK, tagL]
    article_with_tags.already_published = True
    article_with_tags.save()

    set4.append(1000*(time.time() - start))
    ###############################################






'''
start = time.time()
# Execute instructions  
end = time.time()
print(1000*(end - start))
'''


# #######################################################################
# End of PERFORMANCE TESTS
# #######################################################################
