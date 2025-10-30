const path = require('path');
const { exec } = require('child_process');

const modelPath = path.resolve(__dirname, '..', '..', 'python', 'BERT_1.py');

exports.runModel = (req, res) => {
    exec(`python ${modelPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing model: ${stderr}`);
            return res.status(500).json({ error: 'Failed to run model', details: stderr });
        }
        
        // results contains message_text+the label
        const results = stdout.split('\n').map((line) => {
            const match = line.match(/Message: '(.+)' is (antisemitic|not antisemitic)/);
            if (match) {
                return { message_text: match[1], result: match[2] };
            }
            return null; // Skip null
        }).filter(Boolean); // Filter null results for errs

        // print results to console per message
        results.forEach(line => console.log(line));
        res.json({ results });
    });
};
