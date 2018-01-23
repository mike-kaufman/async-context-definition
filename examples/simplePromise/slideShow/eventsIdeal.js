var records = [
    {"event":"executeBegin","executeID":1},
    {"event":"output","data":{"output":"starting"}},
    {"event":"link","executeID":1,"linkID":8,"data":{"type":"setTimeout"}},
    {"event":"link","executeID":1,"linkID":9,"data":{"type":"PROMISE"}},
    
    {"event":"cause","executeID":1,"linkID":8,"causeID":6},

    {"event":"executeEnd","executeID":1},

    
    {"event":"executeBegin","executeID":10,"causeID":6},
    {"event":"output","data":{"output":"resolving promise in timeout"}},
    {"event":"cause","executeID":10,"linkID":9,"causeID":11},
    {"event":"executeEnd","executeID":10},

    {"event":"executeBegin","executeID":12,"causeID":11},
    {"event":"output","data":{"output":"in \"then\": true"}},
    {"event":"executeEnd","executeID":12}
];    