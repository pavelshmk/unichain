from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from app.models import User


class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(widget=forms.PasswordInput, label='Password')
    password2 = forms.CharField(widget=forms.PasswordInput, label='Confirm password')

    class Meta:
        model = User
        fields = ('username', 'password1', 'password2')

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError('Passwords do not match')
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(help_text='Raw passwords are not stored, so there is no way to see '
                                                   'this user\'s password, but you can change the password '
                                                   'using <a href="../password/">this form</a>.')

    class Meta:
        model = User
        fields = ('username', 'password', 'referrer', '_referral_code', 'is_active', 'is_staff',)

    def clean_password(self):
        return self.initial["password"]
