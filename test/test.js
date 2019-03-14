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

const DEFAULT_TEST_LIMIT = 5;

describe('Tries a sync read of the sensor and check for result', function(){
  var sensorInstance = new Sensor(0x68);
  var data = sensorInstance.readSync();
  //Repeats the read for cold starts
  data = sensorInstance.readSync();
  console.log(data);
  it('Tests if data is properly formatted', function(){
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

  it('Tests calibration', function(){
    //Calibrates sensor
    sensorInstance.calibrateSensor(data);
    //Read the calibrated data from the sensor
    let calibratedData = sensorInstance.readSync();
    console.log('Calibrated data:');
    console.log(calibratedData);
    assert.isTrue(calibratedData.accel.x < 0.1 && calibratedData.accel.x > -0.1, 'Accel x is out of calibration limits');
    assert.isTrue(calibratedData.accel.y < 0.1 && calibratedData.accel.y > -0.1, 'Accel y is out of calibration limits');
    assert.isTrue(calibratedData.accel.z < 0.1 && calibratedData.accel.z > -0.1, 'Accel z is out of calibration limits');
  });

  it('Tests read asyncronously', function(done){
    //Read asyncronously
    sensorInstance.readAsync(function(err, asyncData){
      if(err){
        done(err);
      } else {
        console.log('Async data: ');
        console.log(asyncData);
        assert.property(asyncData,'gyro', 'Does not have gyro property');
        assert.property(asyncData,'accel', 'Does not have accel property');
        assert.property(asyncData,'rotation', 'Does not have rotation property');
        assert.property(asyncData,'temp', 'Does not have temp property');
        assert.nestedProperty(asyncData,'gyro.x', 'Does not have gyro.x property');
        assert.nestedProperty(asyncData,'gyro.y', 'Does not have gyro.y property');
        assert.nestedProperty(asyncData,'gyro.z', 'Does not have gyro.z property');
        assert.nestedProperty(asyncData,'accel.x', 'Does not have accel.x property');
        assert.nestedProperty(asyncData,'accel.y', 'Does not have accel.y property');
        assert.nestedProperty(asyncData,'accel.z', 'Does not have accel.z property');
        assert.nestedProperty(asyncData,'rotation.x', 'Does not have rotation.x property');
        assert.nestedProperty(asyncData,'rotation.y', 'Does not have rotation.y property');
        done();
      }
    });
  });
  describe('Tests poolSensorData', function(){
    this.timeout(120000);
    it('poolSensorData: all the options', function(done){
      let count = 0;
      sensorInstance.poolSensorData({interval: 500, limit: 10}, function(err, data){
        if(err){
          done(err);
        } else {
          console.log(data[0]);
          assert.strictEqual(data[1].interval, 500);
          assert.strictEqual(data[1].limit, 10);
          assert.strictEqual(typeof data[2], 'function');
          count = count + 1;
          if(count >= 10){
            done();
          }
        }
      }, true);  
    });

    it('poolSensorData: number', function(done){
      let count = 0;
      sensorInstance.poolSensorData(3000, function(err, data){
        if(err){
          done(err);
        } else {
          assert.strictEqual(data[1].interval, 3000);
          assert.strictEqual(typeof data[2], 'function');
          count = count + 1;
          if(count >= DEFAULT_TEST_LIMIT){
            done();
          }
        }
      }, true);  
    });

    it('poolSensorData: options is null', function(done){
      let count = 0;
      sensorInstance.poolSensorData(null, function(err, data){
        if(err){
          done(err);
        } else {
          assert.strictEqual(data[1].interval, 1000);
          assert.strictEqual(typeof data[2], 'function');
          count = count + 1;
          if(count >= DEFAULT_TEST_LIMIT){
            done();
          }
        }
      }, true);
    });

    it('poolSensorData: function as first argument', function(done){
      let count = 0;
      sensorInstance.poolSensorData(function(err, data){
        if(err){
          done(err);
        } else {
          assert.strictEqual(data[1].interval, 1000);
          assert.strictEqual(typeof data[2], 'function');
          count = count + 1;
          if(count >= DEFAULT_TEST_LIMIT){
            done();
          }
        }
      }, null, true);
    });

    it('poolSensorData: string as first argument', function(done){
      sensorInstance.poolSensorData('hello', function(err){
        if(err){
          assert.strictEqual(err.name, 'WRONG_PARAM_TYPE', 'Wrong error type');
          done();
        } else {
          assert.ok(false, 'Did not got an error when supplied string as option value');
          done();
        }
      }, true);
    });

    it('poolSensorData: only callback as argument', function(done){
      let count = 0;
      sensorInstance.poolSensorData(function(err, data){
        if(err){
          done(err);
        } else {
          assert.strictEqual(data[1].interval, 1000);
          assert.strictEqual(typeof data[2], 'function');
          count = count + 1;
          if(count >= DEFAULT_TEST_LIMIT){
            done();
          }
        }
      }, null, true);
    });  
    
    it('poolSensorData: no callback provided', function(done){
      assert.doesNotThrow(() => sensorInstance.poolSensorData({interval: 3000, limit: 2}, null, true));      
      done();
    }); 
    
    it('poolSensorData: no proper callback provided', function(done){
      assert.doesNotThrow(() => sensorInstance.poolSensorData({interval: 3000, limit: 2}, 'no proper callback', true));      
      done();
    });     
    
  });
});