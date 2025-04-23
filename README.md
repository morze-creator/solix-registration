# Automatic account registrar for the Solix DePIN project.

Automatic registration of any number of accounts in the Solix project using proxies and referral codes.

## 🟡Register
Create your main account if you haven't done so already.
- Visit the following link: [https://dashboard.solixdepin.net/sign-up](https://dashboard.solixdepin.net/sign-up?ref=39ByxTov).
- Enter the referral code: `39ByxTov`.

## 1️⃣How to start?
- First, you need to download and install this repository on your computer:
```bash
git clone https://github.com/morze-creator/solix-registration
```
- Go to the project folder:
```bash
cd solix-registration
```
- Install all the necessary dependencies with the following command(Or run the bat file **INSTALL.bat**.):
```bash
npm install
```
## 2️⃣Configuration
- Open the **config.json** file and specify your **2captcha key**.
```bash
{
    "twoCaptchaApiKey": ""
}
```
If you are not using the 2captcha service yet, you can register using this link: [https://2captcha.com/](https://2captcha.com/?from=25229355).
- Upload your list of emails in the **email.txt** file:
```bash
email
email
email
```
- Upload your list of proxies in the **proxy.txt** file:
```bash
http://user:pass@ip:port
http://user:pass@ip:port
http://user:pass@ip:port
```
- In the **ref.txt** file, specify your list of referral codes:
```bash
CODE
CODE
CODE
```
## 3️⃣Run
To launch the software, simply run the following command in the project folder:
```bash
node index.js
```
Or run the bat file **START.bat**.

## Disclaimer
> [!WARNING]
> This bot is distributed for educational purposes only. The software author takes no responsibility for its usage by you.
