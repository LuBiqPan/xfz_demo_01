from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views.generic import View
from django.views.decorators.http import require_POST, require_GET
from django.conf import settings

from apps.news.models import NewsCategory
from utils import restful
from .forms import EditNewsCategoryForm

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
    access_key = '8pcP0B14wtgUL1pJg9QHdwJ-c-73Y6FzsbaZ-nPV'
    secret_key = 'clIF6Eflvakr56YT5YivNeZM-JA4r2H49X0PV3lW'

    bucket = 'xfz_demo_01'
    q = qiniu.Auth(access_key, secret_key)
    token = q.upload_token(bucket)

    return restful.result(data={'token': token})
