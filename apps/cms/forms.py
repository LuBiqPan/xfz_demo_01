
from apps.forms import FormMixin
from apps.news.models import News
from django import forms


class EditNewsCategoryForm(forms.Form):
    pk = forms.IntegerField(error_messages={'require': 'id is required.'})
    name = forms.CharField(max_length=100)


class WriteNewsForm(forms.ModelForm, FormMixin):
    category = forms.IntegerField()

    class Meta:
        model = News
        exclude = ['category', 'author', 'pub_date']
