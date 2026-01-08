import cron from 'node-cron';
import { getDailyEarnings } from './admob';
import { sendNotification } from './notifier';
import 'dotenv/config';

const SCHEDULE = process.env.CRON_SCHEDULE || '0 8 * * *';
const IS_DRY_RUN = process.env.DRY_RUN === 'true';

async function runTask() {
    console.log(`[${new Date().toISOString()}] Starting income check...`);
    try {
        const data = await getDailyEarnings();
        const message = `💰 <b>AdMob Daily Report</b>\n\n📅 Date: <code>${data.date}</code>\n💵 Earnings: <b>${data.earnings} ${data.currency}</b>`;
        await sendNotification(message);
    } catch (error) {
        console.error('Task failed:', error);
        await sendNotification('❌ <b>AdMob Report Error</b>\nCheck logs for details.');
    }
}

if (IS_DRY_RUN) {
    console.log('Running in DRY_RUN mode...');
    runTask().then(() => {
        console.log('Dry run complete. Exiting.');
        process.exit(0);
    });
} else {
    console.log(`Income Notifier started. Scheduled for: ${SCHEDULE}`);
    cron.schedule(SCHEDULE, runTask);
}
