
import { collection, doc, writeBatch, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ROOMS } from '../constants';
import { SiteConfig } from '../types';

export const seedDatabase = async (config: SiteConfig) => {
    try {
        const batch = writeBatch(db);

        // 1. Seed Rooms
        const roomsCollection = collection(db, 'rooms');
        console.log('Syncing rooms registry...');

        // We use setDoc for each room to ensure it's either created or updated
        for (const room of ROOMS) {
            const roomRef = doc(roomsCollection, room.id);
            batch.set(roomRef, room, { merge: true });
        }

        // 2. Seed Config/Settings
        console.log('Seeding config...');
        const settingsRef = doc(db, 'settings', 'config');
        batch.set(settingsRef, config, { merge: true });

        await batch.commit();
        console.log('Database synced successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding database:', error);
        return false;
    }
};
