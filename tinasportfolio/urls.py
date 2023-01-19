from django.contrib import admin
from django.urls import path
from myapp import views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home_view, name='home'),
    # path('secretblog/', views.secretblog_view, name='secretblog'),
]

urlpatterns += staticfiles_urlpatterns()