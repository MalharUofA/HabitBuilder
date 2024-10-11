from django.db import models
from django.contrib.auth.models import AbstractUser
# from pytz import timezone 
import uuid
from django.utils import timezone as models_timezone
import random
import string
# Define choices for the 'units' field
UNIT_CHOICES = [
    ('mins', 'Minutes'),
    ('times', 'Times'),
    ('other', 'Any other unit'),
]

# Define choices for the 'frequency' field
FREQUENCY_CHOICES = [
    ('daily', 'Per Day'),
    ('weekly', 'Per Week'),
    ('monthly', 'Per Month'),
]

# Define choices for the 'habit_type' field
HABIT_TYPE_CHOICES = [
    ('good', 'Build Good Habit'),
    ('bad', 'Break Bad Habit'),
]

# Create your models here.
class User(AbstractUser):
    pass


#model to make and store new page 

# Choices for the repeat field
REPEAT_CHOICES = [
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
    ('monthly', 'Monthly'),
]

TIME_OF_DAY_CHOICES = [
    ('anytime', 'Anytime'),
    ('morning', 'Morning'),
    ('afternoon', 'Afternoon'),
    ('evening', 'Evening'),
]



class Page(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    cover = models.ImageField(upload_to='cover_images/',blank=True,null=True)
    publish_date = models.DateField(blank=True,null=True)


    def __str__(self):
        return f'{self.title} on {self.publish_date}'
    
class habits(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    Page = models.ForeignKey('Page', on_delete=models.CASCADE)
    habit_name = models.CharField(max_length=100)
    time_of_day_to_perform = models.CharField(max_length=10, choices=TIME_OF_DAY_CHOICES, default='anytime')
    start_date_of_habit = models.DateField()
    repeat = models.CharField(max_length=20, choices=REPEAT_CHOICES, default='daily')
    # interval_days = models.PositiveIntegerField(null=True, blank=True, default=2)  # Added field for custom intervals
    countdown = models.IntegerField(default=21)
    goal_value = models.IntegerField(default=0)
    goal_units = models.CharField(max_length=10, choices=UNIT_CHOICES, default='mins', blank=True, null=True)
    goal_frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    custom_goal_unit = models.CharField(max_length=50, blank=True, null=True)
    last_completed_date = models.DateField(null=True, blank=True)
    
    def reset_habit(self):
        """Reset the habit based on the repeat choice and check if it's time to re-add it to the list."""
        today = models_timezone.now().date()
        should_reset = False

        if self.repeat == 'daily':
            if not self.last_completed_date or today > self.last_completed_date:
                should_reset = True

        elif self.repeat == 'weekly':
            if not self.last_completed_date or (today - self.last_completed_date).days >= 7:
                should_reset = True

        elif self.repeat == 'monthly':
            if not self.last_completed_date or (today - self.last_completed_date).days >= 30:
                should_reset = True

        if should_reset:
            self.last_completed_date = today  # Reset the last completed date
            self.save()
            return True
        return False

    def __str__(self):
        return self.habit_name


class BadHabit(models.Model):
    # Generate a random alphanumeric string of length 10
    def generate_unique_id():
        return ''.join(random.choices(string.ascii_letters + string.digits, k=10))

    # Use CharField for primary key, not integer
    id = models.CharField(primary_key=True, max_length=10, default=generate_unique_id, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    Page = models.ForeignKey('Page', on_delete=models.CASCADE)
    habit_name = models.CharField(max_length=100)
    start_date_of_habit = models.DateField()
    succeed = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.habit_name} - {self.id}'
    
class Note(models.Model):
    content = models.TextField()  # Field to store the note content
    created_at = models.DateTimeField(auto_now_add=True)  # Field to store when the note was created

    def __str__(self):
        return f"Note created on {self.created_at}"
class Note2(models.Model):
    content = models.TextField()  # Field to store the note content
    created_at = models.DateTimeField(auto_now_add=True)  # Field to store when the note was created

    def __str__(self):
        return f"Note created on {self.created_at}"

class ToDoList(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE)  # Link to the specific habit page
    task = models.CharField(max_length=200)  # Task description
    completed = models.BooleanField(default=False)  # Whether the task is completed
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the task was created

    def __str__(self):
        return f'Task: {self.task} - Completed: {self.completed}'

