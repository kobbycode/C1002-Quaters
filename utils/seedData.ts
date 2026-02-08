
import { collection, doc, writeBatch, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ROOMS } from '../constants';
import { SiteConfig } from '../types';

export const seedDatabase = async (config: SiteConfig) => {
    try {
        const batch = writeBatch(db);

        // 1. Seed Rooms
        const roomsCollection = collection(db, 'rooms');
        const roomsSnapshot = await getDocs(roomsCollection);

        if (roomsSnapshot.empty) {
            console.log('Seeding rooms...');
            ROOMS.forEach(room => {
                const roomRef = doc(roomsCollection, room.id);
                batch.set(roomRef, room);
            });
        } else {
            console.log('Rooms collection not empty, skipping seed.');
        }

        // 2. Seed Config/Settings
        // We store the global site config in a 'settings' collection, doc 'general'
        const settingsRef = doc(db, 'settings', 'general');
        // We overwrite or set merge: true. Let's use set with merge to be safe, 
        // but typically we want the initial config to be there.
        // For now, let's just set it if it doesn't exist? Or just overwrite.
        // Given this is "seeding", let's overwrite to ensure we have the latest structure 
        // IF it doesn't exist?
        // Actually, `setDoc` without merge overwrites.

        // Let's check if it exists first to avoid overwriting user changes if they ran this twice
        // But for the very first run, we want to write it.
        // Since we are migrating from local storage, we might want to pass the CURRENT config 
        // (which might be in local storage) to this function.
        console.log('Seeding config...');
        batch.set(settingsRef, config);

        await batch.commit();
        console.log('Database seeded successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding database:', error);
        return false;
    }
};
