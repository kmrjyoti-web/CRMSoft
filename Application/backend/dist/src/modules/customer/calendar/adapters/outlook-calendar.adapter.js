"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OutlookCalendarAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookCalendarAdapter = void 0;
const common_1 = require("@nestjs/common");
const STUB_MESSAGE = 'Outlook Calendar integration pending API key setup';
let OutlookCalendarAdapter = OutlookCalendarAdapter_1 = class OutlookCalendarAdapter {
    constructor() {
        this.provider = 'OUTLOOK';
        this.logger = new common_1.Logger(OutlookCalendarAdapter_1.name);
    }
    getAuthUrl(redirectUri, _state) {
        this.logger.warn(`${STUB_MESSAGE} — getAuthUrl called with redirect: ${redirectUri}`);
        throw new common_1.NotImplementedException(STUB_MESSAGE);
    }
    async exchangeCode(_code, _redirectUri) {
        this.logger.warn(`${STUB_MESSAGE} — exchangeCode called`);
        throw new common_1.NotImplementedException(STUB_MESSAGE);
    }
    async refreshAccessToken(_refreshToken) {
        this.logger.warn(`${STUB_MESSAGE} — refreshAccessToken called`);
        throw new common_1.NotImplementedException(STUB_MESSAGE);
    }
    async listEvents(_accessToken, _calendarId, _syncToken) {
        this.logger.warn(`${STUB_MESSAGE} — listEvents called`);
        throw new common_1.NotImplementedException(STUB_MESSAGE);
    }
    async createEvent(_accessToken, _calendarId, _event) {
        this.logger.warn(`${STUB_MESSAGE} — createEvent called`);
        throw new common_1.NotImplementedException(STUB_MESSAGE);
    }
    async updateEvent(_accessToken, _calendarId, _eventId, _event) {
        this.logger.warn(`${STUB_MESSAGE} — updateEvent called`);
        throw new common_1.NotImplementedException(STUB_MESSAGE);
    }
    async deleteEvent(_accessToken, _calendarId, _eventId) {
        this.logger.warn(`${STUB_MESSAGE} — deleteEvent called`);
        throw new common_1.NotImplementedException(STUB_MESSAGE);
    }
};
exports.OutlookCalendarAdapter = OutlookCalendarAdapter;
exports.OutlookCalendarAdapter = OutlookCalendarAdapter = OutlookCalendarAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], OutlookCalendarAdapter);
//# sourceMappingURL=outlook-calendar.adapter.js.map