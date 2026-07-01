# Flight map click priority

Triggers apt package publishing for the flight map click priority fix. Aircraft selection now only wins when the cursor is truly over an aircraft, and the fallback click logic explicitly searches radar, airport, and airbase layers instead of trusting the first returned feature.
