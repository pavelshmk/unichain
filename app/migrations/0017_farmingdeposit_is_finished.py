# Generated by Django 3.1.5 on 2021-03-15 17:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0016_farmingdeposit'),
    ]

    operations = [
        migrations.AddField(
            model_name='farmingdeposit',
            name='is_finished',
            field=models.BooleanField(default=False),
        ),
    ]
