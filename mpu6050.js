#!/usr/bin/env node

/* 
  <mpu6050 module>
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

var i2c = require('i2c-bus');
var i2cMPU6050 = require('i2c-mpu6050');

/**
 *Describes a MPU6050 sensor
 *
 * @class MPU6050
 */
class MPU6050 {
  /**
   *Creates an instance of MPU6050.
   * @param {Number} address - Sensor address number in HEX notation
   * @memberof MPU6050
   */
  constructor(address){
    var i2c1 = i2c.openSync(1);
    this.sensor = new i2cMPU6050(i2c1,address);
  }

  /**
   *Read data from sensor syncrounously
   *
   * @returns {}
   * @memberof MPU6050
   */
  readSync(){
    return this.sensor.readSync();
  }
}

module.exports = MPU6050;