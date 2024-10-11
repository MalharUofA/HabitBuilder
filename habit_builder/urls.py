from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path("", views.login_view,name='login' ),
    path("register/", views.register, name='register'),
    path("index/",views.index,name="index"),
    path("logout", views.logout_view, name="logout"),
    path('<str:title>-<int:id>',views.add_page,name='add_page'),
    path('get-good-habit-form/', views.get_good_habit_form, name='get_good_habit_form'),
    path('reset_habit/<int:habit_id>/', views.reset_habit_view, name='reset_habit'),
    path('get_habit/<int:habit_id>/', views.get_habit, name='get_habit'),
    path('save-note/', views.save_note, name='save_note'),
    path('save-note2/', views.save_note2, name='save_note2'),
    path('add-todo/', views.add_todo_item, name='add_todo_item'),
    path('update-todo/', views.update_todo_item, name='update_todo_item'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

