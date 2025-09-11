from django.http import HttpResponse
from django.conf import settings


class SimpleCorsMiddleware:
    """Minimal CORS middleware for development and simple APIs.
    Allows all origins when DEBUG and no explicit CORS_ALLOWED_ORIGINS are set.
    Otherwise, only allows configured origins.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.allowed = getattr(settings, 'CORS_ALLOWED_ORIGINS', []) or []
        self.debug = getattr(settings, 'DEBUG', False)

    def __call__(self, request):
        origin = request.headers.get('Origin')
        # Handle preflight
        if request.method == 'OPTIONS' and origin:
            if self._is_allowed(origin):
                resp = HttpResponse(status=200)
                self._apply_headers(resp, origin, request)
                return resp

        response = self.get_response(request)
        if origin and self._is_allowed(origin):
            self._apply_headers(response, origin, request)
        return response

    def _is_allowed(self, origin: str) -> bool:
        if self.allowed:
            return origin in self.allowed
        return bool(self.debug)

    def _apply_headers(self, response, origin, request):
        if self.allowed:
            response["Access-Control-Allow-Origin"] = origin
        else:
            response["Access-Control-Allow-Origin"] = "*"
        response["Vary"] = ", ".join(filter(None, [response.get("Vary"), "Origin"]))
        req_headers = request.headers.get('Access-Control-Request-Headers', 'Content-Type')
        response["Access-Control-Allow-Headers"] = req_headers
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Max-Age"] = "86400"
