from django.shortcuts import render
from django.conf import settings
from django.http import Http404

from .models import *
from .forms import PublicCommentForm
from .serializes import NewsSerializer, CommentSerializer
from utils import restful


def index(request):
    count = settings.ONE_PAGE_NEWS_COUNT
    # newses = News.objects.all()[0:count]
    newses = News.objects.select_related('category', 'author').all()[0:count]
    categories = NewsCategory.objects.all()
    context = {
        'newses': newses,
        'categories': categories
    }

    return render(request, 'news/index.html', context=context)


def news_list(request):
    page = int(request.GET.get('p', 1))
    category_id = int(request.GET.get('category_id', 0))

    start = (page - 1) * settings.ONE_PAGE_NEWS_COUNT
    end = start + settings.ONE_PAGE_NEWS_COUNT

    if category_id == 0:
        newses = News.objects.select_related('category', 'author').all()[start:end]
    else:
        newses = News.objects.filter(category__id=category_id)[start:end]
    serializer = NewsSerializer(newses, many=True)
    data = serializer.data

    return restful.result(data=data)


def news_detail(request, news_id):
    try:
        news = News.objects.select_related('category', 'author').get(pk=news_id)
        context = {
            'news': news
        }
        return render(request, 'news/news_detail.html', context=context)
    except News.DoesNotExist:
        raise Http404


def public_comment(request):
    form = PublicCommentForm(request.POST)
    if form.is_valid():
        news_id = form.cleaned_data.get('news_id')
        content = form.cleaned_data.get('content')

        news = News.objects.get(pk=news_id)
        comment = Comment.objects.create(content=content, news_id=news_id, author=request.user, news=news)
        serializer = CommentSerializer(comment)
        return restful.result(data=serializer.data)
    else:
        return restful.params_error(message=form.get_errors())


def search(request):
    return render(request, 'search/search.html')
