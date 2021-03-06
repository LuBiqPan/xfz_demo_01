
from apps.forms import FormMixin
from apps.news.models import News, Banner
from apps.course.models import Course
from django import forms


class EditNewsCategoryForm(forms.Form):
    pk = forms.IntegerField(error_messages={'require': 'id is required.'})
    name = forms.CharField(max_length=100)


class WriteNewsForm(forms.ModelForm, FormMixin):
    category = forms.IntegerField()

    class Meta:
        model = News
        exclude = ['category', 'author', 'pub_date']


class EditNewsForm(forms.ModelForm, FormMixin):
    category = forms.IntegerField()
    pk = forms.IntegerField()
    
    class Meta:
        model = News
        exclude = ['category', 'author', 'pub_date']


class AddBannerForm(forms.ModelForm, FormMixin):

    class Meta:
        model = Banner
        fields = ('priority', 'link_to', 'image_url')


class EditBannerForm(forms.ModelForm, FormMixin):
    pk = forms.IntegerField()

    class Meta:
        model = Banner
        fields = ('priority', 'link_to', 'image_url')


class PubCourseForm(forms.ModelForm, FormMixin):
    category_id = forms.IntegerField()
    teacher_id = forms.IntegerField()

    class Meta:
        model = Course
        exclude = ('category', 'teacher')
