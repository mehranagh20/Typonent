from django.http import HttpResponse, JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt, csrf_protect, requires_csrf_token, ensure_csrf_cookie
from type.models import User, Competition, Requirement, Involvement, Text
from type.serializers import UserSerializer, CompetitionSerializer, InvolvementSerializer
from django.contrib.auth import authenticate, login, logout
from django.middleware import csrf
from random import randint
import json
from django.utils import timezone
import datetime
from datetime import timedelta
from bisect import bisect_left
from django.core.mail import EmailMessage
from django.utils.crypto import get_random_string


LINK_TO_SITE = "localhost:4200/"


def send_email(subject, body, email):
    '''
    used to send email confirmation link
    improve it with process, it takes some time to be finished when user is registering.
    '''
    email = EmailMessage(subject, body, to=[email])
    try:
        email.send()
        return True
    except:
        print("problem with email settings")
        return False


def user_activation(user):
    '''
    used to generate a random string of length 32 as token of email confirmation.
    change LINK_TO_SITE to your web site domain for real usage.
    '''
    hash = get_random_string(length=32)
    if send_email('Confirmation Link Typing Site', LINK_TO_SITE + 'emailactivation/' + str(user.id) + '/' + str(hash), user.email):
        user.hash = hash
        print(hash)
        return "confirmation link is sent"
    else:
        return "problem sending confirmation link"


def register(request):
    '''
    used for registering new user, this is where email confirmation link is generated and send to user.
    '''
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        user = UserSerializer(data=data)
        if user.is_valid():
            u = user.save()
            u.is_active = False
            u.save()
            user_activation(u)
            u.save()
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
    '''
    used for logging users in
    '''
    print(request.META)
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        email, password = data['email'], data['password']
        if email and password:

            user = authenticate(email=email, password=password)

            if user is not None:
                if not user.is_active:
                    return JsonResponse({'status': 400, 'message': 'Go To You Email And Click On Confirmation Link.'})

                login(request, user)
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
    '''
    Simple Ping View
    '''
    request.session.set_test_cookie()
    return HttpResponse(val)


def cur_date(request):
    '''
    used to return current UTC time to web site for precise calculation of time base on server time.
    '''
    time = timezone.now()
    return JsonResponse({'date': str(time)})


def upcoming_competition_list(request, nums):
    '''
    used to send list of not yet started competitions.
    nums parameter specify that from which index of competitions list should we send competition info, up to 10 competition will be sent
    '''
    nums = int(nums)
    comps = Competition.objects.filter(competition_close_time__gt=timezone.now())
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
    '''
    just like upcoming competitions but for is for past ones.
    '''
    nums = int(nums)
    comps = Competition.objects.filter(competition_close_time__lte=timezone.now())
    comps = sorted(comps, key=lambda k: k.start_time)

    all = {'list': [CompetitionSerializer(cmp).data for cmp in comps[nums:nums + 10]]}
    all['numbers'] = len(all['list'])
    return JsonResponse(all)


def register_competition(request, id):
    '''
    used to register the requested user to competition with id of id.
    user will be registered in competitions with valid date if the user passes all the requirements of competition.
    '''
    if not request.user.is_authenticated:
        return JsonResponse({'status': 401, 'message': 'log in to register!'}) # unauthorized

    try:
        competition = Competition.objects.get(id=id)
    except:
        return JsonResponse({'status': 400, 'message': 'no competition with your information found!'}) # bad request

    if competition.max_competitors != -1 and competition.max_competitors <= competition.competitors.all().count():
        return JsonResponse({'status': 400, 'message': 'this competition is full!'})

    if competition.registration_time > timezone.now():
        return JsonResponse({'status': 400, 'message': 'registration has not started yet'})

    if competition.registration_close_time <= timezone.now():
        return JsonResponse({'status': 400, 'message': 'registration is closed!'})

    user = request.user
    requirements = competition.requirements.all()
    for req in requirements:
        try:
            # user can only register in competitions that requirements for that competition are met by user
            # so the requirements must have finished and passed by 3 minutes so that the result is clear.

            inv = req.required_competition.competitors.get(user=user)
            if not inv.started_competition or inv.rank > req.min_rank:
                return JsonResponse({'status': 403, 'message': 'you do meet the requirements for this competition'}) # forbidden
            if not inv.finished_competition:
                return JsonResponse({'status': 403,
                                     'message': 'you did not finish some required competitions properly to the end'})
        except:
            return JsonResponse(
                {'status': 403, 'message': 'you do meet the requirements for this competition'})  # forbidden

    if competition.competitors.filter(user=user):
        return JsonResponse({'status': 400, 'message': 'you are already registered in this competition!'})

    # user can register in this competition
    competition.competitors.create(user=user, rank=0)

    return JsonResponse({'status': 200, 'message': 'registered!'})


def get_competition(request, id):
    '''
    used to send specific information about a competition with id of id.
    '''
    if not request.user.is_authenticated:
        return JsonResponse({'status': 401, 'message': 'Unauthorized'})

    try:
        competition = Competition.objects.get(id=id)

        now = timezone.now()
        if competition.competition_close_time < now:
            return JsonResponse({'status': 400, 'message': 'competition has finished!'})

        try:
            competitor = competition.competitors.get(user=request.user)
            if competitor.started_competition:
                return JsonResponse({'status': 400, 'message': 'you have already participated in this competition!'})

            data = CompetitionSerializer(competition).data
            data['status'] = 200
            return JsonResponse(data)

        except:
            return JsonResponse({'status': 400, 'message': 'your are not registered in this competition!'})

    except:
        return JsonResponse({'status': 400, 'message': 'no competition with information provided!'})


