# Generated by Django 3.1.7 on 2021-03-17 09:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0023_farmingdeposit_daily_percent'),
    ]

    operations = [
        migrations.AddField(
            model_name='usdtwithdrawrequest',
            name='erc20',
            field=models.BooleanField(default=True),
        ),
    ]