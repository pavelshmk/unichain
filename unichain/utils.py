from decimal import Decimal

from dynamic_preferences.registries import global_preferences_registry
from dynamic_preferences.settings import preferences_settings
from dynamic_preferences.types import BasePreferenceType
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import APIException

global_preferences = global_preferences_registry.manager()


class PreferenceMixin(BasePreferenceType):
    @classmethod
    def key(cls):
        return '{}{}{}'.format(cls.section.name,
                               preferences_settings.SECTION_KEY_SEPARATOR,
                               cls.name)

    @classmethod
    def value(cls):
        return global_preferences[cls.key()]


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Conflict.'
    default_code = 'conflict'


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening


REFERRAL_BONUSES = [
    Decimal('.07'),
    Decimal('.05'),
    Decimal('.03'),
    Decimal('.02'),
    Decimal('.01'),
    Decimal('.01'),
    Decimal('.005'),
    Decimal('.005'),
    Decimal('.002'),
]

FARMING_BONUSES = [
    Decimal('.1'),
    Decimal('.05'),
    Decimal('.03'),
]
