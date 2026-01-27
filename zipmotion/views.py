from django.views.generic import TemplateView

class TopView(TemplateView):
    template_name = "zipmotion/top.html"


class AboutView(TemplateView):
    template_name = "core/about.html"


class PortfolioView(TemplateView):
    template_name = "core/portfolio.html"
    

class ContactView(TemplateView):
    template_name = "core/contact.html"
