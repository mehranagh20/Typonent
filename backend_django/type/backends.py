from django.conf import settings
from django.contrib.auth.hashers import check_password
from type.models import User


class EmailAuthBackend(object):
    """
    custom class for authenticating users by email
    """

    def authenticate(self, email=None, password=None):
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
            else:
                print('not authenticated')
                return None
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
            return user
        except User.DoesNotExist:
            return None

