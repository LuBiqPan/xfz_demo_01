
from io import BytesIO

from django.contrib.auth import login, logout, authenticate, get_user_model
from django.views.decorators.http import require_POST
from django.shortcuts import redirect, reverse
from django.http import HttpResponse
from django.core.cache import cache

from .forms import LoginForm, RegisterForm
from utils import restful
from utils.captcha.xfzcaptcha import Captcha
# from utils.aliyunsdk import aliyunsms
from utils import smssender


User = get_user_model()


@require_POST
def login_view(request):

    form = LoginForm(request.POST)

    if form.is_valid():
        # Receive fields from forms.
        telephone = form.cleaned_data.get('telephone')
        password = form.cleaned_data.get('password')
        remember = form.cleaned_data.get('remember')

        # Create a user.
        user = authenticate(request, username=telephone, password=password)
        # Authenticate successfully.
        if user:
            # User is not added to black list.
            if user.is_active:
                login(request, user)

                # If choose remember, cookies will be store for max period of time.
                if remember:
                    request.session.set_expiry(None)
                # Otherwise, cookies will expire immediately when browser is closed.
                else:
                    request.session.set_expiry(0)
                # Return json
                return restful.ok()
            else:
                return restful.unauth(message='Account frozen.')
        else:
            return restful.params_error(message='Username or password invalid.')
    else:
        errors = form.get_errors()
        return restful.params_error(message=errors)


def logout_view(request):

    logout(request)
    return redirect(reverse('index'))


@require_POST
def register_view(request):

    form = RegisterForm(request.POST)

    # Validation success.
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password1')
        # Create user and save to database.
        user = User.objects.create_user(telephone=telephone, username=username, password=password)
        # Login after creating user.
        login(request, user)
        return restful.ok()
    # Validation fail.
    else:
        return restful.params_error(message=form.get_errors())


def img_captcha(request):

    text, image = Captcha.gene_code()
    # BytesIO：相当于一个管道，用来存储图片的流数据
    out = BytesIO()
    # 调用image的save方法，将这个image对象保存到BytesIO中
    image.save(out, 'png')
    # 将BytesIO的文件指针移动到最开始的位置
    out.seek(0)

    response = HttpResponse(content_type='image/png')
    # 从BytesIO的管道中，读取出图片数据，保存到response对象上
    response.write(out.read())
    response['Content-length'] = out.tell()

    cache.set(text.lower(), text.lower(), 5*60)  # Expire: 5*60 seconds.

    return response


def sms_captcha(request):

    telephone = request.GET.get('telephone')
    code = Captcha.gene_text()
    cache.set(telephone, code, 5*60)    # Expire: 5*60 seconds.
    # result = aliyunsms.send_sms(telephone, code)
    print(code)
    result = smssender.send(telephone, code)
    if result:
        return restful.ok()
    else:
        return result.params_error(message="短信验证码发送失败！")


def cache_test(request):

    cache.set('username', 'zhiliao', 60)
    result = cache.get('username')
    print(result)
    return HttpResponse('success')

