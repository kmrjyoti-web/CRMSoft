import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

class TokenStorage {
  static const _storage = FlutterSecureStorage();
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _tenantIdKey = 'tenant_id';
  static const _userIdKey = 'user_id';

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    required String tenantId,
    required String userId,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
      _storage.write(key: _tenantIdKey, value: tenantId),
      _storage.write(key: _userIdKey, value: userId),
    ]);
  }

  Future<String?> getAccessToken() => _storage.read(key: _accessTokenKey);
  Future<String?> getRefreshToken() => _storage.read(key: _refreshTokenKey);
  Future<String?> getTenantId() => _storage.read(key: _tenantIdKey);
  Future<String?> getUserId() => _storage.read(key: _userIdKey);

  Future<void> clear() => _storage.deleteAll();
}
