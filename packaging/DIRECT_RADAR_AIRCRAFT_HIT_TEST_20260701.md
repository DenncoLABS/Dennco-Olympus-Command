# Direct radar and aircraft hit testing

Triggers apt package publishing for direct radar/aircraft hit testing. Radar clicks now use static RADAR_REGIONS coordinates instead of MapLibre feature ordering, while aircraft clicks continue using aircraft feature hit testing. The resolver selects the nearest valid target by cursor distance.
