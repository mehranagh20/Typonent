# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2017-03-28 09:46
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('type', '0012_auto_20170328_0702'),
    ]

    operations = [
        migrations.RenameField(
            model_name='involvement',
            old_name='started_conpetition',
            new_name='started_competition',
        ),
    ]
