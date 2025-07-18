const moment = require('moment');
const { google } = require('googleapis');
const authService = require('../services/authService');
const User = require ('../models/User');
const { createEvent} = require('ics');
require('dotenv').config();


function convertDateToISO(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
}


exports.addGoogleCalendarEvent = async (req,res,next) =>{
    try{
      const auth = await authService.getAuthorizedClient(req.user);

      const formData = req.body;
      // formData.disponibilites = "08:00 - 10:00" par ex.
      const [datePart, timePart] = formData.disponibilites.split(' ');
      const isoDate = convertDateToISO(datePart);  // conversion ici

      const [startHour, endHour] = timePart.split('-').map(s => s.trim());

      const startDateTime = moment(`${isoDate}T${startHour}:00`).toISOString();
      const endDateTime = moment(`${isoDate}T${endHour}:00`).toISOString();

      const prof = await User.findOne({ _id: formData.profId, role: "professeur" });

      let event = {
        summary: `Cours de ${formData.chapitres} avec ${prof.nom}`,
        description: `Cours pour la classe ${formData.classe}`,
        start: {
          dateTime: startDateTime,
          timeZone: "Europe/Paris",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "Europe/Paris",
        },
      };
      if(formData.location && formData.location !== '') event.location = formData.location;
      if (formData.mode === 'visio'){
        event.conferenceData = {
          createRequest: {
            requestId: Math.random().toString(36).substring(2, 15),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      }
      const calendar = google.calendar({version: 'v3',auth:auth});
      calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
      });

      res.send({success: true});
    } catch (err){
        next(err);
        return res.status(500).json({ error: err.message });   
    }
}

exports.addIcalEvent = async (req,res,next) =>{
    try{
        const formData = req.body;

        const [datePart, timePart] = formData.disponibilites.split(' ');
        const isoDate = convertDateToISO(datePart);  // conversion ici

        const [startHour, endHour] = timePart.split('-').map(s => s.trim());

        const startDateTime = moment(`${isoDate}T${startHour}:00`);
        const endDateTime = moment(`${isoDate}T${endHour}:00`);

        const durationMs =  moment.duration(endDateTime.diff(startDateTime));
        
        const prof = await fetch(`http://localhost:4000/professeurs/${formData.profId}`)
        .then(res => {
          if (!res.ok) throw new Error("404");
          return res.json();
        })

        const event = {
          title: `Cours de ${formData.chapitres} avec ${prof.nom}`,
          description: `Cours pour la classe ${formData.classe}`,
          start:[startDateTime.year(),startDateTime.month()+1,startDateTime.date(),startDateTime.hour(),startDateTime.minute()], //[YYYY, M, D, H, M]
          url: 'http://localhost:3000',
          organizer:{ name: 'CoursWap'},
          startOutputType: 'local',
          duration:{ hours: durationMs.hours(), minutes: durationMs.minutes() },
        };
        if(formData.mode === 'presentiel') {
          if(formData.location && formData.location !== '') event.location = formData.location;
        } else if(formData.mode === 'visio') event.location = 'Jitsi Online meeting';

        createEvent(event,(error,value)=>{
          if(error) return res.status(500).send('Failed to generate iCal Event.');

          res.setHeader('Content-Type', 'text/calendar');
          res.setHeader('Content-Disposition', 'attachment; filename=event.ics');
          res.send(value);
        })
    } catch (err){
        next(err);
        return res.status(500).json({ error: err.message });   
    }
}