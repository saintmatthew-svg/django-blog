from django.urls import path
from .import views

urlpatterns = [
    path('create/', views.add_Post, name='add_Post'),
    path('get/', views.get_All_Post, name='get_All_Post'),
    path('getbytitle/<str:title>/', views.get_Post_By_Title, name='get_Post_By_Title'),
    path('getbyid/<int:id>/', views.get_Post_By_id, name='get_Post_By_Id'),
    path('update/<int:id>/', views.update_post, name='update_Post'),
]