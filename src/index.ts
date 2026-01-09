import cron from 'node-cron';
import { getDailyEarnings as getAdMobEarnings } from './admob';
import { getDailyEarnings as getAppStoreEarnings } from './appstore';
import { sendNotification } from './notifier';
import axios from 'axios';
import 'dotenv/config';

const SCHEDULE = process.env.CRON_SCHEDULE || '0 8 * * *';
const IS_DRY_RUN = process.env.DRY_RUN === 'true';

async function runTask() {
    console.log(`[${new Date().toISOString()}] Starting daily income check...`);
    try {
        const results = await Promise.allSettled([
            getAdMobEarnings(),
            getAppStoreEarnings()
        ]);

        const admobResult = results[0];
        const appStoreResult = results[1];

        let message = `📱 <b>Apps Daily Report</b>\n\n`;

        if (admobResult.status === 'fulfilled') {
            const data = admobResult.value;
            message += `💰 <b>AdMob</b>\n📅 Date: <code>${data.date}</code>\n💵 Earnings: <b>${data.earnings} ${data.currency}</b>\n\n`;
        } else {
            const reason: any = admobResult.reason;
            console.error('AdMob failed:', reason.response?.data || reason.message);
            message += `💰 <b>AdMob</b>\n❌ <i>Error fetching data</i>\n\n`;
        }

        if (appStoreResult.status === 'fulfilled') {
            const data = appStoreResult.value;
            // data.earnings already contains the currency/currencies (e.g. "2.10 USD" or "2.10 USD + 5.00 EUR")
            message += `🍎 <b>App Store</b>\n📅 Date: <code>${data.date}</code>\n💵 Earnings: <b>${data.earnings}</b>`;
        } else {
            const reason: any = appStoreResult.reason;
            let errorData = reason.response?.data;
            if (errorData instanceof Buffer || errorData instanceof Uint8Array) {
                errorData = errorData.toString();
            }
            console.error('App Store failed:', errorData || reason.message);
            message += `🍎 <b>App Store</b>\n❌ <i>Error fetching data</i>`;
        }

        await sendNotification(message);
    } catch (error) {
        console.error('Task failed:', error);
        await sendNotification('❌ <b>Apps Report Error</b>\nCheck logs for details.');
    }
}

if (IS_DRY_RUN) {
    console.log('Running in DRY_RUN mode...');
    runTask().then(() => {
        console.log('Dry run complete. Exiting.');
        process.exit(0);
    });
} else {
    console.log(`Apps Income Notifier started. Scheduled for: ${SCHEDULE}`);
    cron.schedule(SCHEDULE, runTask);
}
