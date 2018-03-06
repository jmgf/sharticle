from django.shortcuts import render

from django.http import HttpResponse



# =============================================================================
# Register view ===============================================================
# =============================================================================

def register(request):
    return HttpResponse("This is the first view!")
