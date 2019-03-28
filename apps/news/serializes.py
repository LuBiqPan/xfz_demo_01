
from rest_framework import serializers
from .models import News, NewsCategory, Comment, Banner
from apps.xfzauth.serializes import UserSerializer


class NewsCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = NewsCategory
        fields = ('id', 'name')


class NewsSerializer(serializers.ModelSerializer):
    category = NewsCategorySerializer()
    author = UserSerializer()

    class Meta:
        model = News
        fields = ('id', 'title', 'desc', 'thumbnail', 'pub_date', 'category', 'author')


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer()

    class Meta:
        model = Comment
        fields = ('id', 'content', 'author', 'pub_time')


class BannerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Banner
        fields = ('id', 'priority', 'image_url', 'link_to')
