"""
Custom exceptions for the Todo API
"""


class AuthError(Exception):
    """Authentication error"""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NotFoundError(Exception):
    """Resource not found error"""

    def __init__(self, resource: str):
        self.resource = resource
        super().__init__(f"{resource} not found")


class ValidationError(Exception):
    """Validation error"""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class ConflictError(Exception):
    """Conflict error - resource already exists"""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)
