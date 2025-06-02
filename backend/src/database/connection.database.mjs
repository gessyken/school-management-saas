/**
 * @description This file establishes a connection to the MongoDB database using Mongoose.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connection = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/mit_project";
        
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(uri, {});
        
        console.log('Successfully connected to MongoDB.');
        return mongoose.connection; // Return the Mongoose connection
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connection;