# Generated by Django 5.0.6 on 2024-09-02 18:42

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("habit_builder", "0011_habits_interval_days_habits_last_completed_date"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="habits",
            name="interval_days",
        ),
        migrations.AlterField(
            model_name="habits",
            name="repeat",
            field=models.CharField(
                choices=[
                    ("daily", "Daily"),
                    ("weekly", "Weekly"),
                    ("monthly", "Monthly"),
                ],
                default="daily",
                max_length=20,
            ),
        ),
    ]
