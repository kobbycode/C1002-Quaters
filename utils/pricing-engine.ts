import { Room, PricingRule } from '../types';

interface PriceBreakdown {
    basePrice: number;
    totalNights: number;
    subtotal: number;
    adjustments: {
        ruleName: string;
        amount: number;
    }[];
    finalTotal: number;
    averageNightlyRate: number;
}

export const PricingEngine = {
    calculatePrice: (
        room: Room,
        checkIn: Date,
        checkOut: Date,
        rules: PricingRule[] = []
    ): PriceBreakdown => {
        const activeRules = rules.filter(r => r.isActive);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        let totalBasePrice = 0;
        let totalAdjustments = 0;
        const appliedAdjustments: { ruleName: string, amount: number }[] = [];

        // Iterate through each night
        for (let i = 0; i < nights; i++) {
            const currentNight = new Date(checkIn);
            currentNight.setDate(checkIn.getDate() + i);

            const nightBasePrice = room.price;
            totalBasePrice += nightBasePrice;

            // Apply Nightly Rules (Seasonal, Weekend, Custom Dates)
            // Priority: Custom Date > Seasonal > Weekend
            // For simplicity in this version, we sum all percentage adjustments applicable to the date

            let nightAdjustmentPercent = 0;
            let nightFixedAdjustment = 0;

            activeRules.forEach(rule => {
                if (!isRuleApplicableToRoom(rule, room)) return;

                // Check Date Validity
                if (rule.type === 'seasonal' || rule.type === 'custom') {
                    if (rule.startDate && rule.endDate) {
                        const start = new Date(rule.startDate);
                        const end = new Date(rule.endDate);
                        if (currentNight < start || currentNight > end) return;
                    }
                }

                // Check Day of Week
                if (rule.type === 'weekend' && rule.daysOfWeek) {
                    if (!rule.daysOfWeek.includes(currentNight.getDay())) return;
                }

                // Apply Adjustment
                if (rule.type !== 'long-stay') { // Long stay is applied to total
                    if (rule.adjustmentType === 'percentage') {
                        nightAdjustmentPercent += rule.value;
                    } else {
                        nightFixedAdjustment += rule.value;
                    }
                }
            });

            const nightAdjustment = (nightBasePrice * (nightAdjustmentPercent / 100)) + nightFixedAdjustment;
            totalAdjustments += nightAdjustment;
        }

        // Apply Long Stay Rules (Applied to the subtotal of base price + nightly adjustments)
        const subtotal = totalBasePrice + totalAdjustments;
        let longStayAdjustment = 0;

        activeRules.filter(r => r.type === 'long-stay').forEach(rule => {
            if (!isRuleApplicableToRoom(rule, room)) return;
            if (rule.minNights && nights >= rule.minNights) {
                if (rule.adjustmentType === 'percentage') {
                    // Usually long stay is a discount, so value might be -10.
                    longStayAdjustment += subtotal * (rule.value / 100);
                    appliedAdjustments.push({ ruleName: rule.name, amount: subtotal * (rule.value / 100) });
                } else {
                    longStayAdjustment += rule.value;
                    appliedAdjustments.push({ ruleName: rule.name, amount: rule.value });
                }
            }
        });

        // Consolidate other adjustments for display
        if (totalAdjustments !== 0) {
            appliedAdjustments.unshift({ ruleName: 'Seasonal/Weekend Adjustments', amount: totalAdjustments });
        }

        const finalTotal = subtotal + longStayAdjustment;

        return {
            basePrice: room.price,
            totalNights: nights,
            subtotal: totalBasePrice,
            adjustments: appliedAdjustments,
            finalTotal: Math.max(0, finalTotal), // Price cannot be negative
            averageNightlyRate: finalTotal / nights
        };
    }
};

const isRuleApplicableToRoom = (rule: PricingRule, room: Room): boolean => {
    if (!rule.roomCategories || rule.roomCategories.length === 0 || rule.roomCategories.includes('all')) {
        return true;
    }
    return rule.roomCategories.includes(room.category) || rule.roomCategories.includes(room.id);
};
