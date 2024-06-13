using football.match as fms from '../db/schema';

@path: 'ces/FM_SRV'
service FM_SRV {

    entity Users as select from fms.Users;
    entity Teams as select from fms.Teams;

    entity Matches @(restrict: [
        { grant:'WRITE', to: 'ADMIN' },
        { grant:'READ', to: ['ADMIN','BETTOR'] }
    ]) as select from fms.Matches;

    entity Bets @(restrict: [
        { grant:'READ', to: ['ADMIN', 'BETTOR'] },
        { grant:'WRITE', to: 'BETTOR' }
    ]) as select from fms.Bets;

    entity Scores @(restrict: [
        { grant:'READ', to: ['ADMIN', 'BETTOR'] },
        { grant:'WRITE', to: 'BETTOR' }
    ]) as select from fms.Scores;

    
    function TotalBetPointsReceived(userID : String) returns Integer;

    function GetUserInfo() returns {
        id : String
    };

}

annotate FM_SRV with @(requires: 'authenticated-user');