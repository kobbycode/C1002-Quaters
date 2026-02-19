import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Booking, SiteConfig } from '../types';
import {
    generateBookingConfirmation,
    generatePreArrivalReminder,
    generateReviewRequest,
    generatePaymentReceipt
} from './email-templates';

export const EmailService = {
    /**
     * Send booking confirmation email
     */
    async sendBookingConfirmation(booking: Booking, config: SiteConfig): Promise<string> {
        try {
            const { html, text, subject } = generateBookingConfirmation(booking, config);

            // Add to 'mail' collection for Firebase Trigger Email extension
            const docRef = await addDoc(collection(db, 'mail'), {
                to: [booking.guestEmail, config.footer.email],
                message: {
                    subject,
                    html,
                    text: text || html.replace(/<[^>]*>?/gm, '') // Fallback text
                },
                metadata: {
                    bookingId: booking.id,
                    type: 'confirmation',
                    guestName: booking.guestName
                },
                createdAt: Timestamp.now()
            });

            console.log(`Confirmation email queued for booking ${booking.id}, ref: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            throw error;
        }
    },

    /**
     * Send pre-arrival reminder (2 days before)
     */
    async sendPreArrivalReminder(booking: Booking, config: SiteConfig): Promise<string> {
        try {
            const { html, text, subject } = generatePreArrivalReminder(booking, config);

            const docRef = await addDoc(collection(db, 'mail'), {
                to: [booking.guestEmail],
                message: {
                    subject,
                    html,
                    text
                },
                metadata: {
                    bookingId: booking.id,
                    type: 'pre-arrival',
                    guestName: booking.guestName
                },
                createdAt: Timestamp.now()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error sending pre-arrival email:', error);
            throw error;
        }
    },

    /**
     * Send review request (after checkout)
     */
    async sendReviewRequest(booking: Booking, config: SiteConfig): Promise<string> {
        try {
            const { html, text, subject } = generateReviewRequest(booking, config);

            const docRef = await addDoc(collection(db, 'mail'), {
                to: [booking.guestEmail],
                message: {
                    subject,
                    html,
                    text
                },
                metadata: {
                    bookingId: booking.id,
                    type: 'review-request',
                    guestName: booking.guestName
                },
                createdAt: Timestamp.now()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error sending review request email:', error);
            throw error;
        }
    },

    /**
     * Send payment receipt
     */
    async sendPaymentReceipt(booking: Booking, config: SiteConfig): Promise<string> {
        try {
            const { html, text, subject } = generatePaymentReceipt(booking, config);

            const docRef = await addDoc(collection(db, 'mail'), {
                to: [booking.guestEmail],
                message: {
                    subject,
                    html,
                    text
                },
                metadata: {
                    bookingId: booking.id,
                    type: 'receipt',
                    guestName: booking.guestName
                },
                createdAt: Timestamp.now()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error sending payment receipt:', error);
            throw error;
        }
    }
};
