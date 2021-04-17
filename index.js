const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

//cors for remote get and post request handling start
const cors = require('cors');
app.use(cors());
//cors for remote get and post request handling ends

//node File System required for base64 image upload in mongo | npm install fs-extra
const fs = require('fs-extra');
//node File System required for base64 image upload in mongo end

// For FIle Upload
const fileUpload = require('express-fileupload');
app.use(express.static('uploadedMedia')); //uploadedMedia is the upload folder name
app.use(fileUpload());
//FIle Upload ends


//Mongo DB code for DB connect Start
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const assert = require('assert');
//Mongo DB code for DB connect ends




//env config
require('dotenv').config();
//env config ends



// Mongo Connection URL
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jcglm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;




//body parse for getting body json data through API start
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//body parse for getting body json data through API ends







app.get('/', (req, res) => {
    res.send('Hello dear FOr testing');
})


// Mongo Use connect method to connect to the Server
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollections = client.db("doctorsPortal").collection("appointments");
    const doctorsCollections = client.db("doctorsPortal").collection("doctors");

    console.log('Database connected again');

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        console.log(appointment);
        appointmentCollections.insertOne(appointment)
            .then(result => {
                console.log(appointment, 'appointment added');
                res.send(result.insertedCount > 0);
            })
    })



    //Showing data based on Date and also based on Doctor and User |
    app.post('/appointmentByDate', (req, res) => {
        const date = req.body.date;
        const email = req.body.email;

        doctorsCollections.find({ email: email })
            .toArray((err, doctors) => {
                const filter = { appointmentDate: date }//Doctor will see all 
                if (doctors.length === 0) {
                    filter.email = email //adding extra filter for user
                }
                //If doctors then show all appointments
                appointmentCollections.find(filter)
                    .toArray((err, documents) => {
                        console.log(documents)
                        res.send(documents)
                    })
                //If doctors then show all appointments ends
            })
    })


    //Showing data based on Date and also based on Doctor and User |
    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorsCollections.find({ email: email })
            .toArray((err, doctors) => {
                //const response=doctors.length;
                console.log(doctors.length);
                res.send(doctors.length !== 0)
            })
    })




    //File upload in a folder and form submission
    app.post('/addADoctorUploadInAFolder', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const filePath = `${__dirname}/uploadedMedia/${file.name}`;
        const data = {
            name: name,
            email: email,
            image: file.name
        }
        //File Upload Start
        file.mv(filePath, err => {
            if (err) {
                console.log(err)
                return res.send({ msg: 'Failed to upload Image' })
            }
            //inserting into database
            doctorsCollections.insertOne(data)
                .then(result => {
                    console.log(data, 'doctor added');
                    return res.send({ name: file.name, path: `/${file.name}`, status: result.insertedCount > 0 })
                    //res.send(result.insertedCount>0);
                })
        })
        //File Upload Ends
        console.log(name, email, file);
    })






    //File upload in mongodb and form submission
    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const newImg=file.data;
        const encImg=newImg.toString('base64');

        var image={
            contentType:file.mimetype,
            size:file.size,
            img:Buffer.from(encImg,'base64')
        }
        const filePath = `${__dirname}/uploadedMedia/${file.name}`;
        
        image.name= name;
        image.email=email;
        
         //inserting into database
         doctorsCollections.insertOne(image)
         .then(result => {
             console.log(data, 'doctor added');
             return res.send(result.insertedCount > 0 )
             //res.send(result.insertedCount>0);
         })
        //File Upload Ends
        console.log(name, email, file);
    })






    //client.close();
});


//last line of the code
app.listen(port);

