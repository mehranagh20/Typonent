from django.conf.urls import url
from type import views

urlpatterns = [
    url(r'^register/$', views.register),
    url(r'^login/$', views.userlogin),
    url(r'^logout/$', views.userlogout),
    url(r'^ping/([0-9]+)/$', views.ping),
    url(r'^upcomingComps/([0-9]+)', views.upcoming_competition_list),
    url(r'^pastComps/([0-9]+)', views.past_competition_list),
    url(r'^getdate/$', views.cur_date),
    url(r'^registerComp/([0-9]+)$', views.register_competition),
    url(r'^getcompetition/([0-9]*)/$', views.get_competition),


]