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

const DEFAULT_POOL_INTERVAL = 1000;
const DEFAULT_TEST_LIMIT = 5;

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
    //Executes an initial read to initialize the sensor after a cold boot.
    this.readSync();
  }

  /**
   * Read data from sensor syncrounously
   *
   * @returns An object containing 
   * @memberof MPU6050
   */
  readSync(){
    var data = this.sensor.readSync();
    return data;
  }

  /**
   * Read data from sensor asyncrounously
   *
   * @param {function(Error, object)} callback The callback(err, data) function 
   * @memberof MPU6050
   */
  readAsync(callback) {
    this.sensor.read(callback);
  }

  /**
   *Perform a sensor calibration with data from a static measure
   *
   * @param {{object}} staticMeasure A sensor read when it's static (not moving)
   * @memberof MPU6050
   */
  calibrateSensor(staticMeasure){
    //Defines a calibration object
    let calibration = {
      accel: {},
      gyro: {}
    };
    //Evaluates the calibration values for acceleration
    for (const key in staticMeasure.accel) {
      /* istanbul ignore else  */
      if (staticMeasure.accel.hasOwnProperty(key)) {
        const element = staticMeasure.accel[key];
        calibration.accel[key] = -element;
      }
    }
    this.sensor.calibrateAccel(calibration.accel);
  }

  /**
   * Pools sensor data at a given interval
   *
   * @param {{interval:Number, limit:Number}} opts Options. Interval default is 1000s
   * @param {function(Error,Any)} callback Callback function (err, data)
   * @param {boolean} test True if it is used in a test suite
   * @returns
   * @memberof MPU6050
   */
  poolSensorData(opts, callback, test){
    //Check parameters
    if(!opts){
      //opts is null. Sets default interval
      opts = {
        interval: DEFAULT_POOL_INTERVAL
      };      
    } else {
      switch (typeof opts) {
        case 'function':
          //callback passed as first argument. Set interval as default
          callback = opts;
          opts = {
            interval: DEFAULT_POOL_INTERVAL
          };          
          break;
        case 'number':
          //puts the supplied interval in the opts object
          opts = {
            interval: opts
          };
          break;
        case 'string':
          //Rise an error and exits
          let err = new Error('poolSensorData: opts parameter has to be a number or an object');
          err.name = 'WRONG_PARAM_TYPE';
          return callback(err);
        default:
          break;
      }
    }
    if(!callback){
      //If callback is not there, then substitute with a dummy function
      callback = () => {return;};
    } else {
      switch (typeof callback) {
        case 'function':
          //callback is a function. Go on.          
          break;      
        default:
          //callback is anything but a function. Substitute with dummy function
          callback = () => {return;}; 
          break;
      }
    }
    //Check if the method is called in a test scenario (e.g. Mocha)
    if(test){
      //Check if there is a previously specified limit in opts object
      if(!opts.limit){
        opts.limit = DEFAULT_TEST_LIMIT;
      }
    }
    let count = 0;
    //Set an interval timer to read the sensor at every given interval
    let intervalTimer = setInterval(() => {
      this.sensor.read(function(err, data){
        //Deal with limited numbers of consecutive reads.
        /* istanbul ignore else  */
        if(opts.limit){
          count = count + 1;
          //Checks if the limit number of consecutive reads have been reached
          if(count >= opts.limit){
            //Cancels the interval timer
            clearInterval(intervalTimer);
          }
        }
        //Return the read result
        if(err){
          return callback(err, null);
        } else {
          return callback(null, [data, opts, callback]);
        }        
      });
    },opts.interval);
  }
}

module.exports = MPU6050;