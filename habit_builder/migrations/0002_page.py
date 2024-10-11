# Generated by Django 5.0.6 on 2024-08-27 06:21

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("habit_builder", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Page",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=100)),
                ("category", models.CharField(max_length=100)),
                ("goal", models.TextField()),
                ("time_of_day", models.TimeField()),
                ("start_date", models.DateField()),
                (
                    "repeat",
                    models.CharField(
                        choices=[
                            ("daily", "Daily"),
                            ("weekly", "Weekly"),
                            ("monthly", "Monthly"),
                            ("interval", "Interval"),
                        ],
                        default="daily",
                        max_length=20,
                    ),
                ),
                ("reminders", models.TextField(blank=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
