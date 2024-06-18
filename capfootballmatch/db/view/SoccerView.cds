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
    dense_rank() over (order by coalesce(sum(s.points), 0) desc) as rank : Integer
    // rank() over (order by coalesce(sum(s.points), 0) desc, coalesce(count(case when m.team_win_ID = b.team_win_ID then 1 else null end), 0) asc) as rank : Integer
}
group by
    u.user_id,
    u.fullName,
    u.email
order by currentPoints desc, winning desc, totalBet desc;