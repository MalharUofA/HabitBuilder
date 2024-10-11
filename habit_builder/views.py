from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render,redirect
from django.urls import reverse
from datetime import datetime
from .models import *
from django.shortcuts import render, get_object_or_404
from django import forms
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.forms import ClearableFileInput
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from pytz import timezone 

import datetime



from .models import *

class habit_form(forms.ModelForm):
    class Meta:
        model = habits
        fields = ['habit_name', 'time_of_day_to_perform', 'start_date_of_habit', 'repeat', 'countdown', 'goal_value', 'goal_units', 'custom_goal_unit', 'goal_frequency']
        widgets = {
            'time_of_day_to_perform': forms.Select(choices=TIME_OF_DAY_CHOICES, attrs={'class': 'form-control'}),
            'start_date_of_habit': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'countdown': forms.NumberInput(attrs={'class': 'form-control'}),
            'goal_value': forms.NumberInput(attrs={'class': 'form-control'}),
            'goal_units': forms.Select(attrs={'class': 'form-control'}),
            'goal_frequency': forms.Select(attrs={'class': 'form-control'}),
            'custom_goal_unit': forms.TextInput(attrs={'class': 'form-control'}),
        }

class BadHabit_form(forms.ModelForm):
    class Meta:
        model = BadHabit
        fields = ['habit_name','start_date_of_habit'] 
        widgets ={
            'start_date_of_habit': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            
        }

class UserPageForm(forms.ModelForm):
    class Meta:
        model = Page
        fields =['title','category','cover']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter title'}),
            'category': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter category'}),
            'cover': ClearableFileInput(attrs={'class': 'form-control-file'})
        }

# Create your views here.
def login_view(request):
    
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "habit_builder/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request,'habit_builder/login.html')
    
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "habit_builder/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "habit_builder/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "habit_builder/register.html")
    
def index(request):
    user = request.user
    currentTime = datetime.datetime.now()
    edmonton_timezone = timezone('America/Edmonton')
    edmonton_time = datetime.datetime.now(edmonton_timezone)
    if edmonton_time.hour < 12:
        greetings = 'Good Morning, '
    elif 12 <= edmonton_time.hour < 18:
        greetings = 'Good Afternoon, '
    else:
        greetings = "Good Evening, "
    

    if request.method=='POST':
        info = UserPageForm(request.POST, request.FILES)
        if info.is_valid():
            page_info = info.save(commit=False)
            page_info.user = request.user
            page_info.publish_date = datetime.date.today()
            page_info.save()
            return redirect("index")

    else :
        form = UserPageForm()

    user_pages = Page.objects.filter(user=user).order_by('-publish_date')

    return render(request, 'habit_builder/index.html',{
        "user":user,
        "greetings":greetings, 
        'form':form,
        'user_pages': user_pages,
    })


