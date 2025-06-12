const authService = require('../services/authService');
const meetService = require('../services/meetService');
const Meeting = require('../models/Meet');

exports.createMeet = async (req, res) => {
    try {
        console.log('Requête reçue pour création de meeting :', req.user);
        const { summary, startDateTime, endDateTime } = req.body;
        if (!summary || !startDateTime || !endDateTime) {
            return res.status(400).json({ error: "Tous les champs sont obligatoires." });
        }
        if (new Date(startDateTime) >= new Date(endDateTime)) {
            return res.status(400).json({ error: "La date de début doit être avant la date de fin." });
        }

        const auth = await authService.getAuthorizedClient(req.user);
        const event = await meetService.createGoogleMeet(auth, req.body);

        const meeting = new Meeting({
            summary: event.summary,
            startDateTime: event.start.dateTime,
            endDateTime: event.end.dateTime,
            createdBy: req.user._id,
            hangoutLink: event.hangoutLink,
            eventId: event.id
        });
        await meeting.save();
        res.status(201).json(event);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.listMeets = async (req, res) => {
    try {
        const now = new Date();
        const meetings = await Meeting.find({
            startDateTime: { $lte: now },
            endDateTime: { $gt: now }
        })
        .sort({ startDateTime: 1 })
        .populate('createdBy', 'nom photo');
        res.json(meetings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMeet = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id).populate('createdBy', 'nom photo');
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        res.json(meeting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMeet = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        const auth = await authService.getAuthorizedClient(req.user);
        await meetService.deleteEvent(auth, meeting.eventId);
        await meeting.deleteOne();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMeet = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        const auth = await authService.getAuthorizedClient(req.user);
        const event = await meetService.updateEvent(auth, meeting.eventId, req.body);
        meeting.summary = event.summary;
        meeting.startDateTime = event.start.dateTime;
        meeting.endDateTime = event.end.dateTime;
        meeting.hangoutLink = event.hangoutLink;
        await meeting.save();

        res.json(meeting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};