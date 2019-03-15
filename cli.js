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
//var Sensor = require('./mpu6050');
const chalk = require('chalk');
var pkg = require('./package.json');

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
  //Prints start message
  startMessage();
  //Check if connection to AWS IoT is needed
  if(program.connect){
    console.log(chalk.blue('Connecting to AWS IoT...'));
    connect2IotCore((err, data)=>{
      if(err){
        //Something bad happened at connection. Just state the error and quit.
        console.error(chalk.red('Error connecting AWS IoT:'));
        console.error(err);
        return;
      } else {
        //Everything went fine. Launch main()
        console.log(chalk.green('CONNECTED!'));
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
  console.log(chalk.green('read-mpu  Copyright (C) 2019  Luca Silvestri'));
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
 *Main procedure
 *
 */
function main(){
  console.log('************* MAIN *************');
}

init();