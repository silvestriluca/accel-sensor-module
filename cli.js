#!/usr/bin/env node

/* 
  <read-mpu>
  Copyright (C) <2019>  <Luca Silvestri>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

var program = require('commander');
const chalk = require('chalk');
var awsIot = require('aws-iot-device-sdk');
var pkg = require('./package.json');
var Sensor = require('./mpu6050');
var Table = require('cli-table3');

var colorsOn = true;  //Default output is coloured => true
var trasmitInterval = 1000; //Default value for Interval between data transmit (ms)
var sendData = false; //True when is time to send aggregated data to AWS IoT
var iot = {
  'host': '',
  'keyPath': 'certs/private.pem.key',
  'certPath': 'certs/certificate.pem.crt',
  'caPath': 'certs/root-ca.pem',
  'clientId': 'read-mpu',
};
const TOPIC_PREFIX = 'device/mpu6050';

//Extracts cli program name from package.json
var cmd = pkg.name;
if (pkg.bin) {
    for (var key in pkg.bin) {
        cmd = key;
        break;
    }
}
//Initialize program object
program
  .name(cmd)
  .version('1.0.0')
  .option('-c, --connect', 'Connects to AWS IoT Core')
  .option('-i, --interval [value]', 'Interval between sensor read (ms)', parseInt)
  .option('-l, --limit [value]', 'Limit the number of reads', parseInt)
  .option('-t, --trasmit-interval [value]', 'Interval between data transmit (s)', parseInt)
  .option('-a, --all', 'Prints all the reads from the sensor')
  .option('-h, --host [value]', 'AWS IoT Endpoint')
  .option('--private-key [path]','Private key path')
  .option('--public-key [path]','Public key path')
  .option('--certificate [path]','Device certificate in PEM format')
  .option('--ca [path]','CA certificate')
  .option('--no-colors','Turns off colored output')
  .parse(process.argv);

/*
program.on('--help', function(){
  console.log('read-mpu  Copyright (C) 2019  Luca Silvestri');
  console.log('This program comes with ABSOLUTELY NO WARRANTY.');
  console.log('This is free software, and you are welcome to redistribute it');
  console.log('under GPLv3 License or above');
});
*/

/**
 *Initialize the program
 *
 */
function init(){
  //Checks for no-color option
  if(program.noColors){
    colorsOn = false;
  }
  //Checks for interval option
  if(program.interval){
    //Defaults trasmitInterval to interval provided value
    trasmitInterval = program.interval;
  }
  //Checks for tramsit interval option
  if(program.trasmitInterval){
    trasmitInterval = program.trasmitInterval * 1000;
  }
  //Prints start message
  startMessage();
  //Check if connection to AWS IoT is needed
  if(program.connect){
    console.log(styleIt('magenta','Connecting to AWS IoT...'));
    connect2IotCore((err, device)=>{
      if(err){
        //Something bad happened at connection. Just state the error and quit.
        console.error(styleIt('red','Error connecting AWS IoT:'));
        console.error(styleIt('red',err.message));
        throw err;
      } else {
        //Everything went fine. Launch main()
        console.log(styleIt('green','CONNECTED!'));
        return main(device);
      }
    });
  } else {
    //No connection required. Launch main()
    return main();
  }
}

/**
 *Prints out the start message
 *
 * @returns
 */
function startMessage(){
  console.log('');
  console.log('*****************************************************************');
  console.log(styleIt('green', 'read-mpu  Copyright (C) 2019  Luca Silvestri'));
  console.log('This program comes with ABSOLUTELY NO WARRANTY.');
  console.log('This is free software, and you are welcome to redistribute it');
  console.log('under GPLv3 License or above');
  console.log('*****************************************************************');
  return;
}
/**
 *Connect the sensor to AWS IoT
 *
 * @param {function(Error,Object)} callback Callback(err,data)
 * @returns
 */
function connect2IotCore(callback){
  //Check if host has been specified
  if(!program.host){
    let hostError = new Error('Failed to provide a valid hostname');
    hostError.name = 'NO_HOST';
    return callback(hostError, null);
  } else {
    iot.host = program.host;
    console.warn(iot.host);
    let device = awsIot.device(iot);
    device.on('connect', () => {
      console.log('AWS IoT connected!');
      return callback(null, device);
    });
    device.on('error', (err) => {
      return callback(err, null);
    });
  }
}

/**
 *Formats the output string with a given color
 *
 * @param {string} color A chalk-related color code
 * @param {string} string The string that has to be formatted
 * @returns
 */
function styleIt(color, string){
  if(colorsOn){
    return chalk[color](string);
  }
  else {
    return string;
  }
}

/**
 *Read sensor data
 *
 * @param {number} interval Interval between sensor read (ms)
 * @param {number} limit Limit the number of reads
 * @param {awsIot.device} device An instance of mqtt client connected to AWS IoT
 */
function readData(interval, limit, device){
  var sensor = new Sensor(0x68);
  var table = new Table({
    colWidths: [20,20,20,20]
  });
  //Calibrates the sensor with data at-rest (to detract the effect of G accelleration)
  var intialData = sensor.readSync();
  sensor.calibrateSensor(intialData);
  // eslint-disable-next-line quotes
  //console.log(styleIt('yellow', `ax                     ay                      az`));
  table.push([styleIt('yellow','ax'),styleIt('yellow','ay'),styleIt('yellow','az'), styleIt('yellow','|a|')]);
  console.log(table.toString());
  // eslint-disable-next-line quotes
  //console.log(styleIt('yellow', `-----------------------------------------------------------`));
  sensor.poolSensorData({interval: interval, limit: limit}, function(err, data){
    if(err){
      console.error(styleIt('red', 'An error occurred while reading sensor data.'));
      console.error(styleIt('red', err.message));
      return;
    } else {
      //console.log(styleIt('yellow', `${data[0].accel.x}         ${data[0].accel.y}         ${data[0].accel.z}`));
      let ax = data[0].accel.x,
          ay = data[0].accel.y,
          az = data[0].accel.z,
          a  = Math.sqrt(ax**2 + ay**2 + az**2);
      table[0] = [styleIt('yellow', ax),styleIt('yellow', ay),styleIt('yellow', az), styleIt('yellow', a)];
      //Check if data has to be sent
      if(sendData && device){
        //Sends data
        table[1] = ['SENDING DATA'];
        let dataToSend = {ax:ax, ay:ay, az:az, a:a};
        device.publish(TOPIC_PREFIX, dataToSend);
        //Resets send data flag
        sendData = false;
        console.log(table.toString());
        table.splice(1,1);
      } else {
        console.log(table.toString());
      }      
      return;
    }
  });
}

/**
 *Sets a timer to evaluate when is time to send data to AWS IoT
 *
 * @param {number} sendDataInterval Interval in ms
 */
function startSendDataTimer(sendDataInterval){
  setInterval(() => {
    sendData = true;
  }, sendDataInterval);
}

/**
 * Main procedure
 *
 * @param {awsIot.device} device An instance of mqtt client connected to AWS IoT
 */
function main(device){
  console.log('************* MAIN *************');
  startSendDataTimer(trasmitInterval);
  readData(program.interval, program.limit, device);
}

init();