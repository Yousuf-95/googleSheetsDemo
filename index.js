const express = require('express');
const {google} = require('googleapis');

const app = express();
app.use(express.json());

const authentication = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });
    // console.table('auth is: ' + JSON.stringify(auth));
    
    const client = await auth.getClient();
    // console.log('client is: ' + JSON.stringify(client));
    
    const sheets = google.sheets({
        version: 'v4',
        auth: client
    });
    console.log('sheets is: ' + JSON.stringify(sheets));

    return {sheets};
}

const sheetId = '10u94i58gl3rJNUCtwflnsc2wsDz4EdqRGcfy17pH33w';

//Get all Rows
app.get('/getRows', async (req,res) => {
    try{
        const {sheets} = await authentication();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Sheet1'
        });

        res.send(response.data);
    }
    catch(error){
        console.log(error);
        res.status(500).send();
    }
});

//Add Row
app.post('/addRow', async (req,res) => {
    try{
        //title and content are two columns created in this demo sheet
        const {title,content} = req.body;
        const {sheets} = await authentication();
    
        const addToSheet = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Sheet1',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [title,content]
                ]
            }
        });
    
        if(addToSheet.status === 200){
            return res.json({ message: 'Operation successful'});
        }
        return res.json({message: 'Somehing went wrong'});
    }
    catch(error){
        console.log(error);
        return res.status(500).send();
    }
});

//Update Row
app.post('/updateRow', async (req,res) => {
    try{

        //Specify sheet cell to update in 'range' property
        //Example: 'Sheet1!A5:B5'

        const {title,content,range} = req.body;
        const {sheets} = await authentication();

        const updateCell = await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [title,content]
                ]
            }
        });

        if(updateCell.status === 200){
            return res.json({message: 'Update successful'});
        }

        return res.json({message: 'Something went wrong'});
    }
    catch(error){
        console.log(error);
        return res.status(500).send();
    }
});


//Delete Row
app.post('/deleteRow', async (req,res) => {
    try{
        const {range} = req.body();
        const {sheets} = await authentication();

        const deleteCells = await sheets.spreadsheets.values.clear({
            spreadsheetId: sheetId,
            range,
        });

        if(deleteCells.status === 200){
            return res.json({message: 'deletion successful'});
        }
        
        return res.json({message: 'Something went wrong'});
    }
    catch(error){
        console.log(error);
        return res.status(500).send();
    }
});







app.listen(3000, () => console.log('Server litening on port 3000'));