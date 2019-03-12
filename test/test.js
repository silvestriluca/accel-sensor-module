/* 
  <mpu6050 tests>
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

/* eslint-env node, mocha */
/* eslint quotes: ["error", "single"]*/

var assert = require('chai').assert;
var Sensor = require('../mpu6050');

describe('Tries a sync read of the sensor and check for result', function(){
  var sensorInstance = new Sensor(0x68);
  var data = sensorInstance.readSync();
  console.log(data);
  assert.property(data,'gyro', 'Does not have gyro property');
  assert.property(data,'accel', 'Does not have accel property');
  assert.property(data,'rotation', 'Does not have rotation property');
  assert.property(data,'temp', 'Does not have temp property');
  assert.nestedProperty(data,'gyro.x', 'Does not have gyro.x property');
  assert.nestedProperty(data,'gyro.y', 'Does not have gyro.y property');
  assert.nestedProperty(data,'gyro.z', 'Does not have gyro.z property');
  assert.nestedProperty(data,'accel.x', 'Does not have accel.x property');
  assert.nestedProperty(data,'accel.y', 'Does not have accel.y property');
  assert.nestedProperty(data,'accel.z', 'Does not have accel.z property');
  assert.nestedProperty(data,'rotation.x', 'Does not have rotation.x property');
  assert.nestedProperty(data,'rotation.y', 'Does not have rotation.y property');
});