def start_competition(request, id):
    '''
    used to specify that requested user has started to participate in a competition with id of id so that the user will
    not be able to participate again in this competition
    this will send required info for starting competition like text, a random text will be chosen
    from list of text of competition by default
    '''
    if not request.user.is_authenticated:
        return JsonResponse({'status': 401, 'message': 'Unauthorized'})

    try:
        competition = Competition.objects.get(id=id)

        now = timezone.now() + timedelta(seconds=10)
        if now < competition.start_time:
            return JsonResponse({'status': 400, 'message': 'competition has not started yet!'})

        if now - timedelta(seconds=10) >= competition.competition_close_time:
            return JsonResponse({'status': 400, 'message': 'competition has ended!'})

        try:
            competitor = competition.competitors.get(user=request.user)
            if competitor.started_competition:
                return JsonResponse({'status': 400, 'message': 'you have already participated in this competition!'})

            competitor.started_competition = True
            competitor.rank = competition.max_competitors + 1
            competitor.save()

            texts = competition.text.all()
            # return a random Text
            return JsonResponse({'status': 200, 'text': texts[randint(0, len(texts) - 1)].txt})

        except:
            return JsonResponse({'status': 400, 'message': 'your are not registered in this competition!'})

    except:
        return JsonResponse({'status': 400, 'message': 'no competition with information provided!'})


def my_rank(request):
    '''
    used for updating involvement of a usr in a competition.
    rank of user and some other info will be sent as json for real time ranking in compete component of angular.
    by default involvements are sorted with key of (-wpm, -number of correct characters, number of wrong chars, -total keystrokes.
    wpm formula by default is ((all_entered_chars / 5) - number_of_wrong_chars) / time_in_minute
    by default ranking of users will not be changed but when a user has finished participating in an competition
    so user will send a finished flag so if competition is finished we save updated ranking.
    '''
    if not request.user.is_authenticated:
        return JsonResponse({'status': 401, 'message': 'Unauthorized'})
    try:
        data = json.loads(request.body.decode('utf-8'))
        competition = Competition.objects.get(id=data['id'])

        try:
            competitor = competition.competitors.get(user=request.user)
            competitor.correct_char_number = data['correct']
            competitor.wrong_char_number = data['wrong']
            competitor.time_passed = data['time']
            competitor.total_keystrokes = data['total']
            wpm = ((((data['correct'] + data['wrong']) / 5 - data['wrong']) * 60) / data['time'])
            competitor.finished_competition = data['finished']
            competitor.wpm = wpm
            competitor.save()

            all = sorted(competition.competitors.filter(started_competition=True), key=lambda k:
                (-k.wpm, -k.correct_char_number, k.wrong_char_number, -k.total_keystrokes))

            # if finished:
            #     print('saving')
            #     for i in range(len(all)):
            #         all[i].rank = i + 1
            #         all[i].save()

            ind = 0
            print(all)
            for i in range(len(all)):
                cm = all[i]
                cm.rank = i + 1
                cm.save()
                if all[i] == competitor:
                    ind = i

            next = 0 if ind == 0 else ind - 1
            return JsonResponse({'status': 200, 'rank': ind + 1, 'next_name': all[next].user.username,
                                 'next_wpm': all[next].wpm, 'max_wpm': all[0].wpm})

        except:
            return JsonResponse({'status': 400, 'message': 'your are not registered in this competition!'})

    except:
        return JsonResponse({'status': 400, 'message': 'no competition with information provided!'})


def scoreboard(request, id):
    '''
    used to send scoreboard information.
    by default involvements are sorted by key of wpm
    '''
    if not request.user.is_authenticated:
        return JsonResponse({'status': 401, 'message': 'Unauthorized'})

    try:
        competition = Competition.objects.get(id=id)
        all = [{**InvolvementSerializer(i).data, **{'name': i.user.username}}
               for i in sorted(competition.competitors.filter(started_competition=True), key=lambda k: k.rank)]

        # print(sorted(competition.competitors.filter(started_competition=True), key=lambda k: -k.wpm))
        data = {'status': 200, 'scoreboard': all, 'name': ''}
        if request.user.is_authenticated:
            data['name'] = request.user.username

        data['ended'] = 0
        if competition.competition_close_time < timezone.now():
            data['ended'] = 1

        return JsonResponse(data)



    except:
        return JsonResponse({'status': 400, 'message': 'no competition with information provided!'})


def activate_acount(request):
    '''
    used when user clicks on confirmation link sent to the user's email.
    it identifies the user and checks if token in url is the same with the one created for user.
    '''
    try: # in case that id is not integer
        id = int(request.GET.get('id', '-1'))
    except:
        return JsonResponse({'status': 400, 'message': 'Wrong Link!'})
    hash = request.GET.get('hash', '')
    if id == -1 or not hash:
        return JsonResponse({'status': 400, 'message': 'id or hash not found'})

    try:
        user = User.objects.get(id=id)
        if user.is_active:
            return JsonResponse({'status': 200, 'message': 'your account is already active'})
        if user.hash == hash:
            user.is_active = True
            user.save()
            return JsonResponse({'status': 200, 'message': 'your account is activated'})
        else:
            return JsonResponse({'status': 400, 'message': 'Wrong Link!'})

    except:
        return JsonResponse({'status': 400, 'message': 'Not Registered!'})


def generate_hash(request):
    '''
    if user request for new confirmation link this will be called
    it generates one and email it to user.
    '''
    data = json.loads(request.body.decode('utf-8'))
    email = data['email']

    try:
        user = User.objects.get(email=email)
        if user.is_active:
            return JsonResponse({'status': 400, 'message': 'your account is already active!'})
        message = user_activation(user)
        user.save()
        print(user.hash)

        return JsonResponse({'status': 200, 'message': message})

    except:
        return JsonResponse({'status': 400, 'message': 'No user with this email address is registered!'})