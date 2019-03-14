
from django import forms
from apps.forms import FormMixin


class LoginForm(forms.Form, FormMixin):
    error_dict = {
        'max_length': r"Password shouldn't be longer than 20 characters.",
        'min_length': r"Password shouldn't be shorter than 6 characters."
    }

    telephone = forms.CharField(max_length=11)
    password = forms.CharField(max_length=20, min_length=6, error_messages=error_dict)
    remember = forms.IntegerField(required=False)

