# node-red-contrib-absolute-humidity

Calculates the absolute humidity and dew point for a given relative humidity and air temperature.
    
### Inputs
  
: msg.relativeHumidity (number)	:
: msg.temperature (number)	:

### Inputs

: msg.absoluteHumidity (number)	:
: msg.dewPoint (number)		:

### Details
    
The received message shall contain two properties:
    
`msg.relativeHumidity` is a measure of the amount of water vapor in the air compared to the amount of vapor that can exist in the air at its current temperature. It is measured in percent [%].
`msg.temperature` is the current air temperature. It is measured in degrees Celsius [°C].

Based on this two measures, the node calculates two properties which are stored in the outgoing message:
  
`msg.absoluteHumidity` is a measure of the actual amount of water vapor (moisture) in the air, regardless of the air temperature. It is measured in grams water per cubic metre air [kg/m³].
`msg.dewPoint` is the temperature to which it must be cooled to become saturated with water vapor. When the air is cooled below the dew point, its moisture capacity is reduced and airborne water vapor will condense to form liquid water known as dew. When this occurs through the air's contact with a colder surface, dew will form on that surface. It is measured in degrees Celsius [°C].

### References

-  https://www.wetterochs.de/wetter/feuchte.html