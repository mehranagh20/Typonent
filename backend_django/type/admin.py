from django.contrib import admin
from type.models import User, Requirement, Text, Involvement, Competition

# Register your models here.

admin.site.register([User, Text, Involvement, Competition, Requirement])