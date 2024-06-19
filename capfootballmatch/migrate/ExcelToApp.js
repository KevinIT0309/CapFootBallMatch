console.warn(`Start Migration - Please aware that bet from Excel will replace bet from Apps`);
console.log(`Read Data from excel`);//Read Bets.xlsx dùng xlsx libary
console.log(`Read Match By Columns`);
console.log(`Read User Bets by Row (UserID)`);//Thêm cột UserID vào đầu sau khi tải file excel về
//Đọc bet nếu W -> Team Win ID là team 1; L: Team Win ID là team 2; D là hòa
console.log(`Prepare Payload to call API`);