def add_page(request, title, id):
    page = get_object_or_404(Page, id=id)
    if request.method == 'POST':
        form_type = request.POST.get('form_type')
        if form_type == 'good_habit':
            form = habit_form(request.POST, request.FILES)
            if form.is_valid():
                habit_info = form.save(commit=False)
                habit_info.user = request.user

                # Correctly get the Page object
                page = get_object_or_404(Page, id=id)
                habit_info.Page = page

                habit_info.save()
                return redirect('add_page', title=title, id=id)  # Replace 'success_url' with your desired redirect URL
        elif form_type == 'bad_habit':
            bad_habit_form = BadHabit_form(request.POST, request.FILES)
            if bad_habit_form.is_valid():
                habit_info = bad_habit_form.save(commit=False)
                habit_info.user = request.user

                # Correctly get the Page object
                page = get_object_or_404(Page, id=id)
                habit_info.Page = page

                habit_info.save()
                return redirect('add_page', title=title, id=id)
        else:
            print('form errors are these : ', form.errors)
    else:
        habit_id = request.GET.get('edit')
        if habit_id:
            habit_instance = get_object_or_404(habits, id=habit_id)
            form = habit_form(instance=habit_instance)
        else:
            form = habit_form()
        bad_habit_form = BadHabit_form()

    # Retrieve the page object and habits for the template
    page = get_object_or_404(Page, id=id)
    good_habits = habits.objects.filter(Page=page)
    bad_habits = BadHabit.objects.filter(Page=page)
    # Check for habits to reset based on repeat choice
    for habit in good_habits:
        if habit.reset_habit():
            habit.last_completed_date = None
            habit.save()

    is_empty = not good_habits.exists()
    bad_habit_empty_check = not bad_habits.exists()
    # Render the template with context
    todos = ToDoList.objects.filter(page__id=id)
    notes2 = Note2.objects.all().order_by('-created_at')
    notes = Note.objects.all().order_by('-created_at')  # Fetch all notes ordered by creation time
    return render(request, 'habit_builder/add_page.html', {
        'form': form,
        'title': title,
        'id': id,
        'good_habits': good_habits,
        'is_empty': is_empty,
        'bad_habit_form' :bad_habit_form,
        'bad_habit_empty_check': bad_habit_empty_check,
        'bad_habits': bad_habits,
        'notes': notes,
        'notes2': notes2,
        'todos': todos,
        'page': page,
    })

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))

def reset_habit_view(request, habit_id):
    try:
        habit = habits.objects.get(id=habit_id, user=request.user)
        if habit.reset_habit():
            return JsonResponse({'status': 'success', 'message': 'Habit reset!'})
        return JsonResponse({'status': 'no_reset', 'message': 'Habit does not need resetting yet.'})
    except habits.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Habit not found.'})

def get_good_habit_form(request):
    form = habit_form  # Instantiate your form
    return render(request, 'habit.html', {'form': form})


def get_habit(request, habit_id):
    habit_instance = get_object_or_404(habits, id=habit_id)
    data = {
        'habit_name': habit_instance.habit_name,
        'time_of_day_to_perform': habit_instance.time_of_day_to_perform,
        'start_date_of_habit': habit_instance.start_date_of_habit,
        'repeat': habit_instance.repeat,
        'countdown': habit_instance.countdown,
        'goal_value': habit_instance.goal_value,
        'goal_units': habit_instance.goal_units,
        'custom_goal_unit': habit_instance.custom_goal_unit,
        'goal_frequency': habit_instance.goal_frequency,
    }
    return JsonResponse(data)


@csrf_exempt  # Disable CSRF protection for simplicity (make sure to handle CSRF in production)
def save_note(request):
    if request.method == "POST":
        # Get the note content from the POST request
        note_content = request.POST.get('content')
        if note_content:
            # Create and save a new Note object
            note = Note(content=note_content)
            note.save()
            return JsonResponse({'status': 'success', 'message': 'Note saved successfully!'})
        else:
            return JsonResponse({'status': 'error', 'message': 'No content provided!'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method!'})
@csrf_exempt
def save_note2(request):
    if request.method == 'POST':
        content = request.POST.get('content')
        if content:
            note2 = Note2(content=content)
            note2.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Content is empty'})

    
@csrf_exempt
def add_todo_item(request):
    if request.method == 'POST':
        page_id = request.POST.get('page_id')
        task = request.POST.get('task')
        
        print(f'Received Task: {task}, Page ID: {page_id}')  # Debugging output
        
        if task and page_id:
            page = get_object_or_404(Page, id=page_id)
            todo_item = ToDoList(page=page, task=task)
            todo_item.save()
            return JsonResponse({'status': 'success', 'message': 'Task added successfully!'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Task or page ID is missing.'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})
@csrf_exempt
def update_todo_item(request):
    if request.method == 'POST':
        todo_id = request.POST.get('todo_id')
        completed = request.POST.get('completed') == 'true'

        todo_item = get_object_or_404(ToDoList, id=todo_id)
        todo_item.completed = completed
        todo_item.save()
        return JsonResponse({'status': 'success', 'message': 'Task updated successfully!'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})