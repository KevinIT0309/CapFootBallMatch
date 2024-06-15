namespace football.match.view;

using football.match as fms from '../schema';

view LeaderBoards as select from fms.Users as u
    left outer join fms.Scores as s on s.user_ID = u.user_id
    left outer join fms.Bets as b on b.user_ID = u.user_id and b.match_ID = s.match_ID
    left outer join fms.Matches as m on m.match_id = s.match_ID
{
    key u.user_id as userId : String,
    u.fullName as userFullName : String,
    u.email as userEmail : String,
    coalesce(sum(s.points), 0) as currentPoints : Integer,
    coalesce(count(case when m.team_win_ID = b.team_win_ID then 1 else null end), 0) as winning : Integer,
    rank() over (order by coalesce(sum(s.points), 0) desc, coalesce(count(case when m.team_win_ID = b.team_win_ID then 1 else null end), 0) asc) as rank : Integer
}
group by
    u.user_id,
    u.fullName,
    u.email
order by rank;