const PLUGIN_ID = "signalk-wind";

module.exports = function (app) {
    var plugin = {};
  
    plugin.id = PLUGIN_ID;
    plugin.name = 'Davis Weather Instrument';
    plugin.description = 'Broadcasts wind speed and direction';
    plugin.start = function (options, restartPlugin) {
      // Here we put our plugin logic
      app.debug('Plugin started');
      const SerialPort = require('serialport')
      const Readline = require('@serialport/parser-readline')
      const port = new SerialPort(options.serial_port, { baudRate: 9600 })
      const parser = new Readline()
      port.pipe(parser)
        
      parser.on('data', line => {
        handleParser(line);
      });
    };
  
    plugin.stop = function () {
      // Here we put logic we need when the plugin stops
      app.debug('Plugin stopped');
    };
  
    plugin.schema = {
      type: 'object',
      required: ['serial_port'],
      properties: {
        serial_port: {
          type: 'string',
          title: 'Serial port'
        },
      }
    };
  
  const convertAngleToRadian = (angle) => {
    return angle * 0.0174533;
  }

  // coverts miles per hour to meters per second
  const convertMPHtoMS = (speed) => {
    return speed * 0.44704;
  }
  
  const handleParser = (line) => {
      const data = line.replace(/\r/g, "").split(",");
      const speedApparent = convertMPHtoMS(parseInt(data[0], 10));
      const angleApparent = convertAngleToRadian(parseInt(data[1], 10));

      app.handleMessage(PLUGIN_ID, {
        "updates": [{
            "source": {
              "src": "DAVIS_WEATHER_INSTRUMENT",
            },
            "timestamp": Date.now(),
            "values": [
              {
                "path": 'environment.wind.speedApparent',
                "value": speedApparent,
              },
              {
                "path": 'environment.wind.angleApparent',
                "value": angleApparent,
              },
            ]
        }]
      })
    }
    
    return plugin;
};
