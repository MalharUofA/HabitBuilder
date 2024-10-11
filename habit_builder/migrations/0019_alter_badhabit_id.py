# Generated by Django 5.0.6 on 2024-09-15 03:29

import habit_builder.models
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("habit_builder", "0018_alter_badhabit_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="badhabit",
            name="id",
            field=models.CharField(
                default=habit_builder.models.BadHabit.generate_unique_id,
                editable=False,
                max_length=10,
                primary_key=True,
                serialize=False,
            ),
        ),
    ]
