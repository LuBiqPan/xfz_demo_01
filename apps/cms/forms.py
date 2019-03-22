
# from apps.form import FormMixIn
from django import forms


class EditNewsCategoryForm(forms.Form):
    pk = forms.IntegerField(error_messages={'require': 'id is required.'})
    name = forms.CharField(max_length=100)
