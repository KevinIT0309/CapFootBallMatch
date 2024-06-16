namespace football.match;

using { cuid, managed } from '@sap/cds/common';

    @assert.unique : { uniqueKey: [ team_name ]}
    entity Teams: managed {
        key team_id   : Integer;// increase automatic
        team_name     : String(100) not null;
        group         : String(1);// A,B,C,D,E,F
    }


    @assert.unique : { uniqueKey: [ team1_ID, team2_ID, match_time ]}
    entity Matches: managed {
        key match_id      : Integer;// increase automatic
        match_name        : String not null;
        match_time        : DateTime not null;
        
        status            : Integer @assert.range: [ 1, 3 ] enum { waiting = 1; ongoing = 2; done = 3; } not null;
        isOver            : Boolean default false;// when the status is [3 = done], set isOver become true, when isOver become true, all data can not be edited anymore

        team1_ID          : Integer not null;
        team2_ID          : Integer not null;
        team1_score       : Integer;
        team2_score       : Integer;
        team_win_ID       : Integer;
        stage             : String(50);//[ group, knockout ]

        predicts          : Integer;// number of predicts allowed in this match

        team1             : Association to one Teams on team1.team_id = $self.team1_ID; // Referential Constraint
        team2             : Association to one Teams on team2.team_id = $self.team2_ID; // Referential Constraint

    }

    entity Users: cuid, managed {
        key user_id    : String;
        email          : String(100) not null;
        fullName       : String not null;
    }


    define type Goals {
        team1_ID : Integer;
        team1_numOfGoals : Integer;
        team2_ID : Integer;
        team2_numOfGoals : Integer;
    }


    @assert.unique : { uniqueKey: [ user_ID, match_ID, team_win_ID ]}
    entity Bets: cuid, managed {
        bet_time         : DateTime not null;// Date and time when the bet was placed

        user_ID          : String not null;
        match_ID         : Integer not null;
        team_win_ID      : Integer not null;
        isDraw           : Boolean default null;// otherwise must true

        predictGoals     : many Goals;
        
        user             : Association to one Users on user.user_id = $self.user_ID; // Referential Constraint
        match            : Association to one Matches on match.match_id = $self.match_ID; // Referential Constraint

    }


    @assert.unique : { uniqueKey: [ user_ID, match_ID, points ]}
    entity Scores: cuid, managed {

        user_ID       : String not null;
        match_ID      : Integer not null;
        points        : Decimal(5,2) not null;
        
        user             : Association to one Users on user.user_id = $self.user_ID; // Referential Constraint
        match            : Association to one Matches on match.match_id = $self.match_ID; // Referential Constraint
    }