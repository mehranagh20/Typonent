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
    url(r'^startcompetition/([0-9]*)/$', views.start_competition),
    url(r'^recieveinfo/$', views.my_rank),
    url(r'^scoreboard/([0-9]*)/$', views.scoreboard),
    url(r'^activeaccount/', views.activate_acount),
    url(r'^generatehash/$', views.generate_hash),


]