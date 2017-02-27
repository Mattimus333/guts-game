const EXPRESS = require('express');
const APP = EXPRESS();

const PORT = process.env.PORT || 6000;

APP.use(EXPRESS.static(__dirname));

APP.listen(PORT, function() {
    console.log('listening on port', PORT);
});
