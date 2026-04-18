"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERTICAL_SCHEMAS = void 0;
exports.getVerticalSchema = getVerticalSchema;
exports.validateVerticalData = validateVerticalData;
exports.VERTICAL_SCHEMAS = {
    CONTACT: {
        SOFTWARE_VENDOR: {
            fields: [
                { key: 'techStack', label: 'Tech Stack', labelHi: 'तकनीकी स्टैक', type: 'multi-select', options: ['Java', 'Python', 'Oracle', 'SAP', '.NET', 'PHP', 'Node.js', 'React'] },
                { key: 'currentSoftware', label: 'Current Software', labelHi: 'वर्तमान सॉफ्टवेयर', type: 'text' },
                { key: 'companySize', label: 'Company Size', labelHi: 'कंपनी का आकार', type: 'select', options: ['1-10', '11-50', '51-200', '200+'] },
                { key: 'decisionMaker', label: 'Decision Maker', labelHi: 'निर्णयकर्ता', type: 'boolean' },
                { key: 'contractExpiry', label: 'Contract Expiry', labelHi: 'अनुबंध समाप्ति', type: 'date' },
            ],
        },
        PHARMA: {
            fields: [
                { key: 'doctorName', label: 'Doctor Name', labelHi: 'डॉक्टर का नाम', type: 'text', required: true },
                { key: 'specialization', label: 'Specialization', labelHi: 'विशेषज्ञता', type: 'select', options: ['Cardiologist', 'Diabetologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'General Physician'] },
                { key: 'mciRegistration', label: 'MCI Registration', labelHi: 'MCI पंजीकरण', type: 'text', pattern: '^MCI-\\d+$' },
                { key: 'clinicName', label: 'Clinic Name', labelHi: 'क्लिनिक', type: 'text' },
                { key: 'hospitalAffiliation', label: 'Hospital', labelHi: 'अस्पताल', type: 'text' },
                { key: 'department', label: 'Department', labelHi: 'विभाग', type: 'text' },
            ],
        },
        TOURISM: {
            fields: [
                { key: 'passportNumber', label: 'Passport Number', labelHi: 'पासपोर्ट नंबर', type: 'text' },
                { key: 'passportExpiry', label: 'Passport Expiry', labelHi: 'पासपोर्ट समाप्ति', type: 'date' },
                { key: 'frequentFlyer', label: 'Frequent Flyer ID', labelHi: 'फ्रीक्वेंट फ्लायर', type: 'text' },
                { key: 'dietPreference', label: 'Diet Preference', labelHi: 'भोजन पसंद', type: 'select', options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain'] },
            ],
        },
        RESTAURANT: {
            fields: [
                { key: 'allergyInfo', label: 'Allergy Info', labelHi: 'एलर्जी जानकारी', type: 'multi-select', options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut Allergy', 'Lactose Intolerant'] },
                { key: 'preferredCuisine', label: 'Preferred Cuisine', labelHi: 'पसंदीदा व्यंजन', type: 'multi-select', options: ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Italian'] },
            ],
        },
        RETAIL: {
            fields: [
                { key: 'loyaltyCardNumber', label: 'Loyalty Card', labelHi: 'लॉयल्टी कार्ड', type: 'text' },
                { key: 'preferredPayment', label: 'Preferred Payment', labelHi: 'भुगतान पसंद', type: 'select', options: ['Cash', 'UPI', 'Card', 'Credit'] },
            ],
        },
        GENERAL: { fields: [] },
    },
    LEAD: {
        SOFTWARE_VENDOR: {
            fields: [
                { key: 'demoStatus', label: 'Demo Status', labelHi: 'डेमो स्थिति', type: 'select', options: ['Not Requested', 'Scheduled', 'Completed', 'Follow-up'] },
                { key: 'trialPeriod', label: 'Trial Period (days)', labelHi: 'ट्रायल अवधि', type: 'number' },
                { key: 'currentVendor', label: 'Current Vendor', labelHi: 'वर्तमान विक्रेता', type: 'text' },
                { key: 'budget', label: 'Budget (INR)', labelHi: 'बजट', type: 'number' },
            ],
        },
        PHARMA: {
            fields: [
                { key: 'prescriberType', label: 'Prescriber Type', labelHi: 'प्रिस्क्राइबर प्रकार', type: 'select', options: ['Doctor', 'Hospital', 'Clinic', 'Pharmacy Chain'] },
                { key: 'territory', label: 'Territory', labelHi: 'क्षेत्र', type: 'text' },
                { key: 'monthlyPrescriptions', label: 'Monthly Prescriptions', labelHi: 'मासिक प्रिस्क्रिप्शन', type: 'number' },
            ],
        },
        TOURISM: {
            fields: [
                { key: 'tripType', label: 'Trip Type', labelHi: 'यात्रा प्रकार', type: 'select', options: ['Domestic', 'International', 'Pilgrimage', 'Adventure', 'Honeymoon'] },
                { key: 'paxCount', label: 'Passengers', labelHi: 'यात्री संख्या', type: 'number' },
                { key: 'budget', label: 'Budget Range', labelHi: 'बजट', type: 'select', options: ['Under ₹25K', '₹25K-₹50K', '₹50K-₹1L', '₹1L-₹5L', 'Above ₹5L'] },
                { key: 'travelDates', label: 'Travel Dates', labelHi: 'यात्रा तिथि', type: 'text' },
            ],
        },
        RESTAURANT: {
            fields: [
                { key: 'eventType', label: 'Event Type', labelHi: 'इवेंट प्रकार', type: 'select', options: ['Birthday', 'Anniversary', 'Corporate', 'Wedding', 'Casual'] },
                { key: 'guestCount', label: 'Guest Count', labelHi: 'अतिथि संख्या', type: 'number' },
            ],
        },
        RETAIL: {
            fields: [
                { key: 'productCategory', label: 'Product Category', labelHi: 'उत्पाद श्रेणी', type: 'text' },
                { key: 'estimatedValue', label: 'Estimated Value', labelHi: 'अनुमानित मूल्य', type: 'number' },
            ],
        },
        GENERAL: { fields: [] },
    },
    PRODUCT: {
        SOFTWARE_VENDOR: {
            fields: [
                { key: 'deploymentType', label: 'Deployment Type', labelHi: 'डिप्लॉयमेंट प्रकार', type: 'select', options: ['ONLINE', 'OFFLINE', 'HYBRID'] },
                { key: 'maxUsers', label: 'Max Users', labelHi: 'अधिकतम उपयोगकर्ता', type: 'number' },
                { key: 'maxCompanies', label: 'Max Companies', labelHi: 'अधिकतम कंपनियां', type: 'number' },
                { key: 'features', label: 'Key Features', labelHi: 'मुख्य विशेषताएं', type: 'textarea' },
            ],
        },
        PHARMA: {
            fields: [
                { key: 'saltComposition', label: 'Salt Composition', labelHi: 'नमक संरचना', type: 'text', required: true },
                { key: 'drugSchedule', label: 'Drug Schedule', labelHi: 'दवा अनुसूची', type: 'select', options: ['H', 'H1', 'X', 'OTC', 'Ayurvedic'] },
                { key: 'stripSize', label: 'Strip Size', labelHi: 'स्ट्रिप साइज', type: 'number' },
                { key: 'prescriptionRequired', label: 'Prescription Required', labelHi: 'प्रिस्क्रिप्शन आवश्यक', type: 'boolean' },
                { key: 'manufacturer', label: 'Manufacturer', labelHi: 'निर्माता', type: 'text' },
            ],
        },
        TOURISM: {
            fields: [
                { key: 'tourType', label: 'Tour Type', labelHi: 'यात्रा प्रकार', type: 'select', options: ['Fixed Departure', 'Customized', 'Corporate'] },
                { key: 'duration', label: 'Duration (nights)', labelHi: 'अवधि', type: 'number' },
                { key: 'destinations', label: 'Destinations', labelHi: 'गंतव्य', type: 'multi-select' },
                { key: 'inclusions', label: 'Inclusions', labelHi: 'समावेश', type: 'textarea' },
            ],
        },
        RESTAURANT: {
            fields: [
                { key: 'cuisineType', label: 'Cuisine', labelHi: 'व्यंजन', type: 'select', options: ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Italian', 'Mughlai'] },
                { key: 'spiceLevel', label: 'Spice Level', labelHi: 'मसाला स्तर', type: 'select', options: ['Mild', 'Medium', 'Hot', 'Extra Hot'] },
                { key: 'prepTime', label: 'Prep Time (min)', labelHi: 'तैयारी समय', type: 'number' },
                { key: 'isVeg', label: 'Vegetarian', labelHi: 'शाकाहारी', type: 'boolean' },
            ],
        },
        RETAIL: {
            fields: [
                { key: 'barcode', label: 'Barcode', labelHi: 'बारकोड', type: 'text' },
                { key: 'reorderLevel', label: 'Reorder Level', labelHi: 'पुनर्ऑर्डर स्तर', type: 'number' },
                { key: 'shelfLocation', label: 'Shelf Location', labelHi: 'शेल्फ स्थान', type: 'text' },
            ],
        },
        GENERAL: { fields: [] },
    },
};
function getVerticalSchema(entity, businessType) {
    return exports.VERTICAL_SCHEMAS[entity]?.[businessType] ?? exports.VERTICAL_SCHEMAS[entity]?.['GENERAL'] ?? { fields: [] };
}
function validateVerticalData(data, schema) {
    const errors = [];
    for (const field of schema.fields) {
        const value = data[field.key];
        const isEmpty = value === undefined || value === null || value === '';
        if (field.required && isEmpty) {
            errors.push(`${field.label} is required`);
            continue;
        }
        if (!isEmpty && field.pattern && typeof value === 'string') {
            const regex = new RegExp(field.pattern);
            if (!regex.test(value)) {
                errors.push(`${field.label} format is invalid`);
            }
        }
        if (!isEmpty && field.type === 'number' && typeof value !== 'number' && isNaN(Number(value))) {
            errors.push(`${field.label} must be a number`);
        }
        if (!isEmpty && field.type === 'select' && field.options && !field.options.includes(value)) {
            errors.push(`${field.label} must be one of: ${field.options.join(', ')}`);
        }
    }
    return errors;
}
//# sourceMappingURL=vertical-registry.js.map