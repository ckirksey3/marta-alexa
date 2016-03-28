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
          "type": "LITERAL"
        },
        {
          "name": "Station",
          "type": "Literal"
        }
      ]
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

Marta when does the {North|Direction} bound train arrive in {Midtown|Station} station

Marta when does the {East|Direction} train arrive in {Five Points|Station} station

Marta when does the {South|Direction} bound train arrive in {Midtown|Station}

Marta when does the {West|Direction} train arrive in {Five Points|Station}

Marta when will the {North|Direction} bound train arrive in {Airport|Station} station

Marta when will the {South|Direction} train arrive in {North Avenue|Station} station

Marta when will the {North|Direction} bound train arrive in {Lenox|Station}

Marta when will the {South|Direction} train arrive in {Arts Center|Station}
