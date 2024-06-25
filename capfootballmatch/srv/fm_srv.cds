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

    @readonly entity MatchesBets as select from fmsv.MatchesBets;

    @readonly entity MatchBetResults {
        match_id    : String;
        match_name  : String;
        match_time  : String;
        team1_ID    : Integer;
        team1_Name: String;
        team2_Name: String;
        team2_ID    : Integer;
        isOver      : Boolean;
        team1_score : Integer;
        team2_score : Integer;
        team_win_ID : Integer;
        team_win_Name : String;
        status: Integer;
        team_win_ID_bet : Integer;
        team_win_Name_bet : String;
        isDraw      : Boolean;
    }

    function getMatchBetResults(userID : String) returns many MatchBetResults;

}

annotate FM_SRV with @(requires: 'authenticated-user');