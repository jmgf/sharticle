from __future__ import absolute_import, unicode_literals
from celery import shared_task
import datetime

@shared_task
def example_task():
    from datetime import datetime
    return str(datetime.now().second)