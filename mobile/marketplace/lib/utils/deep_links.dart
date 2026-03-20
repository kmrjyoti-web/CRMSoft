import '../core/config/app_config.dart';

class DeepLinks {
  static String listing(String id) => '${AppConfig.deepLinkScheme}://${AppConfig.deepLinkHost}/listing/$id';
  static String offer(String id) => '${AppConfig.deepLinkScheme}://${AppConfig.deepLinkHost}/offer/$id';
  static String post(String id) => '${AppConfig.deepLinkScheme}://${AppConfig.deepLinkHost}/post/$id';

  static String webListing(String id) => '${AppConfig.marketplaceWebUrl}/listing/$id';
  static String webOffer(String id) => '${AppConfig.marketplaceWebUrl}/offer/$id';
  static String webPost(String id) => '${AppConfig.marketplaceWebUrl}/post/$id';

  static String whatsappText(String entityType, String id) {
    final url = webUrl(entityType, id);
    return 'Check out this $entityType on CRMSoft Marketplace: $url';
  }

  static String webUrl(String entityType, String id) {
    switch (entityType) {
      case 'listing': return webListing(id);
      case 'offer': return webOffer(id);
      case 'post': return webPost(id);
      default: return AppConfig.marketplaceWebUrl;
    }
  }
}
