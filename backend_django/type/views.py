from django.http import HttpResponse, JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt, csrf_protect, requires_csrf_token, ensure_csrf_cookie
from type.models import User, Competition, Requirement, Involvement, Text
from type.serializers import UserSerializer, CompetitionSerializer
from django.contrib.auth import authenticate, login, logout
from django.middleware import csrf
import json
from django.utils import timezone
import datetime
from datetime import timedelta


def register(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        user = UserSerializer(data=data)
        if user.is_valid():
            user.save()
            data = user.data
            data['status'] = 200
            return JsonResponse(data)
        else:
            data = user.errors
            data['status'] = 406
            return JsonResponse(data)

    return JsonResponse({'status': 400})


@ensure_csrf_cookie
def userlogin(request):
    print(request.META)
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email, password = data['email'], data['password']
        if email and password:

            user = authenticate(email=email, password=password)

            if user is not None:
                print(request.user.is_authenticated)
                login(request, user)
                print(request.user.is_authenticated)
                data = UserSerializer(user).data
                data['status'] = 200
                return JsonResponse(data)

            return JsonResponse({'status': 401, 'message': 'wrong email/password'})

        return JsonResponse({'status': 400, 'message': 'provide email/password'})

    return JsonResponse({'status': 400, 'message': 'bad request'})


def userlogout(request):
    s = UserSerializer(request.user)
    print(s.data)
    print(request.user.is_authenticated)
    if request.user.is_authenticated:
        logout(request)
        return JsonResponse({'status': 200})
    return JsonResponse({'status': 400, 'message': 'you are not logged in!!'})


@ensure_csrf_cookie
def ping(request, val):
    if request.session.test_cookie_worked():
        print('accepts cookie')
    request.session.set_test_cookie()
    return HttpResponse(val)


def cur_date(request):
    time = timezone.now()
    return JsonResponse({'date': str(time)})


def upcoming_competition_list(request, nums):
    nums = int(nums)
    comps = Competition.objects.filter(start_time__gt=timezone.now())
    comps = sorted(comps, key=lambda k: k.start_time)

    need = comps[nums:nums + 10]
    all = {'list': [CompetitionSerializer(cmp).data for cmp in need]}

    for i in range(len(need)):
        try:
            need[i].competitors.get(user=request.user)
            all['list'][i]['registered'] = 1
            print(all['list'][i])
        except:
            all['list'][i]['registered'] = 0

    all['numbers'] = len(all['list'])
    return JsonResponse(all)


def past_competition_list(request, nums):
    nums = int(nums)
    comps = Competition.objects.filter(start_time__lte=timezone.now())
    comps = sorted(comps, key=lambda k: k.start_time)

    all = {'list': [CompetitionSerializer(cmp).data for cmp in comps[nums:nums + 10]]}
    all['numbers'] = len(all['list'])
    return JsonResponse(all)


def register_competition(request, id):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 401, 'message': 'log in to register!'}) # unauthorized

    try:
        competition = Competition.objects.get(id=id)
    except:
        return JsonResponse({'status': 400, 'message': 'no competition with your information found!'}) # bad request

    if competition.max_competitors != -1 and competition.max_competitors <= competition.competitors.all().count():
        return JsonResponse({'status': 400, 'message': 'this competition is full!'})

    if competition.start_time <= timezone.now():
        return JsonResponse({'status': 400, 'message': 'this competition has ended!'}) # bad request

    user = request.user
    requirements = competition.requirements.all()
    for req in requirements:
        try:
            # user can only register in competitions that requirements for that competition are met by user
            # so the requirements must have finished and passed by 3 minutes so that the result is clear.
            time_to_finish = req.required_competition.start_time + timedelta(seconds=req.required_competition.duration + 3 * 60)

            inv = req.required_competition.competitors.get(user=user)
            if inv.rank > req.min_rank or timezone.now() <= time_to_finish:
                return JsonResponse({'status': 403, 'message': 'you do meet the requirements for this competition'}) # forbidden
        except:
            return JsonResponse(
                {'status': 403, 'message': 'you do meet the requirements for this competition'})  # forbidden

    if competition.competitors.filter(user=user):
        return JsonResponse({'status': 400, 'message': 'you are already registered in this competition!'})

    # user can register in this competition
    competition.competitors.create(user=user, rank=0)

    return JsonResponse({'status': 200, 'message': 'registered!'})


def get_competition(request, id):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 401, 'message': 'Unauthorized'})

    try:
        competition = Competition.objects.get(id=id)

        now = timezone.now()
        if competition.start_time < now:
            return JsonResponse({'status': 400, 'message': 'competition has started or finished!'})

        try:
            competition.competitors.get(user=request.user)
            data = CompetitionSerializer(competition).data
            data['status'] = 200
            return JsonResponse(data)

        except:
            return JsonResponse({'status': 400, 'message': 'your are not registered in this competition!'})

    except:
        return JsonResponse({'status': 400, 'message': 'no competition with information provided!'})
