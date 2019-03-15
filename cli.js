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

program
  .name('read-mpu')
  .version('1.0.0')
  .option('-c, --connect', 'Connects to AWS IoT Core')
  .option('-i, --interval [value]', 'Interval between sensor read (ms)', parseInt)
  .option('-l, --limit [value]', 'Limit the number of reads', parseInt)
  .option('-a, --all', 'Prints all the reads from the sensor')
  .parse(process.argv);

/*
program.on('--help', function(){
  console.log('read-mpu  Copyright (C) 2019  Luca Silvestri');
  console.log('This program comes with ABSOLUTELY NO WARRANTY.');
  console.log('This is free software, and you are welcome to redistribute it');
  console.log('under GPLv3 License or above');
});
*/

console.log(program.connect);
console.log(program.interval);
console.log(program.limit);
console.log(program.all);
console.log(program.args);