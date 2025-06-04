const moment = require('moment');
const { google } = require('googleapis');

require('dotenv').config();

exports.addGoogleCalendarEvent = async (req,res,next) =>{
    try{

      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials({ access_token: req.user.accessToken });

      const formData = req.body;
      // formData.disponibilites = "08:00 - 10:00" par ex.
      const [startHour, endHour] = formData.disponibilites.split(' - ');
      const startDateTime = moment(`${formData.date}T${startHour}`).toISOString();
      const endDateTime   = moment(`${formData.date}T${endHour}`).toISOString();
      
      const prof = await fetch(`http://localhost:4000/professeurs/${formData.profId}`)
      .then(res => {
        if (!res.ok) throw new Error("404");
        return res.json();
      })

      const event = {
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
      
      const calendar = google.calendar({version: 'v3',auth:auth});

      calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        res.send({success: true});
    } catch (err){
        next(err);
        res.status(500).json({ error: err.message });   
    }
}

exports.addIcalEvent = async (req,res,next) =>{
    try{
        console.log("pas de bol");
        res.send({success: true});
    } catch (err){
        next(err);
        res.status(500).json({ error: err.message });   
    }
}