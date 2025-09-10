from django.urls import path
from .import views

urlpatterns = [

    #{!!!POSTS!!!}

    path('create/', views.add_post, name='add_Post'),
    path('get/', views.get_all_post, name='get_All_Post'),
    path('getbytitle/<str:title>/', views.get_post_by_title, name='get_Post_By_Title'),
    path('getbyid/<int:id>/', views.get_post_by_id, name='get_Post_By_Id'),
    path('updatebyid/<int:id>/', views.update_post_by_id, name='update_Post_By_Id'),
    path('updatebytitle/<str:title>/', views.update_post_by_title, name='update_Post_By_Title'),
    path('delete/<int:id>/', views.delete_post, name='delete_Post'),
    path('deletebytitle/<str:title>/', views.delete_post_by_title, name='delete_Post_By_Title'),

    #{!!!COMMENTS!!!}

    path('comment/<int:id>/', views.add_comment, name='add_Comment'),
    path('getcomments/<int:id>/', views.get_comments, name='get_All_Comments'),
    path('deletecomment/<int:post_id>/<int:comment_id>/', views.delete_comment, name='delete_Comment'),
]