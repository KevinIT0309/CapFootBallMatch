namespace football.match;

using { managed } from '@sap/cds/common';

    entity Teams: managed {
        key team_id   : Integer;// increase automatic
        team_name     : String(100) not null;
        group         : String(1);// A,B,C,D,E,F
    }


    entity Matches: managed {
        key match_id      : Integer;// increase automatic
        match_name        : String not null;
        match_time        : DateTime not null;
        
        status            : Integer @assert.range: [ 1, 2 ] enum { waiting = 1; ongoing = 2; done = 3; } not null;
        isOver            : Boolean default false;// when the status is [3 = done], set isOver become true, when isOver become true, all data can not be edited anymore

        team1_ID          : Integer not null;
        team2_ID          : Integer not null;
        team1_score       : Integer;
        team2_score       : Integer;
        stage             : String(50);//[ group, knockout ]

        team1             : Association to one Teams on team1.team_id = $self.team1_ID; // Referential Constraint
        team2             : Association to one Teams on team2.team_id = $self.team2_ID; // Referential Constraint

    }

    entity Users: managed {
        key user_id    : Integer;// increase automatic
        email          : String(100) not null;
        password       : String(256) not null;
        fullName       : String not null;
        role           : Integer @assert.range: [ 1, 2 ] enum { admin = 1; bettor = 2} not null;
        
    }


    define type Goals {
        team1_ID : Integer;
        team1_numOfGoals : Integer;
        team2_ID : Integer;
        team2_numOfGoals : Integer;
    }

    entity Bets: managed {
        key bet_id       : Integer;// increase automatic
        bet_time         : DateTime not null;// Date and time when the bet was placed

        user_ID          : Integer not null;
        match_ID         : Integer not null;
        team_win_ID      : Integer not null;
        isDraw           : Boolean default null;// otherwise must true

        predictGoals     : many Goals;
        
        user             : Association to one Users on user.user_id = $self.user_ID; // Referential Constraint
        match            : Association to one Matches on match.match_id = $self.match_ID; // Referential Constraint

    }


    entity Scores: managed {
        key score_id  : Integer;// increase automatic

        user_ID       : Integer not null;
        match_ID      : Integer not null;
        points        : Integer not null;
        
        user             : Association to one Users on user.user_id = $self.user_ID; // Referential Constraint
        match            : Association to one Matches on match.match_id = $self.match_ID; // Referential Constraint
    }