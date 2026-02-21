import React, { useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { Review } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminReviews: React.FC = () => {
    const { reviews, updateReview, deleteReview, logActivity } = useSite();
    const { showToast } = useToast();

    const pendingReviews = useMemo(() => reviews.filter(r => r.status === 'pending'), [reviews]);
    const approvedReviews = useMemo(() => reviews.filter(r => r.status === 'approved'), [reviews]);

    const handleApprove = async (id: string) => {
        try {
            const review = reviews.find(r => r.id === id);
            await updateReview(id, { status: 'approved' });
            if (review) {
                await logActivity({
                    type: 'review',
                    action: 'Review Approved',
                    details: `Moderator approved review from ${review.guestName} for ${review.roomName}.`,
                    metadata: { reviewId: id }
                });
            }
            showToast('Review approved and published', 'success');
        } catch (err) {
            showToast('Failed to approve review', 'error');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const review = reviews.find(r => r.id === id);
            await updateReview(id, { status: 'rejected' });
            if (review) {
                await logActivity({
                    type: 'review',
                    action: 'Review Rejected',
                    details: `Moderator rejected review from ${review.guestName} for ${review.roomName}.`,
                    metadata: { reviewId: id }
                });
            }
            showToast('Review marked as rejected', 'success');
        } catch (err) {
            showToast('Failed to reject review', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
        try {
            await deleteReview(id);
            showToast('Review deleted permanently', 'success');
        } catch (err) {
            showToast('Failed to delete review', 'error');
        }
    };

    const ReviewCard: React.FC<{ review: Review, type: 'pending' | 'approved' }> = ({ review, type }) => (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {type === 'pending' && <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full pointer-events-none" />}

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center text-gold font-black text-sm">
                        {review.guestName.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-black text-charcoal">{review.guestName}</p>
                        <p className="text-[10px] text-gold font-bold uppercase tracking-widest">{review.roomName}</p>
                    </div>
                </div>
                <div className="flex text-gold text-[10px]">
                    {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                    ))}
                </div>
            </div>

            <p className="text-gray-500 text-xs leading-relaxed italic mb-4 line-clamp-4 relative z-10">"{review.comment}"</p>

            {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-6 relative z-10">
                    {review.images.map((img, idx) => (
                        <a
                            key={idx}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-lg overflow-hidden border border-gray-100 hover:border-gold transition-colors"
                        >
                            <img src={img} alt="Guest" className="w-full h-full object-cover" />
                        </a>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                    {new Date(review.date).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                    {type === 'pending' ? (
                        <>
                            <button
                                onClick={() => handleApprove(review.id)}
                                className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleReject(review.id)}
                                className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                            >
                                Reject
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleDelete(review.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in">
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-yellow-400 rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">Pending Moderation</h3>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {pendingReviews.length} New
                    </span>
                </div>
                {pendingReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pendingReviews.map(r => <ReviewCard key={r.id} review={r} type="pending" />)}
                    </div>
                ) : (
                    <div className="bg-white/50 border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No reviews awaiting moderation</p>
                    </div>
                )}
            </section>

            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-green-400 rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">Published Reviews</h3>
                </div>
                {approvedReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {approvedReviews.map(r => <ReviewCard key={r.id} review={r} type="approved" />)}
                    </div>
                ) : (
                    <div className="bg-white/50 border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No published reviews yet</p>
                    </div>
                )}
            </section>
        </div>
    );
};
