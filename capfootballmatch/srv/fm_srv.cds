using football.match as fms from '../db/schema';

@path:'ces/FM_SRV'
service FM_SRV {

    entity Teams as select from fms.Teams;
    entity Matches as select from fms.Matches;
    entity Users as select from fms.Users;
    entity Bets as select from fms.Bets;
    entity Scores as select from fms.Scores;

    function TotalBetPointsReceived(userID: Integer) returns Integer;
}

annotate FM_SRV with @(requires: 'authenticated-user');