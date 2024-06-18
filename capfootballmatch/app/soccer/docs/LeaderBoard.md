## Counting Data
items="{local>/leaderBoards}"
items="{path: 'mainModel>/LeaderBoards'}"
Nếu 2 user cùng match, cùng điểm -> sort theo timebet của latest match

### Winning
- Check team_win_ID với Match data xem user đoán đúng hay ko
    + Đúng: +1
    + Sau: 0
### Current Score
- Count trong bảng Scores theo user_ID

### Fake data
```
 const fakeLeaderBoards = [
                        {
                            "rank": 1,
                            "playerName": "Tom Wilson",
                            "playerEmail": "tom.wilson@example.com",
                            "winning": 4,
                            "score": 92
                        },
                        {
                            "rank": 2,
                            "playerName": "Michael Johnson",
                            "playerEmail": "michael.johnson@example.com",
                            "winning": 3,
                            "score": 91
                        },
                        {
                            "rank": 3,
                            "playerName": "Chris Anderson",
                            "playerEmail": "chris.anderson@example.com",
                            "winning": 3,
                            "score": 88
                        },
                        {
                            "rank": 4,
                            "playerName": "John Doe",
                            "playerEmail": "john.doe@example.com",
                            "winning": 3,
                            "score": 87
                        },
                        {
                            "rank": 5,
                            "playerName": "David Lee",
                            "playerEmail": "david.lee@example.com",
                            "winning": 2,
                            "score": 85
                        },
                        {
                            "rank": 6,
                            "playerName": "Sarah Davis",
                            "playerEmail": "sarah.davis@example.com",
                            "winning": 1,
                            "score": 78
                        },
                        {
                            "rank": 7,
                            "playerName": "Rachel Garcia",
                            "playerEmail": "rachel.garcia@example.com",
                            "winning": 1,
                            "score": 75
                        },
                        {
                            "rank": 8,
                            "playerName": "Jane Smith",
                            "playerEmail": "jane.smith@example.com",
                            "winning": 0,
                            "score": 72
                        },
                        {
                            "rank": 9,
                            "playerName": "Lisa Taylor",
                            "playerEmail": "lisa.taylor@example.com",
                            "winning": 0,
                            "score": 69
                        },
                        {
                            "rank": 10,
                            "playerName": "Emily Brown",
                            "playerEmail": "emily.brown@example.com",
                            "winning": 0,
                            "score": 65
                        }
                    ];
                    if (UICommon.fnIsDevEnv()) {
                        this.hideBusy();
                        oLocalModal.setProperty("/leaderBoards", fakeLeaderBoards);
                        oLocalModal.refresh();
                    }

                     const oRequestLeaderBoardList = this._fnGetLeaderBoards();
                    $.when(oRequestLeaderBoardList).done((aOriginalLeaderBoards) => {
                        this.hideBusy();
                        const aLeaderBoards = this._buildLeaderBoardList(aOriginalLeaderBoards);
                        oLocalModal.setProperty("/leaderBoards", aLeaderBoards);
                        oLocalModal.refresh();
                    });
```

### Raw Query
```
select u.user_id as userId,
    u.fullName as userFullName ,
    u.email as userEmail,
	count(b.id) as totalBet,
    coalesce(count(case when m.team_win_ID = b.team_win_ID then 1 else null end), 0) as winning,
	coalesce(sum(s.points), 0) as currentPoints,
    row_number() over (order by coalesce(sum(s.points), 0) desc, coalesce(count(case when m.team_win_ID = b.team_win_ID then 1 else null end), 0) desc, count(b.id) desc) as rank
    //dense_rank() over (order by coalesce(sum(s.points), 0) desc) as rank
from "689785D5384B4DE7BD97D328387AE724"."FOOTBALL_MATCH_USERS" as u
    inner join "689785D5384B4DE7BD97D328387AE724"."FOOTBALL_MATCH_BETS" as b on b.user_ID = u.user_id
    inner join "689785D5384B4DE7BD97D328387AE724"."FOOTBALL_MATCH_MATCHES" as m on m.match_id = b.match_ID
    left outer join"689785D5384B4DE7BD97D328387AE724"."FOOTBALL_MATCH_SCORES" as s on s.user_ID = u.user_id and s.match_ID = b.match_id
 group by
    u.user_id,
    u.fullName,
    u.email
 order by currentPoints desc, winning desc, totalBet desc
 ```

### View
```

```