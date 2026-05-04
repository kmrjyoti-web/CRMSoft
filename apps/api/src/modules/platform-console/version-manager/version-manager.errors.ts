export const VERSION_MANAGER_ERRORS = {
  RELEASE_NOT_FOUND: { code: 'E_VERSION_001', message: 'Release not found', messageHi: 'रिलीज़ नहीं मिली', statusCode: 404 },
  INVALID_SEMVER: { code: 'E_VERSION_002', message: 'Invalid semantic version format', messageHi: 'अमान्य संस्करण प्रारूप', statusCode: 400 },
  DUPLICATE_VERSION: { code: 'E_VERSION_003', message: 'Version already exists for this vertical', messageHi: 'इस वर्टिकल के लिए संस्करण पहले से मौजूद', statusCode: 409 },
  CANNOT_PUBLISH: { code: 'E_VERSION_004', message: 'Only DRAFT or STAGING releases can be published', messageHi: 'केवल ड्राफ्ट या स्टेजिंग रिलीज़ प्रकाशित हो सकती है', statusCode: 409 },
  NO_PREVIOUS_VERSION: { code: 'E_VERSION_005', message: 'No previous version to rollback to', messageHi: 'रोलबैक के लिए कोई पिछला संस्करण नहीं', statusCode: 404 },
  ALREADY_RELEASED: { code: 'E_VERSION_006', message: 'Release already published', messageHi: 'रिलीज़ पहले से प्रकाशित', statusCode: 409 },
} as const;
