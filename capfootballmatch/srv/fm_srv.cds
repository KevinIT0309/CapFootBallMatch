using football.match as fms from '../db/schema';
using football.match.view as fmsv from '../db/view/SoccerView';

@path: 'ces/FM_SRV'
service FM_SRV {

    entity Users
    @(restrict: [
        { grant: '*', to: ['system-user', 'technical-user']},
        { grant:'WRITE', to: 'ADMIN' },
        { grant:'READ', to: ['ADMIN','BETTOR'] }
    ])
    as select from fms.Users;

    entity Teams
    @(restrict: [
        { grant: '*', to: ['system-user', 'technical-user']},
        { grant:'WRITE', to: 'ADMIN' },
        { grant:'READ', to: ['ADMIN','BETTOR'] }
    ])
    as select from fms.Teams;

    entity Matches
    @(restrict: [
        { grant: '*', to: ['system-user', 'technical-user']},
        { grant:'WRITE', to: 'ADMIN' },
        { grant:'READ', to: ['ADMIN','BETTOR'] }
    ])
    as select from fms.Matches;

    entity Bets
    @(restrict: [
        { grant: '*', to: ['system-user', 'technical-user']},
        { grant:'READ', to: ['ADMIN', 'BETTOR'] },
        { grant:'WRITE', to: 'BETTOR' }
    ])
    as select from fms.Bets;

    entity Scores
    @(restrict: [
        { grant: '*', to: ['system-user', 'technical-user']},
        { grant:'READ', to: ['ADMIN', 'BETTOR'] },
        { grant:'WRITE', to: 'ADMIN' }
    ])
    as select from fms.Scores;
    
    function TotalBetPointsReceived(userID : String) returns Integer;

    function GetUserInfo() returns {
        id : String
    };

    @readonly entity LeaderBoards as select from fmsv.LeaderBoards;

    @readonly entity BetStatistics as select from fmsv.BetStatistics;
    
    @readonly entity BetHistory as select from fmsv.BetHistory;
}

annotate FM_SRV with @(requires: 'authenticated-user');