const authService = require('../services/authService');
const meetService = require('../services/meetService');

exports.createMeet = async (req, res) => {
    try {
        const auth = await authService.getAuthorizedClient(req.user);
        const event = await meetService.createGoogleMeet(auth, req.body);
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.listMeets = async (req, res) => {
    try {
        const auth = await authService.getAuthorizedClient(req.user);
        const events = await meetService.listEvents(auth);
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMeet = async (req, res) => {
    try {
        const auth = await authService.getAuthorizedClient(req.user);
        const event = await meetService.getEvent(auth, req.params.id);
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMeet = async (req, res) => {
    try {
        const auth = await authService.getAuthorizedClient(req.user);
        await meetService.deleteEvent(auth, req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMeet = async (req, res) => {
    try {
        const auth = await authService.getAuthorizedClient(req.user);
        const event = await meetService.updateEvent(auth, req.params.id, req.body);
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reverseGeocode = async (req,res) =>{
    try{
        const {lat,lng} = req.body;
        const address = await meetService.reverseGeocode(lat,lng);
        res.send({address:address});
    } catch (err){
        res.status(500).json({ error: err.message });   
    }
}