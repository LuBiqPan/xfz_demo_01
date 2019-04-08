
from django.shortcuts import render
from django.contrib.auth.decorators import permission_required
from django.views.generic import View
from django.utils.decorators import method_decorator

from apps.course.models import *
from .forms import *
from utils import restful


# def pub_course(request):
#     return render(request, 'cms/pub_course.html')


# @method_decorator(permission_required(perm="course.change_course", login_url='/'), name='dispatch')
class PubCourse(View):
    def get(self, request):
        context = {
            'categories': CourseCategory.objects.all(),
            'teachers': Teacher.objects.all()
        }
        return render(request, 'cms/pub_course.html', context=context)

    def post(self, request):
        form = PubCourseForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            category_id = form.cleaned_data.get('category_id')
            video_url = form.cleaned_data.get('video_url')
            cover_url = form.cleaned_data.get('cover_url')
            price = form.cleaned_data.get('price')
            duration = form.cleaned_data.get('duration')
            profile = form.cleaned_data.get('profile')
            teacher_id = form.cleaned_data.get('teacher_id')

            category = CourseCategory.objects.get(pk=category_id)
            teacher = Teacher.objects.get(pk=teacher_id)

            Course.objects.create(title=title, category=category, video_url=video_url, cover_url=cover_url,
                                  price=price, duration=duration, profile=profile, teacher=teacher)
            return restful.ok()
        else:
            return restful.params_error(message=form.get_errors())
