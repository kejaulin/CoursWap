const { google } = require('googleapis');

function isGoogleMeetEvent(event) {
    return (event.hangoutLink);
}

const meetService = {
    async listEvents(auth) {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return (res.data.items || []).filter(isGoogleMeetEvent);
    },

    async createGoogleMeet(auth, { summary = 'Test Meeting', startDateTime, endDateTime } = {}) {
        const calendar = google.calendar({ version: 'v3', auth });
        const event = {
            summary,
            start: { dateTime: startDateTime || new Date().toISOString() },
            end: { dateTime: endDateTime || new Date(new Date().getTime() + 3600000).toISOString() },
            conferenceData: {
                createRequest: {
                    requestId: Math.random().toString(36).substring(2, 15),
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            },
        };
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
        });
        return response.data;
    },

    async getEvent(auth, eventId) {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.get({
            calendarId: 'primary',
            eventId,
        });
        return isGoogleMeetEvent(res.data) ? res.data : null;
    },

    async deleteEvent(auth, eventId) {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.get({
            calendarId: 'primary',
            eventId,
        });
        if (isGoogleMeetEvent(res.data)) {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId,
            });
        }
    },

    async updateEvent(auth, eventId, updates) {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.get({
            calendarId: 'primary',
            eventId,
        });
        if (!isGoogleMeetEvent(res.data)) {
            return null;
        }
        const updated = await calendar.events.patch({
            calendarId: 'primary',
            eventId,
            resource: updates,
        });
        return updated.data;
    },

    async reverseGeocode(lat, lng) {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GMAP_PLATFORM_API_KEY}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        const address = data.results[0]?.formatted_address;
        return address;
    }
};

module.exports = meetService;