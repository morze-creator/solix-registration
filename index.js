const fs = require('fs');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const  TwoCaptcha  =  require ( "@2captcha/captcha-solver" ) 
const UserAgent = require('user-agents');

// Configuration
const REGISTER_URL = 'https://api.solixdepin.net/api/auth/register';
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const apiKey = config.twoCaptchaApiKey;

const solver = new TwoCaptcha.Solver(apiKey);

const emails = fs.readFileSync('emails.txt', 'utf8')
    .split('\n')
    .map(line => line.replace(/\r$/, '').trim()) // Remove \r and trim spaces
    .filter(line => line.length > 0);
const proxies = fs.readFileSync('proxy.txt', 'utf8').split('\n').filter(line => line.trim());
const referralCodes = fs.readFileSync('ref.txt', 'utf8').split('\n').filter(line => line.trim());

async function solveCaptcha() {
    try {
        const result = await solver.cloudflareTurnstile({
            pageurl: "https://dashboard.solixdepin.net/sign-up",
            sitekey: "0x4AAAAAABD9Dqblkacz6ou7",
            soft_id: 4835
        });
        return result.data;
    } catch (error) {
        console.error('Error solving captcha:', error);
        return null;
    }
}

// Function to get random PC User-Agent
function getRandomUserAgent() {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    return userAgent.toString();
}

// Function to get random referral code
function getRandomReferralCode() {
    if (referralCodes.length === 0) return '';
    return referralCodes[Math.floor(Math.random() * referralCodes.length)];
}

// Function to generate random password
function generateRandomPassword() {
    const length = Math.floor(Math.random() * (12 - 8 + 1)) + 8; // Random length between 8 and 12
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Function to save successful registration
function saveSuccessfulRegistration(email, password) {
    fs.appendFileSync('registration_success.txt', `${email}:${password}\n`);
}

async function registerAccount(email, proxy) {
    try {
        const password = generateRandomPassword();
        
        console.log('Waiting for captcha solution...');
        const captchaToken = await solveCaptcha();
        if (!captchaToken) {
            console.error(`Failed to solve captcha for ${email}`);
            return false;
        }

        // Create proxy agent
        const proxyAgent = new HttpsProxyAgent(proxy);

        // Prepare request data
        const data = {
            email,
            password,
            referralCode: getRandomReferralCode(),
            captchaToken
        };

        // Make registration request
        const response = await axios.post(REGISTER_URL, data, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': getRandomUserAgent(),
                'Origin': 'https://dashboard.solixdepin.net',
                'Referer': 'https://dashboard.solixdepin.net/'
            },
            httpsAgent: proxyAgent
        });

        if (response.status === 201) {
            console.log(`Successfully registered account: ${email}`);
            console.log('Server response:', {
                status: response.status,
                data: response.data
            });
            saveSuccessfulRegistration(email, password);
            return true;
        } else {
            console.error(`Failed to register account: ${email}`);
            return false;
        }
    } catch (error) {
        if (error.response) {
            console.error(`Error registering account ${email}:`, {
                status: error.response.status,
                data: error.response.data,
                message: error.response.data.message
            });
        } else {
            console.error(`Error registering account ${email}:`, error.message);
        }
        return false;
    }
}

function displayBanner() {
    console.clear();
    console.log('\x1b[37m%s\x1b[0m', `
:: ##:::::##:: #######:: ########:: ########: ########:
:: ###:::###: ##:::: ##: ##:::: ##:::::: ##:: ##:::::::
:: ####:####: ##:::: ##: ##:::: ##::::: ##::: ##:::::::
:: ## ### ##: ##:::: ##: ########::::: ##:::: ######:::
:: ##: #: ##: ##:::: ##: ##:: ##::::: ##::::: ##:::::::
:: ##:::: ##: ##:::: ##: ##::: ##::: ##:::::: ##:::::::
:: ##:::: ##:: #######:: ##:::: ##: ########: ########:
::..:::::..:::.......:::..:::::..::........::........::`);
    console.log('\x1b[33m%s\x1b[0m', '='.repeat(53));
    console.log('\x1b[32m%s\x1b[0m', 'Created by: morze crypto, Telegram: https://t.me/morze_crypto');
    console.log('\x1b[33m%s\x1b[0m', '='.repeat(53));
}

async function main() {
    displayBanner();
    
    // Проверка наличия API ключа
    if (!apiKey) {
        console.error('\x1b[31m%s\x1b[0m', 'Ошибка: API ключ 2captcha не указан в config.json');
        process.exit(1);
    }

    for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        
        // Проверка валидности email
        if (!email.includes('@')) {
            console.error(`\x1b[31m%s\x1b[0m`, `Ошибка: Некорректный email адрес: ${email}`);
            continue;
        }

        const proxy = proxies[i % proxies.length];

        console.log(`\n[${i + 1}/${emails.length}] Processing account: ${email}`);
        await registerAccount(email, proxy);
        
        // Add random delay between requests to avoid rate limiting
        const delay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000; // Random delay between 5-10 seconds
        console.log(`Waiting ${delay/1000} seconds before next registration...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    console.log('\n=== All accounts have been processed! ===');
}

main().catch(console.error);
