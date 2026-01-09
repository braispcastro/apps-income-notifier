import { admob } from '@googleapis/admob';
import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config';

const CLIENT_ID = process.env.AD_MOB_CLIENT_ID;
const CLIENT_SECRET = process.env.AD_MOB_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.AD_MOB_REFRESH_TOKEN;
const ACCOUNT_ID = process.env.AD_MOB_ACCOUNT_ID;

const auth = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
auth.setCredentials({ refresh_token: REFRESH_TOKEN });

export async function getDailyEarnings() {
    if (!ACCOUNT_ID) throw new Error('AD_MOB_ACCOUNT_ID is not set');

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const dateStr = formatDate(yesterday);

    try {
        // Explicitly get a token to ensure the header is present
        const headers = await auth.getRequestHeaders();
        const admobClient = admob({ version: 'v1', auth });

        const response = await admobClient.accounts.networkReport.generate({
            parent: `accounts/${ACCOUNT_ID}`,
            requestBody: {
                reportSpec: {
                    dateRange: {
                        startDate: { year: yesterday.getFullYear(), month: yesterday.getMonth() + 1, day: yesterday.getDate() },
                        endDate: { year: yesterday.getFullYear(), month: yesterday.getMonth() + 1, day: yesterday.getDate() },
                    },
                    metrics: ['ESTIMATED_EARNINGS'],
                    // Optional: Add dimensions like 'DATE' if you want a more detailed breakdown
                },
            },
        }, {
            headers: headers as any
        });

        const reportData = response.data as any[];

        let totalEarningsMicros = 0;
        let currencyCode = 'USD';

        for (const item of reportData) {
            if (item.header && item.header.localizationSettings) {
                currencyCode = item.header.localizationSettings.currencyCode || 'USD';
            }
            if (item.row && item.row.metricValues && item.row.metricValues.ESTIMATED_EARNINGS) {
                const micros = item.row.metricValues.ESTIMATED_EARNINGS.microsValue;
                totalEarningsMicros += parseInt(micros || '0', 10);
            }
        }

        const earnings = totalEarningsMicros / 1000000;
        return {
            date: dateStr,
            earnings: earnings.toFixed(2),
            currency: currencyCode
        };
    } catch (error: any) {
        console.error('Error fetching AdMob report:', error.response?.data || error.message);
        throw error;
    }
}

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
