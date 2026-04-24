export const VERTICAL_MANAGER_ERRORS = {
  NOT_FOUND: { code: 'E_VERTICAL_001', message: 'Vertical not found', messageHi: 'वर्टिकल नहीं मिला', statusCode: 404 },
  DUPLICATE_CODE: { code: 'E_VERTICAL_002', message: 'Vertical code already registered', messageHi: 'वर्टिकल कोड पहले से पंजीकृत', statusCode: 409 },
  AUDIT_FAILED: { code: 'E_VERTICAL_003', message: 'Vertical audit failed to complete', messageHi: 'वर्टिकल ऑडिट पूर्ण नहीं हुआ', statusCode: 500 },
  FOLDER_NOT_FOUND: { code: 'E_VERTICAL_004', message: 'Vertical folder not found in codebase', messageHi: 'कोडबेस में वर्टिकल फोल्डर नहीं मिला', statusCode: 404 },
  CANNOT_DEPRECATE: { code: 'E_VERTICAL_005', message: 'Cannot deprecate — active tenants using this vertical', messageHi: 'सक्रिय टेनेंट इस वर्टिकल का उपयोग कर रहे हैं', statusCode: 409 },
} as const;
