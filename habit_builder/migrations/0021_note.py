# Generated by Django 5.0.6 on 2024-09-15 22:42

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("habit_builder", "0020_alter_badhabit_id"),
    ]

    operations = [
        migrations.CreateModel(
            name="Note",
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
                ("content", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
