from rest_framework import serializers
from django.contrib.auth import update_session_auth_hash
from type.models import User, Competition, Involvement


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'confirm_password')
        read_only_fields = ('created_at', 'updated_at')

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.save()
        password = validated_data.get('password', None)

        confirm_password = validated_data.get('confirm_password', None)
        if password and confirm_password and password == confirm_password:
            instance.set_password(password)
            instance.save()

        # update_session_auth_hash(self.context.get('request'), instance)
        return instance


class CompetitionSerializer(serializers.ModelSerializer):
    '''
    used for serializing competition model
    '''
    class Meta:
        model = Competition
        fields = ('id', 'name', 'start_time', 'duration', 'max_competitors', 'registration_time'
                  , 'registration_close_time', 'competition_close_time')


class InvolvementSerializer(serializers.ModelSerializer):
    '''
    used for serializing involvement model
    '''
    class Meta:
        model = Involvement
        fields = ('rank', 'wpm', 'correct_char_number', 'wrong_char_number', 'total_keystrokes', 'finished_competition')
