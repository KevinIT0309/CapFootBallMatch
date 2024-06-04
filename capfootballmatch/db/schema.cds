namespace football.match;

using { managed } from '@sap/cds/common';

    entity Teams: managed {
        key team_id   : Integer;// increase automatic
        team_name     : String(100);
        group         : String(1);// A,B,C,D,E,F
    }


    entity Matches: managed {
        key match_id      : Integer;// increase automatic
        match_time        : DateTime;

        team1_ID          : Integer;
        team2_ID          : Integer;
        team1_score       : Integer;
        team2_score       : Integer;
        stage             : String(50);// group, knockout

        team1             : Association to one Teams on team1.team_id = $self.team1_ID;
        team2             : Association to one Teams on team2.team_id = $self.team2_ID;

        // association to Teams as team1 on team1.team_id = team1_id;
        // association to Teams as team2 on team2.team_id = team2_id;
    }

    entity Users: managed {
        key user_id    : Integer;// increase automatic
        username       : String(100);
        password       : String(256);// ramdom by UUID is also a good one
        email          : String(100);
    }

    entity Bets: managed {
        key bet_id       : Integer;// increase automatic
        bet_time         : DateTime;// Date and time when the bet was placed

        user_ID          : Integer;
        match_ID         : Integer;
        team_win_ID      : Integer;
        isDraw           : Boolean default null;// otherwise must true
        
        user             : Association to one Users on user.user_id = $self.user_ID;
        match            : Association to one Matches on match.match_id = $self.match_ID;

    }

    entity Scores: managed {
        key score_id  : Integer;

        user_ID       : Integer;
        match_ID      : Integer;
        points        : Integer;
        
        user             : Association to one Users on user.user_id = $self.user_ID;
        match            : Association to one Matches on match.match_id = $self.match_ID;

    }