const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const saveCredentialsToJson = (apiId, apiHash) => {
    const credentialsPath = path.join(__dirname, '../py_scripts/api_credentials.json');
    const credentials = { api_id: apiId, api_hash: apiHash };
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials), 'utf8');
};


let phoneCodeHash = '';

const handleLogin = (req, res) => {
    const { step, TELEGRAM_API_ID, TELEGRAM_API_HASH, phoneNumber, login_code } = req.body;

    let responseSent = false;  
    let pythonArgs = [];

    if (step === 'login') {
        console.log(`[Login] Starting with API ID: ${TELEGRAM_API_ID}, API Hash: ${TELEGRAM_API_HASH}`);
        pythonArgs = ['./py_scripts/login.py', '--login', TELEGRAM_API_ID, TELEGRAM_API_HASH];

    } else if (step === 'phone') {
        console.log(`[Login] Submitting phone number: ${phoneNumber}`);
        pythonArgs = ['./py_scripts/login.py', '--phone', TELEGRAM_API_ID, TELEGRAM_API_HASH, phoneNumber];

    } else if (step === 'code') {
        console.log(`[Login] Submitting login code: ${login_code}`);
        pythonArgs = ['./py_scripts/login.py', '--code', TELEGRAM_API_ID, TELEGRAM_API_HASH, phoneNumber, login_code, phoneCodeHash];
    } else {
        return res.status(400).json({ error: 'Invalid step provided.' });
    }

    const pythonProcess = spawn('python', pythonArgs);

    pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Python] stdout: ${output}`);

        if (step === 'phone') {
            const hashMatch = output.match(/phone_code_hash=([\w-]+)/);
            if (hashMatch) {
                phoneCodeHash = hashMatch[1];
                console.log(`[Login] Captured phone_code_hash: ${phoneCodeHash}`);
            }
        }

        if (output.includes('save_credentials')) {
            console.log('[Login] Session created, saving credentials to JSON.');
            saveCredentialsToJson(TELEGRAM_API_ID, TELEGRAM_API_HASH);
        }

        if (!responseSent) {
            res.status(200).json({ message: 'Step completed successfully', phone_code_hash: phoneCodeHash });
            responseSent = true; 
        }
    });
    //difficultie with harmless and non harmless errors
    pythonProcess.stderr.on('data', (data) => {
        const errorOutput = data.toString();
        console.error(`[Python] stderr: ${errorOutput}`);
        if (errorOutput.includes("DEBUG") || errorOutput.includes("INFO")) {
            console.log(`[Login] Ignored debug message: ${errorOutput}`);
        } else {
            if (!responseSent) {
                res.status(500).json({ error: 'Internal Server Error', details: errorOutput });
                responseSent = true;  
            }
        }
    });

    pythonProcess.on('close', (code) => {
        console.log(`[Login] Process completed with code ${code}`);
        if (!responseSent && code !== 0) {
            res.status(500).json({ error: `Process failed with exit code ${code}` });
            responseSent = true;  
        }
    });
};

const checkSessionAndCredentials = () => {
    try {
        // session and credentials path
        const sessionFilePath = path.join(__dirname, '../py_scripts/teleSession.session');
        const credentialsFilePath = path.join(__dirname, '../py_scripts/api_credentials.json');

        // check session 
        const sessionExists = fs.existsSync(sessionFilePath);
        // Check credentials
        const credentialsExist = fs.existsSync(credentialsFilePath);

        
        if (sessionExists && credentialsExist) {
            return { redirectToDashboard: true };  
        } else {
            return { redirectToDashboard: false, message: 'No existing session found, starting a new session.' };
        }
    } catch (error) {
        console.error('Error checking session and credentials:', error);
        return { redirectToDashboard: false, message: 'Error checking session. Please try again.' };
    }
};

module.exports = {
    handleLogin,
    checkSessionAndCredentials,  
};