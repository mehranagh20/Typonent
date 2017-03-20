from django.conf.urls import url
from type import views

urlpatterns = [
    url(r'^register/$', views.register),
    url(r'^login/$', views.userlogin),
    url(r'^logout/$', views.userlogout),
    url(r'^ping/([0-9]+)/$', views.ping)
]