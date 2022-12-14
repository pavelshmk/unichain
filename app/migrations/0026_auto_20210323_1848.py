# Generated by Django 3.1.7 on 2021-03-23 15:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0025_usdtwithdrawrequest_withdraw_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='farmingdeposit',
            name='is_destroyed',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AlterField(
            model_name='farmingdeposit',
            name='finish',
            field=models.DateTimeField(db_index=True),
        ),
        migrations.AlterField(
            model_name='farmingdeposit',
            name='is_finished',
            field=models.BooleanField(db_index=True, default=False),
        ),
    ]
