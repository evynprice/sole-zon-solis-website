require('dotenv').config();

const fs = require('fs');
const path = require('path');

async function clearTemp() {
    const directory = path.join(__dirname, '../tmp/');
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

module.exports = { clearTemp };
