
from django.shortcuts import render


def payinfo_view(request):
    return render(request, 'payinfo/payinfo.html')
