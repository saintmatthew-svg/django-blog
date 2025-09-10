from rest_framework import serializers

from blog.models import Post, Comment

#{!!!POSTS!!!}

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['title', 'content']

class PostResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'date_posted', 'updated', 'status']

class PostGetByTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'date_posted', 'updated', 'status']

class PostGetByidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'date_posted', 'updated', 'status']
        read_only_fields = ['date_posted', 'updated']

class PostUpdatebyidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'date_posted', 'updated', 'status']
        read_only_fields = ['date_posted', 'updated']

class PostUpdatebyTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'date_posted', 'updated', 'status']
        read_only_fields = ['date_posted', 'updated']

#{!!!COMMENTS!!!}

class CommentSerializer(serializers.ModelSerializer):
    post = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'post', 'comment', 'date_posted', 'updated', 'status']
        read_only_fields = ['id', 'date_posted', 'updated', 'post']

    def validate_comment(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Comment cannot be empty.")
        return value


class DeleteComentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'comment', 'date_posted', 'updated', 'status']
        read_only_fields = ['comment','date_posted', 'updated']