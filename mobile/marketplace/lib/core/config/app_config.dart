import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get apiBaseUrl =>
      dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api/v1';

  static String get r2PublicUrl =>
      dotenv.env['R2_PUBLIC_URL'] ?? 'https://marketplace-assets.placeholder.com';

  static String get marketplaceWebUrl =>
      dotenv.env['MARKETPLACE_WEB_URL'] ?? 'https://marketplace.crmsoft.in';

  static const String deepLinkScheme = 'crmsoft';
  static const String deepLinkHost = 'marketplace';
}
