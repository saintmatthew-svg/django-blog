from django.urls import path
from .import views

urlpatterns = [
    path('create/', views.add_post, name='add_Post'),
    path('get/', views.get_all_post, name='get_All_Post'),
    path('getbytitle/<str:title>/', views.get_post_by_title, name='get_Post_By_Title'),
    path('getbyid/<int:id>/', views.get_post_by_id, name='get_Post_By_Id'),
    path('update/<int:id>/', views.update_post, name='update_Post'),
]