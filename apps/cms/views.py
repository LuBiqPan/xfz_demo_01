from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views.generic import View
from django.views.decorators.http import require_POST, require_GET
from django.conf import settings

from apps.news.models import NewsCategory, News, Banner
from utils import restful
from .forms import EditNewsCategoryForm, WriteNewsForm, AddBannerForm, EditBannerForm
from apps.news.serializes import BannerSerializer

import os
import qiniu


@staff_member_required(login_url='index')
def index(request):

    return render(request, 'cms/index.html')


class WriteNewsView(View):

    def get(self, request):
        categories = NewsCategory.objects.all()
        context = {
            'categories': categories
        }
        return render(request, 'cms/write_news.html', context=context)

    def post(self, request):
        form = WriteNewsForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            thumbnail = form.cleaned_data.get('thumbnail')
            content = form.cleaned_data.get('content')
            category_id = form.cleaned_data.get('category')
            category = NewsCategory.objects.get(pk=category_id)
            # Create news.
            News.objects.create(title=title, desc=desc, thumbnail=thumbnail,
                                content=content, category=category, author=request.user)
            return restful.ok()
        else:
            return restful.params_error(message=form.get_errors())


@require_GET
def news_category(request):

    categories = NewsCategory.objects.all()
    context = {
        'categories': categories
    }
    return render(request, 'cms/news_category.html', context=context)


@require_POST
def add_news_category(request):

    name = request.POST.get('name')
    exists = NewsCategory.objects.filter(name=name).exists()
    if not exists:
        NewsCategory.objects.create(name=name)
        return restful.ok()
    else:
        return restful.params_error(message='Category already exists.')


@require_POST
def edit_news_category(request):

    form = EditNewsCategoryForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        name = form.cleaned_data.get('name')
        try:
            NewsCategory.objects.filter(pk=pk).update(name=name)
            return restful.ok()
        except:
            return restful.params_error(message='News category does not exist.')
    else:
        return restful.params_error(message=form.get_error())


@require_POST
def delete_news_category(request):
    pk = request.POST.get('pk')
    try:
        NewsCategory.objects.filter(pk=pk).delete()
        return restful.ok()
    except:
        return restful.params_error(message='News category does not exist.')


def banners(request):
    return render(request, 'cms/banners.html')


def banner_list(request):
    banner = Banner.objects.all()
    serializer = BannerSerializer(banner, many=True)
    return restful.result(data=serializer.data)


def add_banner(request):
    form = AddBannerForm(request.POST)
    if form.is_valid():
        priority = form.cleaned_data.get('priority')
        image_url = form.cleaned_data.get('image_url')
        link_to = form.cleaned_data.get('link_to')
        banner = Banner.objects.create(priority=priority, image_url=image_url, link_to=link_to)
        data = {
            "banner_id": banner.pk,
            "priority": banner.priority
        }
        return restful.result(data=data)
    else:
        return restful.params_error(message=form.get_errors())


def delete_banner(request):
    banner_id = request.POST.get('banner_id')
    Banner.objects.filter(pk=banner_id).delete()
    return restful.ok()


def edit_banner(request):
    form = EditBannerForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        priority = form.cleaned_data.get('priority')
        link_to = form.cleaned_data.get('link_to')
        image_url = form.cleaned_data.get('image_url')
        Banner.objects.filter(pk=pk).update(priority=priority, link_to=link_to, image_url=image_url)
        return restful.ok()
    else:
        return restful.params_error(message=form.get_errors())


@require_POST
def upload_file(request):
    file = request.FILES.get('file')
    name = file.name
    # Write thumbnail to media file.
    with open(os.path.join(settings.MEDIA_ROOT, name), 'wb') as fp:
        for chunk in file.chunks():
            fp.write(chunk)
    # Create url and return to front.
    url = request.build_absolute_uri(settings.MEDIA_URL+name)
    return restful.result(data={'url': url})


@require_GET
def qntoken(request):
    access_key = settings.QINIU_ACCESS_KEY
    secret_key = settings.QINIU_SECRET_KEY

    bucket = settings.QINIU_BUCKET_NAME
    q = qiniu.Auth(access_key, secret_key)
    token = q.upload_token(bucket)

    return restful.result(data={'token': token})
