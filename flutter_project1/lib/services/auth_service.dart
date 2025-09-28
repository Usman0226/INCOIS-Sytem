// lib/services/auth_service.dart

/// A simple static service to hold authentication state in memory.
/// Note: This is not persistent. Token will be lost on app restart.
/// For production, consider flutter_secure_storage.
class AuthService {
  static String? _token;
  static String? _userName;
  static String? _userPhone;

  static String? get token => _token;
  static String? get userName => _userName;
  static String? get userPhone => _userPhone;

  /// Call this after a successful login/verification
  static void setCredentials(String token, Map<String, dynamic>? user) {
    _token = token;
    if (user != null) {
      _userName = user['name'] as String?;
      _userPhone = user['phone'] as String?;
    }
  }

  /// Call this on logout
  static void clearCredentials() {
    _token = null;
    _userName = null;
    _userPhone = null;
  }
}