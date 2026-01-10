import * as jose from 'jose';
import axios from 'axios';
import { gunzipSync } from 'zlib';

const ISSUER_ID = process.env.APP_STORE_ISSUER_ID;
const KEY_ID = process.env.APP_STORE_KEY_ID;
const PRIVATE_KEY = process.env.APP_STORE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/\r/g, '');
const VENDOR_NUMBER = process.env.APP_STORE_VENDOR_NUMBER;

async function generateJWT() {
    if (!PRIVATE_KEY || !ISSUER_ID || !KEY_ID) {
        throw new Error('Missing App Store Connect credentials');
    }

    const alg = 'ES256';
    const privateKey = await jose.importPKCS8(PRIVATE_KEY, alg);

    return await new jose.SignJWT({})
        .setProtectedHeader({ alg, kid: KEY_ID })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 10)
        .setIssuer(ISSUER_ID)
        .setAudience('appstoreconnect-v1')
        .setExpirationTime('10m')
        .sign(privateKey);
}

export async function getDailyEarnings() {
    try {
        const token = await generateJWT();

        // Calculate date for 2 days ago (to ensure report availability)
        // Note: Apple reports for 'Day X' often contain data that users see as 'Day X-1' in their dashboard due to timezones
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - 2);

        // Use local date parts to avoid UTC shift
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const reportDate = `${year}-${month}-${day}`;

        // Display date matches the report date (no offset needed as verified by user)
        const displayDate = reportDate;

        const response = await axios.get('https://api.appstoreconnect.apple.com/v1/salesReports', {
            params: {
                'filter[reportType]': 'SALES',
                'filter[reportSubType]': 'SUMMARY',
                'filter[frequency]': 'DAILY',
                'filter[reportDate]': reportDate,
                'filter[vendorNumber]': VENDOR_NUMBER,
                'filter[version]': '1_0'
            },
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: 'arraybuffer'
        });

        // The response is a GZIP compressed TSV file
        const buffer = Buffer.from(response.data);
        const decompressed = gunzipSync(buffer).toString('utf-8');

        const lines = decompressed.split('\n');
        if (lines.length < 2) {
            return { earnings: '0.00 EUR', date: displayDate };
        }

        // TSV Structure: The last columns usually contain quantity and price
        // We need to find the "Developer Proceeds" column. 
        // In a SUMMARY SALES report, it's typically column 10 (index 9) or similar.
        const headerLine = lines[0];
        const header = headerLine.split('\t');
        const proceedsIndex = header.indexOf('Developer Proceeds');
        const currencyIndex = header.indexOf('Currency of Proceeds');

        if (proceedsIndex === -1) {
            return { earnings: '0.00 EUR', date: displayDate };
        }

        const earningsByCurrency = new Map<string, number>();

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            const columns = line.split('\t');

            if (columns.length > proceedsIndex) {
                const proceedsStr = columns[proceedsIndex];
                const currencyStr = columns[currencyIndex];

                if (proceedsStr && currencyStr) {
                    const proceeds = parseFloat(proceedsStr.replace(',', '.'));
                    if (!isNaN(proceeds) && proceeds !== 0) {
                        const current = earningsByCurrency.get(currencyStr) || 0;
                        earningsByCurrency.set(currencyStr, current + proceeds);
                    }
                }
            }
        }

        if (earningsByCurrency.size === 0) {
            return { earnings: '0.00 USD', date: displayDate };
        }

        // Calculate total in USD
        let totalUsd = 0;
        let conversionFailed = false;
        let rates: any = {};

        try {
            rates = await getExchangeRates();
        } catch (e) {
            console.error('Failed to fetch exchange rates, falling back to multi-currency display');
            conversionFailed = true;
        }

        if (!conversionFailed) {
            for (const [currency, amount] of earningsByCurrency.entries()) {
                if (currency === 'USD') {
                    totalUsd += amount;
                } else {
                    const rate = rates[currency];
                    if (rate) {
                        // Rate is USD based (e.g. 1 USD = X EUR)
                        // To get USD from EUR: Amount / Rate
                        totalUsd += amount / rate;
                    } else {
                        console.warn(`No exchange rate found for ${currency}`);
                        conversionFailed = true; // Fallback if any currency is missing rate
                        break;
                    }
                }
            }
        }

        if (!conversionFailed) {
            return {
                earnings: `${totalUsd.toFixed(2)} USD`,
                date: displayDate
            };
        }

        const formattedEarnings = Array.from(earningsByCurrency.entries())
            .map(([curr, amount]) => `${amount.toFixed(2)} ${curr}`)
            .join(' + ');

        return {
            earnings: formattedEarnings, // Returns string like "2.10 USD + 5.00 EUR"
            date: displayDate
        };
    } catch (error: any) {
        let errorData = error.response?.data;
        if (errorData instanceof Buffer || errorData instanceof Uint8Array) {
            errorData = errorData.toString();
        }
        console.error('Error fetching App Store earnings:', errorData || error.message);
        throw error;
    }
}

async function getExchangeRates() {
    try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');
        return response.data.rates;
    } catch (error) {
        throw new Error('Could not fetch exchange rates');
    }
}
