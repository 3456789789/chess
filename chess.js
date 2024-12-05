const board = [
	['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
	['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
	['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

let selectedCell = null;
let isWhiteTurn = true;

function isWhite(figure) {
	return ['♕', '♔', '♗', '♘', '♖', '♙'].includes(figure);
}

function isKing(figure) {
	return ['♚', '♔'].includes(figure);
}

function thereIsFigureBetweenCellsOnDirectLine(row1, column1, row2, column2) {
	if (column1 == column2) {
		const minRow = row1 < row2 ? row1 : row2;
		const maxRow = row1 > row2 ? row1 : row2;

		for (let i = minRow + 1; i < maxRow; i++) {
			if (board[i][column1]) {
				return true;
			}
		}
	} else if (row1 == row2) {
		const minColumn = column1 < column2 ? column1 : column2;
		const maxColumn = column1 > column2 ? column1 : column2;

		for (let i = minColumn + 1; i < maxColumn; i++) {
			if (board[row1][i]) {
				return true;
			}
		}
	}

	return false;
}

function thereIsFigureBetweenCellsOnDiagonalLine(row1, column1, row2, column2) {
	let increasingRowIndex, increasingColumnIndex, row = row1, column = column1;

	if (row1 < row2) {
		increasingRowIndex = true;
		row++;
	} else {
		row--;
	}

	if (column1 < column2) {
		increasingColumnIndex = true;
		column++;
	} else {
		column--;
	}

	while (row != row2) {
		if (board[row][column]) {
			return true;
		}

		row += increasingRowIndex ? 1 : -1;
		column += increasingColumnIndex ? 1 : -1;
	}

	return false;
}

function canEnemyKingAttackCell(fromRow, fromColumn, to) {
	const toRow = +to.getAttribute('row');
	const toColumn = +to.getAttribute('column');

	const verticalStep = Math.abs(fromRow - toRow);
	const horizontalStep = Math.abs(toColumn - fromColumn);

	return verticalStep < 2 && horizontalStep < 2;
}

function isDangerCell(to, forWhite) {
	for (const [rowIndex, row] of board.entries()) {
		for (const [columnIndex, cell] of row.entries()) {

			if (cell && (forWhite ? !isWhite(cell) : isWhite(cell)) && (isKing(cell) ? canEnemyKingAttackCell(rowIndex, columnIndex, to) : isPossibleMove(document.querySelector(`[row='${rowIndex}'][column='${columnIndex}']`), to, true))) {
				return true;
			}
		}
	}

	return false;
}

function isPossibleMove(from, to, withAttack) {
	const fromFigure = from.innerHTML;
	const toFigure = to.innerHTML;

	if (isWhiteTurn && !isWhite(fromFigure) || !isWhiteTurn && isWhite(fromFigure)) {
		return false;
	}

	if (isWhite(fromFigure) == isWhite(toFigure) && toFigure) { // TO DO Рокировка castling
		return false;
	}

	const fromRow = +from.getAttribute('row');
	const fromColumn = +from.getAttribute('column');

	const toRow = +to.getAttribute('row');
	const toColumn = +to.getAttribute('column');

	let verticalStep, maxStep;
	const horizontalStep = Math.abs(toColumn - fromColumn);

	switch (fromFigure) {
		case '♙':
			verticalStep = fromRow - toRow;
			maxStep = fromRow == 6 ? 2 : 1;
		case '♟':
			if (typeof verticalStep === 'undefined') {
				verticalStep = toRow - fromRow;
				maxStep = fromRow == 1 ? 2 : 1;
			}

			if (verticalStep <= 0 || verticalStep > maxStep || horizontalStep > 1 || (verticalStep == 2 && horizontalStep != 0)
			 || (horizontalStep && !toFigure && !withAttack) || (!horizontalStep && (toFigure || withAttack))) {
				return false;
			}
			break;
		case '♖':
		case '♜':
			verticalStep = Math.abs(fromRow - toRow);
			if (verticalStep && horizontalStep || thereIsFigureBetweenCellsOnDirectLine(fromRow, fromColumn, toRow, toColumn)) {
				return false;
			}
			break;
		case '♘':
		case '♞':
			verticalStep = Math.abs(fromRow - toRow);
			const possibleMove = verticalStep == 2 && horizontalStep == 1 || horizontalStep == 2 && verticalStep == 1;
			if (!possibleMove) {
				return false;
			}
			break;
		case '♗':
		case '♝':
			verticalStep = Math.abs(fromRow - toRow);
			if (!verticalStep || !horizontalStep || (verticalStep != horizontalStep) || thereIsFigureBetweenCellsOnDiagonalLine(fromRow, fromColumn, toRow, toColumn)) {
				return false;
			}
			break;
		case '♕':
		case '♛':
			verticalStep = Math.abs(fromRow - toRow);
			possibleDiagonalMove = verticalStep == horizontalStep && !!verticalStep && !thereIsFigureBetweenCellsOnDiagonalLine(fromRow, fromColumn, toRow, toColumn);
			possibleDirectLineMove = (!!verticalStep ^ !!horizontalStep) && !thereIsFigureBetweenCellsOnDirectLine(fromRow, fromColumn, toRow, toColumn);
			
			if (!(possibleDiagonalMove ^ possibleDirectLineMove)) {
				return false;
			}
			break;
		case '♔':
		case '♚':
			verticalStep = Math.abs(fromRow - toRow);

			if (verticalStep > 1 || horizontalStep > 1 || isDangerCell(to, fromFigure == '♔')) {
				return false;
			}
			break;
	}

	return true;
}

function onCellClickHandler(e) {
	const cell = e.target;

	if (selectedCell && selectedCell !== cell && isPossibleMove(selectedCell, cell)) {
		const figure = selectedCell.innerHTML;

		cell.innerHTML = figure;
		board[cell.getAttribute('row')][cell.getAttribute('column')] = figure;

		selectedCell.innerHTML = '';
		board[selectedCell.getAttribute('row')][selectedCell.getAttribute('column')] = '';


		selectedCell = null;
		isWhiteTurn = !isWhiteTurn;
	} else if (cell.innerHTML) {
		selectedCell = cell;
	}
}

function renderBoard() {
	const boardElement = document.querySelector('.board');
	let isWhiteCell = true;
	for (const [rowIndex, row] of board.entries()) {
		for (const [columnIndex, cell] of row.entries()) {
			const cellElement = document.createElement("div");
			cellElement.innerHTML = cell;
			if (!isWhiteCell) {
				cellElement.classList.add('black');
			}
			cellElement.setAttribute("row", rowIndex);
			cellElement.setAttribute("column", columnIndex);
			cellElement.onclick = onCellClickHandler;
			boardElement.appendChild(cellElement);
			isWhiteCell = !isWhiteCell;
		}
		isWhiteCell = !isWhiteCell;
	}
}

renderBoard();

