## Counting Data
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
                    // if (UICommon.fnIsDevEnv()) {
                    //     const aLeaderBoards = this._buildLeaderBoardList(fakeLeaderBoards);
                    //     oLocalModal.setProperty("/leaderBoards", aLeaderBoards);
                    //     oLocalModal.refresh();
                    // }
```