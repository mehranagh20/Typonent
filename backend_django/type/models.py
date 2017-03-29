from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **kwargs):
        if not email or not username or not password:
            raise ValueError("Enter email and username")
        user = self.model(email=self.normalize_email(email), username=username)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, username, password, **kwargs):
        user = self.create_user(email, username, password, **kwargs)
        user.is_admin = True
        user.is_superuser = True
        user.save()
        return user


class User(AbstractBaseUser):
    '''
    Custom User class.
    a user can have many Involvements.
    '''

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=40, unique=True)

    hash = models.TextField(default="")
    is_active = models.BooleanField(default=False)

    is_admin = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']


    @property
    def is_staff(self):
        return self.is_admin

    def get_short_name(self):
        return self.username

    def get_full_name(self):
        return self.username

    def get_username(self):
        return self.email

    def has_module_perms(self, app_label):
        return True

    def has_perm(self, perm, obj=None):
        return True

    def __str__(self):
        return self.username


class Text(models.Model):
    '''
    Model for competition text.
    '''

    name = models.CharField(max_length=40, default="")
    txt = models.TextField()

    # other things maybe
    # difficulty
    # num of words ...

    def __str__(self):
        return self.name


class Competition(models.Model):
    '''
    Model for competition.
    A competition can have many requirements, a text, many Involvements(competitors).
    '''

    name = models.CharField(max_length=40)
    start_time = models.DateTimeField()
    competition_close_time = models.DateTimeField()
    registration_time = models.DateTimeField()
    registration_close_time = models.DateTimeField()
    duration = models.IntegerField(default=0)

    # if -1 then infinite user can register
    max_competitors = models.IntegerField(default=0)
    text = models.ManyToManyField(Text)

    def __str__(self):
        return self.name


class Requirement(models.Model):
    '''
    Model for specifying requirements for registering in a competition.
    A requirement has a competition.
    '''

    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name='requirements')
    min_rank = models.IntegerField(default=0, blank=False)
    required_competition = models.ForeignKey(Competition, default=None, on_delete=models.CASCADE, related_name='requires')

    def __str__(self):
        return self.competition.name + " " + str(self.min_rank)


class Involvement(models.Model):
    '''
    Model for specifying both contestant of a competition and achievements of a user.
    An involvement has a competition and a user saying that the user has involved in the competition.
    '''

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name='competitors')
    rank = models.IntegerField(default=0)
    started_competition = models.BooleanField(default=False)

    wpm = models.IntegerField(default=0)
    correct_char_number = models.IntegerField(default=0)
    wrong_char_number = models.IntegerField(default=0)
    total_keystrokes = models.IntegerField(default=0)
    time_passed = models.IntegerField(default=0)

    def __str__(self):
        return '{} {} {}'.format(self.user, self.competition, self.wpm)


