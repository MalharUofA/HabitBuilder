# Generated by Django 5.0.6 on 2024-09-06 05:10

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("habit_builder", "0013_remove_habits_last_completed_date_habits_completed"),
    ]

    operations = [
        migrations.AddField(
            model_name="habits",
            name="last_completed_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
