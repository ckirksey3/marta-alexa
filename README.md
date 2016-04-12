# MartaTimes
An Amazon Echo app for checking train arrival times for Atlanta's MARTA system. In order to get it working, you must [request a Marta API key](http://www.itsmarta.com/developers/registrationform-rtt.aspx) and set it in process.env.MARTA_API_KEY.

### Intent Schema
```
{
  "intents": [
    {
      "intent": "Marta",
      "slots": [
        {
          "name": "Direction",
          "type": "DIRECTION"
        },
        {
          "name": "Station",
          "type": "STATION"
        }
      ]
    },
    {
      "intent": "AMAZON.HelpIntent"
    },
    {
      "intent": "AMAZON.StopIntent"
    }
  ]
}
```
### Custom Slot Types
Direction

North | South | East | West

Station

Airport | Arts Center | Ashby | Avondale | Bankhead | Brookhaven | Buckhead | Chamblee | Civic Center 
College Park | Decatur | Dome| Doraville | Dunwoody| East Lake | East Point | Edgewood | Five Points 
Garnett | Georgia State | Hamilton Holmes | Indian Creek | Inman Park | Kensington | King Memorial 
Lakewood | Lenox | Lindbergh Center | Medical Center | Midtown | North Avenue | North Springs 
Oakland City | Peachtree Center | Sandy Springs | Vine City | West End | West Lake 

### Sample Utterances
Marta when does the {Direction} bound train arrive in {Station} station

Marta when does the {Direction} train arrive in {Station} station

Marta when does the {Direction} bound train arrive in {Station}

Marta when does the {Direction} train arrive in {Station}

Marta when will the {Direction} bound train arrive in {Station} station

Marta when will the {Direction} train arrive in {Station} station

Marta when will the {Direction} bound train arrive in {Station}

Marta for the {Direction} train at {Station} station

Marta about {Station} station's {Direction} trains

Marta for {Station} times

Marta for {Station} station times

Marta about {Station} station

Marta about {Station}

Marta when the train gets to {Station}

Marta for trains at {Station} station going {Direction}

Marta for times at the {Station}

Marta for times at {Station} station

Marta what trains are at {Station} station

Marta what are the times for {Station} station

Marta what are the times for the {Station}
