import cron from 'node-cron';
import { getDailyEarnings as getAdMobEarnings } from './admob';

import { sendNotification } from './notifier';
import axios from 'axios';
import 'dotenv/config';

const SCHEDULE = process.env.CRON_SCHEDULE || '0 8 * * *';
const IS_DRY_RUN = process.env.DRY_RUN === 'true';

async function runTask() {
    console.log(`[${new Date().toISOString()}] Starting daily income check...`);
    try {
        const admobResult = await getAdMobEarnings();

        let message = `📱 <b>Apps Daily Report</b>\n\n`;
        message += `💰 <b>AdMob</b>\n📅 Date: <code>${admobResult.date}</code>\n💵 Ganancias: <b>${admobResult.earnings} ${admobResult.currency}</b>`;

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
