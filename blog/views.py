from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import PostSerializer, PostResponseSerializer, PostGetByTitleSerializer, PostGetByidSerializer, \
    PostUpdatebyidSerializer, PostUpdatebyTitleSerializer, CommentSerializer
from .models import Post

#{!!!POSTS!!!}

@api_view(['POST'])
def add_post(request):
    serializer = PostSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    title = serializer.validated_data['title']
    content = serializer.validated_data['content']
    serializer.save()

    Post.objects.create(
        title=title,
        content=content
    )
    return Response({"message": "post added successfully"}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_all_post(request):
    posts = Post.objects.all()
    serializer = PostResponseSerializer(posts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_post_by_title(request, title):
    title = (title or "").strip()
    if not title:
        return Response(
            {"error": "Title parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    posts = Post.objects.filter(title=title)
    if not posts.exists():
        return Response(
            {"error": f"No posts found with title '{title}'"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = PostGetByTitleSerializer(posts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_post_by_id(request, id):
    post = get_object_or_404(Post, id=id)
    serializer = PostGetByidSerializer(post)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
def update_post_by_id(request, id):
    post = get_object_or_404(Post.objects, pk=id)
    is_partial = request.method == 'PATCH'
    serializer = PostUpdatebyidSerializer(post, data=request.data, partial=is_partial)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_post_by_title(request, title):
    title = (title or "").strip()
    if not title:
        return Response(
            {"error": "Title parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not Post.objects.filter(title=title).exists():
        return Response(
            {"error": f"No posts found with title '{title}'"},
            status=status.HTTP_404_NOT_FOUND
        )

    post = get_object_or_404(Post, title=title)
    serializer = PostUpdatebyTitleSerializer(post, data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_post(request, id):
    post = get_object_or_404(Post, id=id)
    post.delete()
    return Response({"message": "deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['DELETE'])
def delete_post_by_title(request, title):
    post = get_object_or_404(Post, title=title)
    post.delete()
    return Response({"message": "deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

#{!!!COMMENTS!!!}

@api_view(['POST'])
def add_comment(request, id, comment=None):
    post = get_object_or_404(Post, id=id)
    request_data = request.data or {}
    comment_text = request_data.get("comment", comment)

    if not comment_text:
        return Response({"error": "comment is required"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CommentSerializer(data={"comment": comment_text})
    serializer.is_valid(raise_exception=True)
    serializer.save(post=post)
    return Response({"message": "comment added successfully"}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_comments(request, id):
    post = get_object_or_404(Post, id=id)
    comments = post.comments.all()
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)