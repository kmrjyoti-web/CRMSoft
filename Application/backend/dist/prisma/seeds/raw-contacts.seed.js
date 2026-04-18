"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRawContacts = seedRawContacts;
const FIRST_NAMES = [
    'Aarav', 'Aditi', 'Aditya', 'Ajay', 'Akash', 'Amit', 'Amita', 'Anand',
    'Anil', 'Anita', 'Anjali', 'Ankita', 'Arun', 'Aruna', 'Ashish', 'Ashok',
    'Bharti', 'Bhavna', 'Chandan', 'Deepa', 'Deepak', 'Devika', 'Dhruv',
    'Dinesh', 'Divya', 'Gaurav', 'Geeta', 'Govind', 'Hari', 'Harish',
    'Hemant', 'Indira', 'Ishaan', 'Jaya', 'Jayesh', 'Kajal', 'Karan',
    'Kavita', 'Kishore', 'Krishna', 'Kunal', 'Lakshmi', 'Lata', 'Madhav',
    'Manoj', 'Meena', 'Mohan', 'Mukesh', 'Nandini', 'Naresh', 'Naveen',
    'Neelam', 'Neeraj', 'Neha', 'Nikhil', 'Nisha', 'Pallavi', 'Pankaj',
    'Pooja', 'Prakash', 'Prashant', 'Praveen', 'Preeti', 'Priya', 'Rahul',
    'Raj', 'Rajesh', 'Rakesh', 'Raman', 'Ramesh', 'Rani', 'Ravi', 'Rekha',
    'Ritika', 'Rohit', 'Sachin', 'Sandeep', 'Sanjay', 'Sapna', 'Sarita',
    'Satish', 'Seema', 'Shailesh', 'Shivani', 'Shreya', 'Shubham', 'Smita',
    'Sneha', 'Sonia', 'Subhash', 'Sudhir', 'Sunita', 'Sunil', 'Suresh',
    'Swati', 'Tanvi', 'Varun', 'Vijay', 'Vikram', 'Vinay', 'Vivek', 'Yogesh',
];
const LAST_NAMES = [
    'Agarwal', 'Ahuja', 'Bansal', 'Bhatia', 'Bhatt', 'Chauhan', 'Chawla',
    'Chopra', 'Das', 'Desai', 'Deshpande', 'Dubey', 'Gandhi', 'Garg',
    'Ghosh', 'Goyal', 'Gupta', 'Iyer', 'Jain', 'Jha', 'Joshi', 'Kapoor',
    'Kashyap', 'Khan', 'Khanna', 'Kohli', 'Kumar', 'Malhotra', 'Mehta',
    'Mishra', 'Mittal', 'Mukherjee', 'Nair', 'Naidu', 'Pandey', 'Patel',
    'Pillai', 'Prasad', 'Rao', 'Rathore', 'Reddy', 'Saxena', 'Sen',
    'Sethi', 'Shah', 'Sharma', 'Shukla', 'Singh', 'Sinha', 'Srivastava',
    'Thakur', 'Tiwari', 'Trivedi', 'Varma', 'Verma', 'Yadav',
];
const COMPANIES = [
    'Tata Consultancy Services', 'Infosys Ltd', 'Wipro Technologies',
    'HCL Technologies', 'Tech Mahindra', 'Reliance Industries',
    'Larsen & Toubro', 'Mahindra & Mahindra', 'Bajaj Auto', 'Hero MotoCorp',
    'Maruti Suzuki', 'Asian Paints', 'Hindustan Unilever', 'ITC Ltd',
    'Nestle India', 'Godrej Industries', 'Adani Group', 'JSW Steel',
    'Bharat Forge', 'Dr. Reddy\'s Laboratories', 'Sun Pharma', 'Cipla Ltd',
    'Biocon Ltd', 'Zomato', 'Swiggy', 'Flipkart', 'Ola Cabs', 'Paytm',
    'Razorpay', 'Freshworks', 'Zoho Corp', 'MindTree', 'Mphasis',
    'Persistent Systems', 'NIIT Technologies', 'Hexaware Technologies',
    'Cyient Ltd', 'Zensar Technologies', 'Birlasoft', 'Coforge Ltd',
    'LTIMindtree', 'Sonata Software', 'KPIT Technologies', 'Mastek Ltd',
    'Happiest Minds', 'Route Mobile', 'Quick Heal Technologies',
    'Nucleus Software', 'Aurionpro Solutions', 'Saksoft Ltd',
    'IndiGo Airlines', 'SpiceJet', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Kotak Mahindra Bank', 'State Bank of India', 'Punjab National Bank',
    'Bharti Airtel', 'Vodafone Idea', 'Jio Platforms', 'Dabur India',
    'Emami Ltd', 'Marico Ltd', 'Titan Company', 'Havells India',
    'Crompton Greaves', 'Voltas Ltd', 'Blue Star Ltd', 'Dalmia Bharat',
    'UltraTech Cement', 'Ambuja Cements', 'ACC Ltd', 'Grasim Industries',
    'Vedanta Ltd', 'Hindalco Industries', 'Tata Steel', 'Coal India',
    'NTPC Ltd', 'Power Grid Corp', 'BHEL', 'GAIL India', 'Indian Oil Corp',
    'BPCL', 'HPCL', 'ONGC', 'Oil India Ltd', 'Pidilite Industries',
    'Berger Paints', 'Kansai Nerolac', 'SBI Life Insurance',
    'HDFC Life', 'ICICI Prudential', 'Max Financial', 'Bajaj Finserv',
    'Shriram Finance', 'Manappuram Finance', 'Muthoot Finance',
    'Piramal Enterprises', 'DLF Ltd', 'Prestige Estates', 'Godrej Properties',
    null, null, null, null, null,
];
const DESIGNATIONS = [
    'CEO', 'CTO', 'CFO', 'COO', 'VP Sales', 'VP Engineering',
    'VP Marketing', 'Director', 'Senior Director', 'General Manager',
    'Assistant General Manager', 'Senior Manager', 'Manager',
    'Deputy Manager', 'Assistant Manager', 'Team Lead', 'Senior Engineer',
    'Software Engineer', 'Business Analyst', 'Product Manager',
    'Project Manager', 'Consultant', 'Senior Consultant', 'Architect',
    'Principal Architect', 'Associate', 'Senior Associate', 'Executive',
    'Senior Executive', 'Officer', 'Analyst', 'Data Scientist',
    'DevOps Engineer', 'QA Lead', 'Designer', 'HR Manager',
    'Procurement Head', 'Purchase Manager', 'Admin Officer', 'Accountant',
    null, null, null, null, null,
];
const DEPARTMENTS = [
    'Sales', 'Marketing', 'Engineering', 'Product', 'Finance',
    'Human Resources', 'Operations', 'IT', 'Support', 'Administration',
    'Procurement', 'Legal', 'Research & Development', 'Quality Assurance',
    'Business Development', 'Customer Success', 'Data Analytics',
    'Supply Chain', 'Logistics', 'Training',
    null, null, null, null,
];
const SOURCES = [
    'MANUAL', 'MANUAL', 'MANUAL',
    'BULK_IMPORT', 'BULK_IMPORT',
    'WEB_FORM', 'WEB_FORM', 'WEB_FORM',
    'REFERRAL',
    'API',
];
const STATUSES = [
    'RAW', 'RAW', 'RAW', 'RAW', 'RAW',
    'VERIFIED', 'VERIFIED',
    'REJECTED',
    'DUPLICATE',
    'RAW',
];
const NOTES_TEMPLATES = [
    'Interested in CRM solution for team of {n} people',
    'Enquiry via website contact form',
    'Met at {event} trade show in {city}',
    'Referral from existing client',
    'Cold call follow-up needed',
    'Requested product demo',
    'Budget discussion pending',
    'Needs enterprise pricing quote',
    'Evaluating multiple vendors',
    'Decision expected by end of quarter',
    'Currently using competitor product',
    'Looking for migration support',
    'Interested in annual subscription',
    'Wants on-premise deployment option',
    'Needs integration with SAP',
    'Requires custom reporting module',
    'Training requirement for 50+ users',
    'Government tender requirement',
    'Startup — looking for discounted pricing',
    'Multi-location deployment needed',
    null, null, null, null, null,
];
const EVENTS = ['CII Summit', 'NASSCOM', 'TechSparks', 'SaaStr India', 'ProductCon', 'WebSummit Asia'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com',
    'rediffmail.com', 'company.co.in', 'corp.in', 'enterprise.com',
];
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomDate(startDays, endDays) {
    const now = Date.now();
    const start = now - startDays * 86_400_000;
    const end = now - endDays * 86_400_000;
    return new Date(start + Math.random() * (end - start));
}
function generateNote() {
    const template = pick(NOTES_TEMPLATES);
    if (!template)
        return null;
    return template
        .replace('{n}', String(randomInt(5, 500)))
        .replace('{event}', pick(EVENTS))
        .replace('{city}', pick(CITIES));
}
function generatePhone() {
    const prefixes = ['98', '97', '96', '95', '94', '93', '91', '90', '88', '87', '86', '85', '84', '70', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83'];
    return `+91${pick(prefixes)}${String(randomInt(10000000, 99999999))}`;
}
function generateEmail(firstName, lastName, index) {
    const domain = pick(EMAIL_DOMAINS);
    const variants = [
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}`,
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}`,
        `${firstName.toLowerCase()}${randomInt(1, 999)}`,
    ];
    return `${pick(variants)}@${domain}`;
}
async function seedRawContacts(prisma, adminUserId, tenantId, count = 1000) {
    console.log(`\n📇 Seeding ${count} raw contacts...`);
    const existingCount = await prisma.rawContact.count({ where: { tenantId } });
    if (existingCount >= count) {
        console.log(`   ⏭️  Already ${existingCount} raw contacts — skipping`);
        return;
    }
    const toCreate = count - existingCount;
    const batchSize = 100;
    let created = 0;
    for (let batch = 0; batch < Math.ceil(toCreate / batchSize); batch++) {
        const size = Math.min(batchSize, toCreate - created);
        const records = [];
        const commsData = [];
        for (let i = 0; i < size; i++) {
            const globalIndex = existingCount + created + i;
            const firstName = pick(FIRST_NAMES);
            const lastName = pick(LAST_NAMES);
            const status = pick(STATUSES);
            const source = pick(SOURCES);
            const createdAt = randomDate(365, 0);
            records.push({
                tenantId,
                firstName,
                lastName,
                companyName: pick(COMPANIES),
                designation: pick(DESIGNATIONS),
                department: pick(DEPARTMENTS),
                source,
                status,
                notes: generateNote(),
                createdById: adminUserId,
                createdAt,
                updatedAt: createdAt,
                ...(status === 'VERIFIED' ? { verifiedAt: new Date(createdAt.getTime() + randomInt(1, 30) * 86_400_000), verifiedById: adminUserId } : {}),
            });
            const commCount = randomInt(1, 3);
            const comms = [];
            comms.push({
                type: 'MOBILE',
                value: generatePhone(),
                priorityType: 'PRIMARY',
                isPrimary: true,
            });
            if (commCount >= 2) {
                comms.push({
                    type: 'EMAIL',
                    value: generateEmail(firstName, lastName, globalIndex),
                    priorityType: 'WORK',
                    isPrimary: false,
                });
            }
            if (commCount >= 3) {
                const extraType = Math.random() > 0.5 ? 'PHONE' : 'WHATSAPP';
                comms.push({
                    type: extraType,
                    value: generatePhone(),
                    priorityType: 'PERSONAL',
                    isPrimary: false,
                });
            }
            commsData.push({ index: i, comms });
        }
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const comms = commsData.find((c) => c.index === i)?.comms ?? [];
            await prisma.rawContact.create({
                data: {
                    ...record,
                    communications: {
                        create: comms.map((c) => ({
                            tenantId,
                            type: c.type,
                            value: c.value,
                            priorityType: c.priorityType,
                            isPrimary: c.isPrimary,
                        })),
                    },
                },
            });
        }
        created += size;
        const pct = Math.round((created / toCreate) * 100);
        process.stdout.write(`\r   📇 Progress: ${created}/${toCreate} (${pct}%)`);
    }
    console.log(`\n   ✅ ${toCreate} raw contacts created (total: ${count})`);
}
//# sourceMappingURL=raw-contacts.seed.js.map