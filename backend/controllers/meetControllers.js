const authService = require('../services/authService');
const meetService = require('../services/meetService');
const Meeting = require('../models/Meet');
const userService = require('../services/userService');
const wordCloudService = require('../services/wordCloudService');

exports.createMeet = async (req, res) => {
    try {
        const { matiere, summary, startDateTime, endDateTime, rejoinCost, originalCost, keywords } = req.body;
        if (!matiere ||!summary || !startDateTime || !endDateTime) {
            return res.status(400).json({ error: "Tous les champs sont obligatoires." });
        }
        if (new Date(startDateTime) >= new Date(endDateTime)) {
            return res.status(400).json({ error: "La date de début doit être avant la date de fin." });
        }

        const auth = await authService.getAuthorizedClient(req.user);
        const event = await meetService.createGoogleMeet(auth, req.body);
        const wordCloud = await wordCloudService.generateWordCloud(keywords.join(' '));
        const meeting = new Meeting({
            matiere: matiere,
            summary: event.summary,
            startDateTime: event.start.dateTime,
            endDateTime: event.end.dateTime,
            createdBy: req.user._id,
            hangoutLink: event.hangoutLink,
            eventId: event.id,
            rejoinCost: rejoinCost,
            originalCost: originalCost,
            participants: [],
            keywords: keywords.join(' '),
            imageUrl: wordCloud.image
        });
        await meeting.save();
        return res.status(201).json(event);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
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
        return res.status(500).json({ error: err.message });
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
        return res.status(500).json({ error: err.message });
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
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ error: err.message });
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
        return res.status(500).json({ error: err.message });
    }
};

exports.joinMeet = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        const {participantInfos} = req.body;
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        meeting.participants.push(participantInfos);
        await meeting.save();
        if( meeting.participants.length === 1){
            await userService.addUserToken(meeting.createdBy, req.appTokenApiKey,Math.floor((meeting.originalCost +1)/2));
        } else if(meeting.participants.length === 5){
            await userService.addUserToken(meeting.createdBy, req.appTokenApiKey,meeting.originalCost);
        }
        res.json(meeting);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.reverseGeocode = async (req,res) =>{
    try{
        const {lat,lng} = req.body;
        const address = await meetService.reverseGeocode(lat,lng);
        res.send({address:address});
    } catch (err){
        return res.status(500).json({ error: err.message });   
    }
}