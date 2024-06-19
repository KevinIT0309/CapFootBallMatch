namespace football.match.view;

using football.match as fms from '../schema';

view LeaderBoards as select from fms.Users as u
    inner join fms.Bets as b on b.user_ID = u.user_id
    inner join fms.Matches as m on m.match_id = b.match_ID
    left outer join fms.Scores as s on s.user_ID = u.user_id and s.match_ID = b.match_ID
{
    key u.user_id as userId : String,
    u.fullName as userFullName : String,
    u.email as userEmail : String,
    coalesce(sum(s.points), 0) as currentPoints : String,
    count(b.ID) as totalBet: Integer,
    coalesce(count(case when m.team_win_ID = b.team_win_ID then 1 else null end), 0) as winning : Integer,//Count winning by team win id only for draw should update later
    row_number() over (order by coalesce(sum(s.points), 0) desc, coalesce(count(case when m.team_win_ID = b.team_win_ID then 1 else null end), 0) desc, count(b.ID) desc) as rank: Integer
    // dense_rank() over (order by coalesce(sum(s.points), 0) desc) as rank : Integer
    // rank() over (order by coalesce(sum(s.points), 0) desc, coalesce(count(case when m.team_win_ID = b.team_win_ID then 1 else null end), 0) asc) as rank : Integer
}
group by
    u.user_id,
    u.fullName,
    u.email
order by currentPoints desc, winning desc, totalBet desc;


view BetStatistics as select from fms.Bets as b 
    inner join fms.Matches as m on m.match_id = b.match_ID
    inner join fms.Teams as t on t.team_id = b.team_win_ID 
{
    key b.user_ID as userId: String,
    b.team_win_ID as teamWinId: String,
    b.modifiedAt as modifiedAt: String,
    t.team_name as teamNameWin: String,
    m.match_id as matchId: String,
    m.match_name as matchName: String,
    m.match_time as matchTime: String
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
            )          as currentPoints : String,
    }
    group by
        s.user_ID;

view BetHistory as
    select from UserPoints as tp
    inner join fms.Bets as b
        on b.user_ID = tp.userId
    inner join fms.Teams as t
        on t.team_id = b.team_win_ID
    {
        tp.userFullName  as userName      : String,
        tp.currentPoints as currentPoints : Integer,
        b.ID             as betID         : String,
        b.team_win_ID    as teamWinID     : String,
        b.match_ID       as match_ID      : Integer,
        b.bet_time       as betTime       : String,
        t.team_name      as teamWinName   : String,
        b.predictGoals,
        b.modifiedAt     as modifiedAt    : String,
        b.modifiedBy     as modifiedBy    : String,
        dense_rank() over(
            order by tp.currentPoints desc, tp.userId
        )                as rank          : Integer
    }
    order by
        tp.currentPoints desc;