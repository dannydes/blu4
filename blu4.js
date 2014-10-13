var rows = 8;
var columns = 9;

var board;
var turn;
var row;
var c;
var ctx;
var X;
var Y;
var playTime;
var column;
var dotcount;

function createBArray() {
	board = new Array(rows);
	for (var r=0; r<rows; r++)
		board[r] = new Array(columns);
}

function initGame(canvasElement) {
	playTime = false;
	createBArray();
	if (!canvasElement) {
		canvasElement = document.createElement("canvas");
		canvasElement.id = "blu4Canvas";
		document.body.appendChild(canvasElement);
	}
	c = canvasElement;
	c.height = "960";
	c.width = "900";
	ctx = c.getContext("2d");
	c.addEventListener("click", onClick, false);
	c.addEventListener("mousemove", onMouseMove, false);
	drawMenu();
}

function onMouseMove(e) {
	if (playTime) {
		column = Math.round((getCursorPosition(e).X-50)/110);
		ctx.fillStyle = "greenyellow";
		if (turn == 1)
			ctx.fillStyle = "red";
		ctx.beginPath();
		ctx.arc(50+column*110, 50, 20, 0, 2*Math.PI);
		ctx.closePath();
		ctx.fill();
	}
}

function drawMenu() {
	ctx.clearRect(0, 0, 960, 1000);
	ctx.fillStyle = "black";
	ctx.font = "bold 60px arial";
	ctx.fillText("Web Line Up 4", 0, 50);
	ctx.fillStyle = "blue";
	ctx.font = "25px arial";
	ctx.fillRect(275, 100, 300, 50);
	ctx.fillRect(275, 250, 300, 50);
	if (localStorage.board && localStorage.nextturn)
		ctx.fillRect(275, 400, 300, 50);
	ctx.fillStyle = "red";
	ctx.fillText("New 1 vs 1 on same PC", 275, 145);
	if (localStorage.board && localStorage.nextturn)
		ctx.fillText("Resume last game", 275, 445);
}

function drawBoard() {
	playTime = true;
	ctx.clearRect(0, 0, 460, 70);
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 100, 960, 900);
	ctx.fillStyle = "black";
	ctx.font = "15px arial";
	ctx.fillText("Back to Menu", 800, 20);
	for (var r = 0; r < 8; r++)
		for (var c = 0; c < 9; c++) {
			ctx.beginPath();
			ctx.arc(50+c*110, 150+r*110, 30, 0, Math.PI*2);
			ctx.closePath();
			ctx.fill();
		}
}

function Position(X, Y) {
	this.X = X;
	this.Y = Y;
}

function getCursorPosition(e) {
	var x;
	var y;
	if (e.pageX != undefined || e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
	}
	else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	x -= c.offsetLeft;
	y -= c.offsetTop;
	return new Position(x, y);
}

function onClick(e) {
	if (playTime)
		clickOnBoard(e);
	else	
		clickInMenu(e);
}

function clickInMenu(e) {
	if (getCursorPosition(e).X >= 275 && getCursorPosition(e).Y <= 575) {
		if (getCursorPosition(e).Y >= 100 && getCursorPosition(e).Y <= 150)
			startNewGame();
		if (localStorage.board && localStorage.nextturn && getCursorPosition(e).Y >= 400 && getCursorPosition(e).Y <= 450)
			restoreLastGame();
	}
}

function clickOnBoard(e)  {
	if (getCursorPosition(e).X >= 800 && getCursorPosition(e).Y <=20) {
		playTime = false;
		saveGame();
		drawMenu();
	}
	else {
		if (board[0][column] == 0) {
			for (var r = rows-1; r > -1; r--)
				if (board[r][column] == 0) {
					board[r][column] = turn;
					row = r;
					break;
				}
			//places the circle at the buttom of the column
			
			ctx.fillStyle = "greenyellow";
			if (turn == 1)
				ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.arc(50+column*110, 150+r*110, 30, 0, Math.PI*2);
			ctx.closePath();
			ctx.fill();
			//draws the circle at the appropriate position
			
			var count = row;
			dotcount = 0;
			while (dotcount<4 && count<rows && board[count][column]==turn) {
				dotcount++;
				count++;
			}
			//vertical check
			
			if (dotcount<4) {
				dotcount = 0;
				count = column;
				while (count<columns && board[row][count]==turn) {
					dotcount++;
					count++;
				}
				count = column-1;
				while (count>-1 && board[row][count]==turn) {
					dotcount++;
					count--;
				}
				//horizontal check
			
				if (dotcount<4) {
					dotcount = 0;
					var rcount = row-1, ccount = column+1;
					while (dotcount<4 && rcount>-1 &&  ccount<columns && board[rcount][ccount]==turn) {
						dotcount++;
						ccount++; //right columns
						rcount--; //upper rows
					}
					ccount = column;
					rcount = row;
					while (dotcount<4 && rcount<rows && ccount>-1 && board[rcount][ccount]==turn) {
						dotcount++;
						ccount--; //left columns
						rcount++; //lower rows
					}
					
					if (dotcount<4) {
						dotcount = 0;
						rcount = row-1;
						ccount = column-1;
						while (dotcount<4 && rcount>-1 && ccount>-1 && board[rcount][ccount]==turn) {
							dotcount++;
							ccount--; //left columns
							rcount--; //upper rows
						}
						ccount = column;
						rcount = row;
						while (dotcount<4 && rcount<rows && ccount<columns && board[rcount][ccount]==turn) {
							dotcount++;
							ccount++; //right columns
							rcount++; //lower rows
						}
					}
				}
			}
			
			if ( turn == 1 )
				turn = 2;
			else
				turn = 1;
				//switches turn			
		}
		
		if (dotcount > 3) {
			playTime = false;
			ctx.clearRect(100, 450, 350, 70);
			ctx.fillStyle = "black";
			ctx.font = "25px arial";
			var winner = (turn == 1)? "Green": "Red";
			ctx.fillText(winner + " wins!", 100, 500);
			setTimeout("drawMenu()", 5000);
		}
	}
}

function startNewGame() {
	ctx.clearRect(0, 0, 960, 1000);
	for (var r = 0; r < rows; r++)
		for (var c = 0; c < columns; c++)
			board[r][c] = 0;
	turn = 1;
	drawBoard();
}

function saveGame() {
	localStorage.nextturn = turn;
	localStorage.board = board;
}

function restoreLastGame() {
	playTime = true;
	turn = Number(localStorage.nextturn); //the last turn 
	for (var count = 0; count > 2*columns*rows; count += 2)
		board[Math.floor(count/rows)][count%rows] = Number(localStorage.board.charAt(count));
	ctx.clearRect(0, 0, 460, 70);
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 100, 960, 900);
	ctx.fillStyle = "black";
	ctx.font = "15px arial";
	ctx.fillText("Back to Menu", 800, 20);
	for (var r = 0; r < rows; r++)
		for (var c = 0; c < columns; c++) {
			ctx.fillStyle = "black";
			if (board[r][c] == 1)
				ctx.fillStyle = "red";
			if (board[r][c] == 2)
				ctx.fillStyle = "greenyellow";
			ctx.beginPath();
			ctx.arc(50+c*110, 150+r*110, 30, 0, Math.PI*2);
			ctx.closePath();
			ctx.fill();
		}
}