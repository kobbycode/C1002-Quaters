import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking, Room, SiteConfig } from '../types';
import { formatPrice } from './formatters';

export const ExportService = {
    /**
     * Export generic data to CSV
     */
    exportToCSV: (data: any[], filename: string) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `${filename}.csv`);
    },

    /**
     * Export Bookings to Excel with formatting
     */
    exportBookingsToExcel: (bookings: Booking[], rooms: Room[]) => {
        const data = bookings.map(b => {
            const room = rooms.find(r => r.id === b.roomId);
            return {
                'Booking ID': b.id,
                'Guest Name': b.guestName,
                'Guest Email': b.guestEmail,
                'Room': room ? room.name : 'Unknown Room',
                'Check-In': b.checkInDate,
                'Check-Out': b.checkOutDate,
                'Nights': b.nights,
                'Total Price': b.totalPrice,
                'Status': b.status,
                'Payment Status': b.paymentStatus,
                'Booked On': new Date(b.date).toLocaleDateString()
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, `c1002-bookings-${new Date().toISOString().split('T')[0]}.xlsx`);
    },

    /**
     * Export Financial Report to PDF
     */
    exportFinancialsToPDF: (stats: any, bookings: Booking[], config: SiteConfig) => {
        const doc = new jsPDF();
        const currency = config.currency || 'GHS';
        const dateStr = new Date().toLocaleDateString();

        // Header
        doc.setFillColor(20, 20, 20); // Dark background
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text(config.brand.name.toUpperCase(), 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(197, 160, 89); // Gold
        doc.text(`FINANCIAL REPORT GENERATED ON ${dateStr.toUpperCase()}`, 14, 30);

        // Summary Metrics
        let yPos = 55;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("Executive Summary", 14, yPos);

        yPos += 10;
        const summaryData = [
            ['Total Revenue', formatPrice(stats.realizedRevenue, currency)],
            ['Occupancy Rate', `${stats.occupancyRate}%`],
            ['RevPAR', formatPrice(parseInt(stats.revPAR), currency)],
            ['Avg Stay Duration', `${stats.avgStayDuration} Nights`]
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        // Room Performance
        yPos = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.text("Performance by Room", 14, yPos);

        const roomData = stats.roomPerformance.map((r: any) => [
            r.name,
            `${r.occupancy}%`,
            formatPrice(r.revenue, currency),
            r.score
        ]);

        autoTable(doc, {
            startY: yPos + 5,
            head: [['Room Name', 'Occupancy', 'Revenue', 'Perf. Score']],
            body: roomData,
            theme: 'striped',
            headStyles: { fillColor: [197, 160, 89], textColor: [255, 255, 255] }
        });

        // Forecast
        yPos = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.text("30-Day Forecast", 14, yPos);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Projected Revenue: ${formatPrice(stats.forecastedRevenue, currency)}`, 14, yPos + 8);

        // Strategic Insight
        yPos += 20;
        doc.setFillColor(245, 245, 245);
        doc.rect(14, yPos, 180, 25, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text("STRATEGIC INSIGHT", 20, yPos + 8);
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);

        const splitInsight = doc.splitTextToSize(stats.strategicInsight, 170);
        doc.text(splitInsight, 20, yPos + 16);

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Confidential - For Internal Use Only - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }

        doc.save(`c1002-financial-report-${dateStr.replace(/\//g, '-')}.pdf`);
    }
};
