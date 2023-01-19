from django.shortcuts import render

def home_view(request):
    return render(request, 'index.html', {})

# def secretblog_view(request):
#     return render(request, 'secretblog.html', {})