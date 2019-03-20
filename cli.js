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
var pkg = require('./package.json');
var Sensor = require('./mpu6050');
var Table = require('cli-table3');

var colorsOn = true;  //Default output is coloured => true

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
  .option('-a, --all', 'Prints all the reads from the sensor')
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
  //Prints start message
  startMessage();
  //Check if connection to AWS IoT is needed
  if(program.connect){
    console.log(styleIt('magenta','Connecting to AWS IoT...'));
    connect2IotCore((err, data)=>{
      if(err){
        //Something bad happened at connection. Just state the error and quit.
        console.error(styleIt('red','Error connecting AWS IoT:'));
        console.error(err);
        return;
      } else {
        //Everything went fine. Launch main()
        console.log(styleIt('green','CONNECTED!'));
        return main();
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
  console.log('AWS IoT answered!');
  return callback(null, null);
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
 */
function readData(interval, limit){
  var sensor = new Sensor(0x68);
  var table = new Table({
    colWidths: [20,20,20,20]
  });
  //Calibrates the sensor with data at-rest (to detract the effect of G accelleration)
  var intialData = sensor.readSync();
  sensor.calibrateSensor(intialData);
  // eslint-disable-next-line quotes
  //console.log(styleIt('yellow', `ax                     ay                      az`));
  table.push([styleIt('yellow','ax'),styleIt('yellow','ay'),styleIt('yellow','az'), styleIt('yellow','A')]);
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
          az = data[0].accel.z;
      table[0] = [styleIt('yellow', ax),styleIt('yellow', ay),styleIt('yellow', az), styleIt('yellow', Math.sqrt(ax**2 + ay**2 + az**2))];
      console.log(table.toString());
      return;
    }
  });
}

/**
 *Main procedure
 *
 */
function main(){
  console.log('************* MAIN *************');
  readData(program.interval, program.limit);
}

init();