/**
 * @swagger
 * components:
 *   schemas:
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         googleId:
 *           type: string
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         authMethod:
 *           type: string
 *         nom:
 *           type: string
 *         role:
 *           type: string
 *           enum: [etudiant, professeur]
 *         matiere:
 *           type: string
 *         disponibilites:
 *           type: array
 *           items:
 *             type: string
 *         photo:
 *           type: string
 *         meetingLocations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *                   formattedAddress:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *
 *     App:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         tokenAPIKey:
 *           type: string
 *         tokenRegeneratedDate:
 *           type: string
 *           format: date-time
 *
 *     GeocodeCache:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         originalAddress:
 *           type: string
 *         formattedAddress:
 *           type: string
 *         lat:
 *           type: number
 *         lng:
 *           type: number
 *         streetNumber:
 *           type: string
 *         route:
 *           type: string
 *         postalCode:
 *           type: string
 *         city:
 *           type: string
 *         region:
 *           type: string
 *         country:
 *           type: string
 *
 *     Meeting:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         summary:
 *           type: string
 *         matiere:
 *           type: string
 *         startDateTime:
 *           type: string
 *           format: date-time
 *         endDateTime:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         hangoutLink:
 *           type: string
 *         eventId:
 *           type: string
 *         rejoinCost:
 *           type: number
 *         originalCost:
 *           type: number
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *         keywords:
 *           type: array
 *           items:
 *             type: string
 *
 *     OneToOneEvent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         etudiantId:
 *           type: string
 *         profId:
 *           type: string
 *         oneToOneEventId:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         heure:
 *           type: string
 *         mode:
 *           type: string
 *           enum: [visio, presentiel]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 */