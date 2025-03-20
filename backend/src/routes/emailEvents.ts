import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import emailEvent from '../models/EmailEvent';
import { Router } from 'express';

const router = Router();
dotenv.config()
const isAdmin = (req: express.Request, res: express.Response, next:express.NextFunction) => {
    if(req.headers.key === process.env.JWT_SECRET){
        return next();
    }
    return res.status(403).json({message:"Error: Admin Authorization Required"});
}
router.get('/', isAdmin, async (req, res) => {
    try {
        const events = await emailEvent.find();
        return res.json(events);
    } catch(err) {
        return res.status(500).json({message:"Error retrieving email events"})
    }
});

router.get('/stats', (req, res) => {

});

router.post('/webhook', async (req, res) => {
    try {
        const {emailId, userId, type, metadata } = req.body;
        if(!emailId || !userId || !type){
            return res.status(400).json({message: "Missing required fields"})
        }
        await emailEvent.create({
            emailId,
            userId: new mongoose.Schema.Types.ObjectId(userId),
            type,
            metadata,
            timestamp: new Date(),
        })
    } catch(err) {
        return res.status(500).json({message: "Error uploading data"})
    }
});

export default Router;