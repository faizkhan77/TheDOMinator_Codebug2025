# base/middleware.py

class CspMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # This tells the browser: "Allow this content to be framed ONLY by pages from http://localhost:5173"
        # The 'self' keyword allows the content to be framed by pages from its own origin too.
        response['Content-Security-Policy'] = "frame-ancestors 'self' http://localhost:5173"
        
        return response