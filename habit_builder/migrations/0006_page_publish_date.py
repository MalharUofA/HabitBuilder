# Generated by Django 5.0.6 on 2024-08-29 01:01

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        (
            "habit_builder",
            "0005_remove_page_countdown_remove_page_goal_frequency_and_more",
        ),
    ]

    operations = [
        migrations.AddField(
            model_name="page",
            name="publish_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
