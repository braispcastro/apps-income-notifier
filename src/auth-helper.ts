import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';
import 'dotenv/config';

const CLIENT_ID = process.env.AD_MOB_CLIENT_ID;
const CLIENT_SECRET = process.env.AD_MOB_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Error: AD_MOB_CLIENT_ID and AD_MOB_CLIENT_SECRET must be set in .env');
    process.exit(1);
}

const oauth2Client = new OAuth2Client(
    CLIENT_ID,
    CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob' // This is for "Desktop App" flow
);

const SCOPES = ['https://www.googleapis.com/auth/admob.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Critical for getting a refresh_token
    scope: SCOPES,
    prompt: 'consent' // Forces consent screen to ensure refresh token is provided
});

console.log('🚀 Step 1: Visit this URL to authorize the app:');
console.log('\n' + authUrl + '\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('🚀 Step 2: Paste the code from the browser here: ', async (code) => {
    rl.close();
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n✅ Authorization Successful!');
        console.log('\n--- YOUR REFRESH TOKEN ---');
        console.log(tokens.refresh_token);
        console.log('--------------------------\n');
        console.log('👉 Copy this refresh token into your .env file as AD_MOB_REFRESH_TOKEN');
    } catch (error: any) {
        console.error('❌ Error getting tokens:', error.response?.data || error.message);
    }
});
