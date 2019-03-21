
from django import forms
from django.core.cache import cache
from apps.forms import FormMixin
from .models import User


error_dict = {
        'max_length': r"Password shouldn't be longer than 20 characters.",
        'min_length': r"Password shouldn't be shorter than 6 characters."
    }


class LoginForm(forms.Form, FormMixin):

    telephone = forms.CharField(max_length=11)
    password = forms.CharField(max_length=20, min_length=6, error_messages=error_dict)
    remember = forms.IntegerField(required=False)


class RegisterForm(forms.Form, FormMixin):

    telephone = forms.CharField(max_length=11)
    username = forms.CharField(max_length=20)
    password1 = forms.CharField(max_length=20, min_length=6, error_messages=error_dict)
    password2 = forms.CharField(max_length=20, min_length=6, error_messages=error_dict)
    img_captcha = forms.CharField(max_length=4, min_length=4)
    sms_captcha = forms.CharField(max_length=4, min_length=4)

    # Validation.
    def clean(self):
        cleaned_data = super(RegisterForm, self).clean()

        # Validation of password.
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 != password2:
            raise forms.ValidationError('Passwords validation failed.')

        # Validation of image.
        img_captcha = cleaned_data.get('img_captcha')
        cache_img_captcha = cache.get(img_captcha.lower())
        if not cache_img_captcha or cache_img_captcha.lower() != img_captcha.lower():
            raise forms.ValidationError('Image validation failed.')

        # Validation of telephone.
        telephone = cleaned_data.get('telephone')
        sms_captcha = cleaned_data.get('sms_captcha')
        cache_sms_cache = cache.get(telephone)
        if not cache_sms_cache or cache_sms_cache.lower() != sms_captcha.lower():
            raise forms.ValidationError('Message validation failed.')

        # Validate if the telephone number had been registered.
        exists = User.objects.filter(telephone=telephone).exists()
        if exists:
            raise forms.ValidationError('This telephone number has been registered.')
