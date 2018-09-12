const CLIException = require('./CLIException');
const fs = require('fs');

module.exports = {
    create : function(fileName, object){
        var content = JSON.stringify(object);

        fs.writeFile(fileName, content, 'utf8', function (error) {
            if (error) {
                throw new CLIException(1, `There was a problem while creating the file ${fileName} \n Error: ${JSON.stringify(error)}`)
            }
        }); 
    },
    read: function(fileName){
        var content = fs.readFileSync(fileName, 'utf8');
        return JSON.parse(content);
    },
    exists: function(fileName){
        return fs.existsSync(fileName);
    }
}