namespace football.match.view;

using football.match as fms from '../schema';

view LeaderBoards as
    select from fms.Users as u
    inner join fms.Bets as b
        on b.user_ID = u.user_id
    inner join fms.Matches as m
        on m.match_id = b.match_ID
    left outer join fms.Scores as s
        on  s.user_ID  = u.user_id
        and s.match_ID = b.match_ID
    {
        key u.user_id  as userId        : String,
            u.fullName as userFullName  : String,
            u.email    as userEmail     : String,
            coalesce(
                sum(
                    s.points
                ), 0
            )          as currentPoints : String,
            count(
                b.ID
            )          as totalBet      : Integer,
            coalesce(
                sum(
                    case
                        when
                            b.isDraw          = true
                            and m.team1_score = m.team2_score
                        then
                            1
                        when
                            m.team_win_ID = b.team_win_ID
                        then
                            1
                        else
                            0
                    end
                ), 0
            )          as winning       : Integer,
            row_number() over(
                order by coalesce(
                    sum(
                        s.points
                    ), 0
                ) desc, coalesce(
                    sum(
                        case
                            when
                                b.isDraw          = true
                                and m.team1_score = m.team2_score
                            then
                                1
                            when
                                m.team_win_ID = b.team_win_ID
                            then
                                1
                            else
                                0
                        end
                    ), 0
                ) desc, count(
                    b.ID
                ) desc
            )          as rank          : Integer
    }

    group by
        u.user_id,
        u.fullName,
        u.email
    order by
        currentPoints desc,
        winning       desc,
        totalBet      desc;


view BetStatistics as
    select from fms.Bets as b
    inner join fms.Matches as m
        on m.match_id = b.match_ID
    inner join fms.Teams as t
        on t.team_id = b.team_win_ID
    {
        key b.user_ID     as userId      : String,
            b.team_win_ID as teamWinId   : String,
            b.modifiedAt  as modifiedAt  : String,
            t.team_name   as teamNameWin : String,
            m.match_id    as matchId     : String,
            m.match_name  as matchName   : String,
            m.match_time  as matchTime   : String
    }

view UserPoints as
    select from fms.Users as u
    left outer join fms.Scores as s
        on s.user_ID = u.user_id
    {
        key u.user_id  as userId        : String,
            u.fullName as userFullName  : String,
            u.email    as userEmail     : String,
            coalesce(
                sum(
                    s.points
                ), 0
            )          as currentPoints : String
    }
    group by
        u.user_id,
        u.fullName,
        u.email;

view BetHistory as
    select from LeaderBoards as lb
    inner join fms.Bets as b
        on b.user_ID = lb.userId
    inner join fms.Teams as t
        on t.team_id = b.team_win_ID
    {
        lb.rank          as rank          : Integer,
        lb.userId        as userId        : String,
        lb.userFullName  as userName      : String,
        lb.currentPoints as currentPoints : Integer,
        b.ID             as betID         : String,
        b.isDraw         as isDraw        : Boolean,
        b.team_win_ID    as teamWinID     : String,
        b.match_ID       as match_ID      : Integer,
        b.bet_time       as betTime       : String,
        t.team_name      as teamWinName   : String,
        b.predictGoals,
        b.modifiedAt     as modifiedAt    : String,
        b.modifiedBy     as modifiedBy    : String
    }
    order by
        lb.rank asc;


view MatchesBets as
    select from fms.Matches as m
        left outer join fms.Bets as b
            on b.match_ID = m.match_id
        {
            key m.match_id as match_id : String,
                m.match_name as match_name : String,
                m.match_time as match_time : String,
                m.status as status : Integer,
                m.isOver as isOver : Boolean,
                m.team1_ID as team1_ID : Integer,
                m.team2_ID as team2_ID : Integer,
                m.team1_score as team1_score : Integer,
                m.team2_score as team2_score : Integer,
                m.team_win_ID as team_win_ID : Integer,
                m.stage as stage : String,
                b.user_ID as user_ID : String,
                b.team_win_ID as team_win_ID_Bet : String,
                b.isDraw as is_draw : Boolean,
    }