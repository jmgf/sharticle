from django.shortcuts import render

from django.http import HttpResponse



# =============================================================================
# Register view ===============================================================
# =============================================================================

def register(request):
    return render(request, 'articles/register.html')
