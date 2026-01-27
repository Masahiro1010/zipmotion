from django.urls import path
from . import views

app_name = "zipmotion"

urlpatterns = [
    path("top/", views.TopView.as_view(), name="top"),
    path("about/", views.AboutView.as_view(), name="about"),
    path("portfolio/", views.PortfolioView.as_view(), name="portfolio"),
    path("contact/", views.ContactView.as_view(), name="contact"),
]