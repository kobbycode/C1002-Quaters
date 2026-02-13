import React, { useEffect, useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { collection, query, orderBy, limit, getDocs, where, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { EmailScheduler } from '../../utils/email-scheduler';
import { useToast } from '../../context/ToastContext';

interface EmailLog {
    id: string;
    to: string[];
    message: {
        subject: string;
    };
    metadata?: {
        type: string;
        bookingId: string;
        guestName: string;
    };
    delivery?: {
        state: string;
        startTime: any;
        endTime: any;
        error?: string;
    };
    createdAt: any;
}

export const AdminEmails: React.FC = () => {
    const { bookings, config } = useSite();
    const { showToast } = useToast();
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [stats, setStats] = useState({
        sent: 0,
        errors: 0,
        pending: 0
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'mail'), orderBy('createdAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailLog));
            setLogs(data);

            // Calculate simple stats from these logs
            const sent = data.filter(l => l.delivery?.state === 'SUCCESS').length;
            const errors = data.filter(l => l.delivery?.state === 'ERROR').length;
            const pending = data.filter(l => !l.delivery?.state || l.delivery?.state === 'PENDING').length;
            setStats({ sent, errors, pending });
        } catch (err) {
            console.error("Failed to fetch email logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleRunScheduler = async () => {
        setRunning(true);
        try {
            const result = await EmailScheduler.runChecks(bookings, config);
            showToast(`Scheduler ran: ${result.sent} emails queued, ${result.errors} errors`);
            fetchLogs(); // Refresh logs
        } catch (err) {
            showToast('Scheduler failed', 'error');
        } finally {
            setRunning(false);
        }
    };

    const handleSendTestEmail = async () => {
        setRunning(true);
        try {
            await addDoc(collection(db, 'mail'), {
                to: [config.footer.email || 'user@example.com'],
                message: {
                    subject: 'Test Email from C1002 Quarters',
                    html: '<h1>Success!</h1><p>Your email system is working correctly.</p>',
                    text: 'Success! Your email system is working correctly.'
                },
                metadata: {
                    type: 'test',
                    bookingId: 'TEST-ID',
                    guestName: 'Test User'
                },
                createdAt: new Date()
            });
            showToast('Test email queued!');
            setTimeout(fetchLogs, 1000);
        } catch (err) {
            console.error(err);
            showToast('Failed to send test email', 'error');
        } finally {
            setRunning(false);
        }
    };

    const templates = [
        { id: 'confirmation', name: 'Booking Confirmation', trigger: 'Immediate upon booking' },
        { id: 'pre-arrival', name: 'Pre-Arrival Reminder', trigger: '2 days before check-in' },
        { id: 'review-request', name: 'Review Request', trigger: '2 days after check-out' },
        { id: 'payment-receipt', name: 'Payment Receipt', trigger: 'Upon successful payment' }
    ];

    return (
        <div className="space-y-12 animate-fade-in pb-20">

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-charcoal p-8 rounded-[2rem] shadow-xl shadow-charcoal/20 text-white relative overflow-hidden col-span-1 md:col-span-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] pointer-events-none" />
                    <h3 className="text-2xl font-black font-serif mb-2">Email System</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Automated Guest Communications</p>

                    <div className="flex flex-wrap gap-4 mt-6">
                        <button
                            onClick={handleRunScheduler}
                            disabled={running}
                            className="bg-gold text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {running ? <span className="animate-spin">↻</span> : '⚡'}
                            {running ? 'Processing...' : 'Run Scheduler'}
                        </button>
                        <button
                            onClick={handleSendTestEmail}
                            disabled={running}
                            className="bg-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span>✉️</span> Send Test Email
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Recent Success</p>
                    <p className="text-4xl font-black text-green-500">{stats.sent}</p>
                    <p className="text-[9px] font-bold text-gray-300 mt-1">Last 50 Logs</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Pending / Errors</p>
                    <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-gold">{stats.pending}</p>
                        <p className="text-xl font-black text-red-400 mb-1">/ {stats.errors}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Logs Section */}
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-xl font-black font-serif text-charcoal">Transmission Log</h3>
                        <button onClick={fetchLogs} className="text-gold hover:text-charcoal transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                        {loading ? (
                            <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Loading logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No email logs found</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">To</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Subject</th>
                                        <th className="px-6 py-4 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${log.delivery?.state === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                                                    log.delivery?.state === 'ERROR' ? 'bg-red-50 text-red-500' :
                                                        'bg-yellow-50 text-yellow-600'
                                                    }`}>
                                                    {log.delivery?.state || 'QUEUED'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-charcoal">{log.to?.join(', ')}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500 uppercase font-bold">{log.metadata?.type || '-'}</td>
                                            <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{log.message.subject}</td>
                                            <td className="px-6 py-4 text-right text-xs text-gray-400 font-mono">
                                                {log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Templates Section */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black font-serif text-charcoal mb-6">Active Templates</h3>
                        <div className="space-y-4">
                            {templates.map(t => (
                                <div key={t.id} className="p-4 border border-gray-100 rounded-xl hover:border-gold/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-black text-charcoal text-sm">{t.name}</p>
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <span>Trigger:</span>
                                        <span className="text-gold group-hover:text-charcoal transition-colors">{t.trigger}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gold/5 border border-gold/10 p-8 rounded-[2.5rem]">
                        <div className="flex gap-4 items-start">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h4 className="font-black font-serif text-charcoal mb-2">System Status</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                    The scheduler runs automatically when the admin panel is active. It checks for upcoming arrivals and recent checkouts once per session.
                                    <br /><br />
                                    Emails are sent via Firebase Extension using your configured SMTP provider.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
