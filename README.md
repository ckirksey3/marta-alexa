# MartaTimes
An Amazon Echo app for checking train arrival times for Atlanta's MARTA system

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
### Sample Utterances
Marta when does the {North|Direction} bound train arrive in {Midtown|Station} station
