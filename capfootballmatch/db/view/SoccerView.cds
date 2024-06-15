namespace football.match.view;

using football.match as fms from '../schema';

view LeaderBoards as select from fms.Users as u
    join fms.Scores as s on s.user_ID = u.user_id
    left join fms.Bets as b on b.user_ID = u.user_id and b.match_ID = s.match_ID
    join fms.Matches as m on m.match_id = s.match_ID
{
    key u.user_id as userId : String,
    u.fullName as userFullName : String,
    u.email as userEmail : String,
    sum(s.points) as currentPoints : Integer,
    count(case when m.team_win_ID = b.team_win_ID then 1 else null end) as winning : Integer,
    rank() over (order by sum(s.points) desc, count(case when m.team_win_ID = b.team_win_ID then 1 else null end) asc) as rank : Integer
}
group by
    u.user_id,
    u.fullName,
    u.email
order by rank;
