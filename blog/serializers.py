from rest_framework import serializers

from blog.models import Post, Comment

#{!!!POSTS!!!}

class PostSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = Post
        fields = ['title', 'content', 'image', 'video']

class PostResponseSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'image', 'video', 'date_posted', 'updated', 'status']
    def get_image(self, obj):
        url = obj.image.url if getattr(obj, 'image', None) else None
        request = self.context.get('request') if hasattr(self, 'context') else None
        return request.build_absolute_uri(url) if (url and request) else url
    def get_video(self, obj):
        url = obj.video.url if getattr(obj, 'video', None) else None
        request = self.context.get('request') if hasattr(self, 'context') else None
        return request.build_absolute_uri(url) if (url and request) else url

class PostGetByTitleSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'image', 'video', 'date_posted', 'updated', 'status']
    def get_image(self, obj):
        url = obj.image.url if getattr(obj, 'image', None) else None
        request = self.context.get('request') if hasattr(self, 'context') else None
        return request.build_absolute_uri(url) if (url and request) else url
    def get_video(self, obj):
        url = obj.video.url if getattr(obj, 'video', None) else None
        request = self.context.get('request') if hasattr(self, 'context') else None
        return request.build_absolute_uri(url) if (url and request) else url

class PostGetByidSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'image', 'video', 'date_posted', 'updated', 'status']
        read_only_fields = ['date_posted', 'updated']
    def get_image(self, obj):
        url = obj.image.url if getattr(obj, 'image', None) else None
        request = self.context.get('request') if hasattr(self, 'context') else None
        return request.build_absolute_uri(url) if (url and request) else url
    def get_video(self, obj):
        url = obj.video.url if getattr(obj, 'video', None) else None
        request = self.context.get('request') if hasattr(self, 'context') else None
        return request.build_absolute_uri(url) if (url and request) else url

class PostUpdatebyidSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'image', 'video', 'date_posted', 'updated', 'status']
        read_only_fields = ['date_posted', 'updated']

class PostUpdatebyTitleSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'image', 'video', 'date_posted', 'updated', 'status']
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
