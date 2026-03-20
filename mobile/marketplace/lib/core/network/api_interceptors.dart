import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../auth/token_storage.dart';

class AuthInterceptor extends Interceptor {
  final Ref _ref;
  AuthInterceptor(this._ref);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _ref.read(tokenStorageProvider).getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}

class TenantInterceptor extends Interceptor {
  final Ref _ref;
  TenantInterceptor(this._ref);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final tenantId = await _ref.read(tokenStorageProvider).getTenantId();
    if (tenantId != null) {
      options.headers['X-Tenant-Id'] = tenantId;
    }
    handler.next(options);
  }
}

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final response = err.response;
    if (response != null) {
      final data = response.data;
      final message = data is Map ? data['message'] ?? 'Request failed' : 'Request failed';
      handler.reject(
        DioException(
          requestOptions: err.requestOptions,
          response: err.response,
          type: err.type,
          message: message.toString(),
        ),
      );
    } else {
      handler.next(err);
    }
  }
}
