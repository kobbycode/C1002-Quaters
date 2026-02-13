import { db } from './firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Booking, SiteConfig } from '../types';
import { EmailService } from './email-service';

export const EmailScheduler = {
    /**
     * Run all scheduled email checks
     * Should be called periodically (e.g. when admin dashboard loads)
     */
    async runChecks(bookings: Booking[], config: SiteConfig): Promise<{ sent: number, errors: number }> {
        console.log('Running email scheduler...');
        let sentCount = 0;
        let errorCount = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Check for Pre-Arrival Reminders (2 days before check-in)
        const upcomingBookings = bookings.filter(b => {
            if (!b.isoCheckIn || b.status === 'cancelled') return false;
            const checkIn = new Date(b.isoCheckIn);
            checkIn.setHours(0, 0, 0, 0);

            const diffTime = checkIn.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays === 2;
        });

        console.log(`Found ${upcomingBookings.length} bookings due for pre-arrival reminder`);

        for (const booking of upcomingBookings) {
            const alreadySent = await this.checkIfSent(booking.id, 'pre-arrival');
            if (!alreadySent) {
                try {
                    await EmailService.sendPreArrivalReminder(booking, config);
                    sentCount++;
                } catch (e) {
                    console.error(`Failed to send pre-arrival to ${booking.id}`, e);
                    errorCount++;
                }
            }
        }

        // 2. Check for Review Requests (2 days after check-out)
        const pastBookings = bookings.filter(b => {
            if (!b.isoCheckOut || b.status === 'cancelled') return false;
            const checkOut = new Date(b.isoCheckOut);
            checkOut.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - checkOut.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays === 2;
        });

        console.log(`Found ${pastBookings.length} bookings due for review request`);

        for (const booking of pastBookings) {
            const alreadySent = await this.checkIfSent(booking.id, 'review-request');
            if (!alreadySent) {
                try {
                    await EmailService.sendReviewRequest(booking, config);
                    sentCount++;
                } catch (e) {
                    console.error(`Failed to send review request to ${booking.id}`, e);
                    errorCount++;
                }
            }
        }

        return { sent: sentCount, errors: errorCount };
    },

    /**
     * Check if a specific email type has already been sent for a booking
     */
    async checkIfSent(bookingId: string, type: string): Promise<boolean> {
        try {
            const q = query(
                collection(db, 'mail'),
                where('metadata.bookingId', '==', bookingId),
                where('metadata.type', '==', type)
            );

            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (e) {
            console.error(`Error checking email status for ${bookingId} ${type}`, e);
            return false; // Default to false but log error. Might risk double sending if DB fails, but safer than not sending?
            // Actually, if DB fails, we probably can't send either.
        }
    }
};
