# yUML graph test

![PlantUML Activity diagram](./activity.pu)

![yUML Activity diagram](./activity.yuml)

![yUML Sequence diagram](#inline)

```yuml
// {type:sequence}
[:Computer]sendUnsentEmal>[:Server]
[:Computer]newEmail>[:Server]
[:Server]reponse.>[:Computer]
[:Computer]downloadEmail>[:Server]
[:Computer]deleteOldEmail>[:Server]
```

![PlantUML sequence diagram](#inline)

```plantuml
@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: another authentication Response
@enduml
```

![Mermaid diagram](#inline)

```mermaid
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```
