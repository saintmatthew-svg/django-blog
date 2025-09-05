from django.urls import path
from .import views

urlpatterns = [
    path('create/', views.add_post, name='add_Post'),
    path('get/', views.get_all_post, name='get_All_Post'),
    path('getbytitle/<str:title>/', views.get_post_by_title, name='get_Post_By_Title'),
    path('getbyid/<int:id>/', views.get_post_by_id, name='get_Post_By_Id'),
    path('updatebyid/<int:id>/', views.update_post_by_id, name='update_Post_By_Id'),
    path('updatebytitle/<str:title>/', views.update_post_by_title, name='update_Post_By_Title'),
    path('delete/<int:id>/', views.delete_post, name='delete_Post'),
]