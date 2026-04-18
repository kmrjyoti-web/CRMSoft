"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldMapperService = void 0;
const common_1 = require("@nestjs/common");
const profile_matcher_service_1 = require("./profile-matcher.service");
let FieldMapperService = class FieldMapperService {
    constructor(profileMatcher) {
        this.profileMatcher = profileMatcher;
    }
    mapRows(rows, fieldMapping, defaults) {
        const mappedRows = [];
        const notesByRow = new Map();
        for (let i = 0; i < rows.length; i++) {
            const { mapped, notes } = this.mapSingleRow(rows[i], fieldMapping, defaults);
            mappedRows.push(mapped);
            if (notes.length > 0)
                notesByRow.set(i, notes);
        }
        return { mappedRows, notesByRow };
    }
    mapSingleRow(rowData, fieldMapping, defaults) {
        const mapped = {};
        const notes = [];
        const appendNotes = [];
        for (const fm of fieldMapping) {
            if (!fm.targetField || fm.transform === 'SKIP')
                continue;
            const header = fm.sourceColumn || fm.matchedHeader || fm.sourceHeader;
            let value = rowData[header] || '';
            value = this.applyTransform(value, fm.transform);
            if (!value)
                continue;
            if (fm.transform === 'SPLIT_NAME') {
                const { firstName, lastName } = this.splitName(value);
                mapped.firstName = firstName;
                if (lastName)
                    mapped.lastName = lastName;
                continue;
            }
            if (fm.transform === 'APPEND_NOTES') {
                appendNotes.push(`${fm.sourceHeader}: ${value}`);
                continue;
            }
            if (fm.targetField.includes('.')) {
                const [parent, child] = fm.targetField.split('.');
                if (!mapped[parent])
                    mapped[parent] = {};
                mapped[parent][child] = value;
            }
            else {
                mapped[fm.targetField] = value;
            }
        }
        if (appendNotes.length > 0) {
            const existing = mapped.notes || '';
            mapped.notes = [existing, ...appendNotes].filter(Boolean).join('\n');
        }
        if (defaults) {
            for (const [key, val] of Object.entries(defaults)) {
                if (mapped[key] === undefined || mapped[key] === '') {
                    mapped[key] = val;
                }
            }
        }
        return { mapped, notes };
    }
    splitName(fullName) {
        const clean = fullName.replace(/^(mr|mrs|ms|miss|dr|prof|shri|smt|sri)\.?\s+/i, '').trim();
        const parts = clean.split(/\s+/).filter(Boolean);
        if (parts.length === 0)
            return { firstName: '', lastName: '' };
        if (parts.length === 1)
            return { firstName: parts[0], lastName: '' };
        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
        };
    }
    applyTransform(value, transform) {
        if (!value || !transform)
            return value;
        switch (transform) {
            case 'TRIM': return value.trim();
            case 'UPPERCASE': return value.trim().toUpperCase();
            case 'LOWERCASE': return value.trim().toLowerCase();
            case 'CLEAN_PHONE': return value.replace(/[\s\-\(\)\.]/g, '').trim();
            case 'CLEAN_EMAIL': return value.trim().toLowerCase();
            case 'SPLIT_NAME': return value.trim();
            case 'APPEND_NOTES': return value.trim();
            default: return value.trim();
        }
    }
};
exports.FieldMapperService = FieldMapperService;
exports.FieldMapperService = FieldMapperService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [profile_matcher_service_1.ProfileMatcherService])
], FieldMapperService);
//# sourceMappingURL=field-mapper.service.js.map