const gameName = 'Munchie Gobbler';

class GameBoard {

  /*
   * The board is displayed with 0, 0 at the top left corner.
   * x represents the column, and y represents the row.
   *
   *    0  1  2  3  4
   *
   *    5  6  7  8  9
   *
   * ^ 10 11 12 13 14
   * |
   * y 15 16 17 18 19
   *   x - >
   */

  constructor(x, y) {
    this.dimX = x;
    this.dimY = y;
    this.size = x * y;

    this.board = [];

    for (let i = 0; i < this.dimX * this.dimY; i++) {
      this.board.push(null);
    }

  }

  setItem(index, item) {
    if (index < this.size) {
      if (this.board[index]) {
        return false;
      } else {
        this.board[index] = item;
        return true;
      }
    } else {
      return false;
    }
  }

  getItem(index) {
    if (index < this.size) {
      return this.board[index];
    } else {
      return null;
    }
  }

  removeItem(index) {
    let item = this.getItem(index);
    this.board[index] = null;
    return item;
  }

  getSize() {
    return this.size;
  }

  getDimensions() {
    return {
      x: this.dimX,
      y: this.dimY,
    }
  }

  displayInfo() {
    return {
      dimX: this.dimX,
      dimY: this.dimY,
      board: this.board.slice(),
    };
  }
}

class Item {
  constructor(name, points = 0, type) {
    this.name = name;
    this.type = type;
    this.points = points;

    this.element = document.createElement('div');
    this.element.classList.add(this.type);
  }

  getElement() {
    return this.element;
  }

  getType() {
    return this.type;
  }

  getScore() {
    return this.points;
  }
}

class Munchie extends Item {
  constructor(name, points) {
    super(name, points, 'munchie');
  }
}

class Blob extends Item {


  constructor() {
    super('blob', 0, 'blob');
  }
}

class MunchieGobblerGame {

  /*
   * Initialize the game page
   * Attach event handlers
   */
  constructor() {
    buildTitle(gameName);

    this.setMenu();
    buildMenu(this.menu);

    buildPlayingField();

    buildScoreBoards();

    this.setOptions();
    buildOptions(this.options);

    this.setInstructions();
    buildInstructions(this.instructions);

    this.setResetDialog();
    //buildResetDiaolg(this.resetDialog);

    this.setPrompt();
    updatePromptStart(this.prompt);

    buildFooter();

    this.setEvents();
    buildEventHandlers(this.events);

    this.setMoves();

    this.currentGame = false;
    this.pause = false;

    this.actionQueue = new DoQueue(200, 0);
  }

  /*
   * Generate a new board
   */
  startGame() {
    if (this.currentGame && this.resetDialog.reset) {
      this.actionQueue.addToQueue(function() {
        removeBoard();
      }.bind(this));
    }
    this.currentGame = true;
    this.gameBoard = new GameBoard(this.options.dimX, this.options.dimY);

    this.switchPlayer('Player 1');
    this.munchiesPlaced = {};
    this.munchiesGobbled = {
      'Player 1': [],
      'Player 2': [],
    };

    this.currentMove = {
      direction: null,
      spaces: null,
      hasMoves: function() {
        return !!this.direction;
      },
      reset: function() {
        this.direction = null;
        this.spaces = null;
      },
      addMove: function(index, direction) {
        this.direction = direction;
        this.spaces.push(index);
      },
      lastMove: function() {
        return this.spaces[this.spaces.length - 1];
      },
    };

    this.blob = {
      index: randomizeInt({
        lower: 0,
        upper: this.options.size(),
      }),
      blob: new Blob(),
      moveTo: function(index) {
        this.index = index;
      },
    }

    this.gameBoard.setItem(
      this.blob.index,
      this.blob.blob);

    switch (this.options.obstacles) {
      case 'none':
        break;
      case 'mild':
        break;
      case 'medium':
        break;
      case 'spicy':
        break;
      case 'hell fire':
        break;
      default:
        break;
    }


    // Generate Munchies

    switch (this.options.munchies) {
      case 'average':
        break;
      case 'sweets':
        break;
      case 'sweet and sour':
        break;
      case 'savory':
        break;
      default:
        break;
    }

    let munchieCount = randomizeInt({
      lower: this.options.size() * .1,
      upper: this.options.size() * .15,
    });

    let upperLimit = munchieCount + (munchieCount / 2);
    for (let i = 0; i < munchieCount && i < upperLimit; i++) {
      let index = randomizeInt({
        lower: 0,
        upper: this.options.size(),
      });
      if (this.spaceCheck(index)) {
        this.munchiesPlaced[index] = new Munchie('candy', 3);
        this.gameBoard.setItem(index, this.munchiesPlaced[index]);
      } else {
        munchieCount++;
      }
    }
    if (this.resetDialog.reset) {
      this.resetDialog.reset = false;
    } else {}
    this.actionQueue.addToQueue(function() {
      showBoard(this.gameBoard);
    }.bind(this));
  }

  spaceCheck(index) {
    if (this.gameBoard.getItem(index)) {
      return false;
    }
    return true;
  }

  munchiesLeft() {
    return Object.keys(thisGame.munchiesPlaced).length;
  }

  /*
   *
   */
  switchPlayer(player) {
    if (player) {
      this.player = player;
    } else {
      switch (this.player) {
        case 'Player 1':
          this.player = 'Player 2';
          break;
        default:
          this.player = 'Player 1';
      }
    }
    activePlayer(this.player);
    updatePromptPlayer(this.prompt, this.player);
  }

  /*
   * finalizeTurn
   */
  finalizeTurn() {
    if (!this.currentGame && !this.pause) {
      // No current game
      this.startGame();
    } else if (!this.pause && this.currentMove.hasMoves()) {
      // Move the Blob and Gobble Munchies!
      this.currentMove.spaces.forEach(index => {
        let munchie = this.gameBoard.removeItem(index);
        if (munchie) {
          delete this.munchiesPlaced[index];
          this.munchiesGobbled[this.player].push(munchie);
          addMunchie(munchie, this.player);
          let player1Score = this.munchiesGobbled['Player 1'].map(munchie => munchie.getScore()).reduce((a, b) => a + b, 0);
          let player2Score = this.munchiesGobbled['Player 2'].map(munchie => munchie.getScore()).reduce((a, b) => a + b, 0);
          updateScores(player1Score, player2Score);
        }
      });
      //Check if we have any more munchies left!
      if (this.munchiesLeft() === 0) {
        this.pause = true;
        this.currentGame = false;
        clearMoves();
        removeBoard();
      } else {
        this.switchPlayer();
        this.gameBoard.removeItem(this.blob.index);
        this.blob.moveTo(index);
        this.gameBoard.setItem(
          this.blob.index,
          this.blob.blob);
        this.currentMove.reset();
        clearMoves();
        updateBoard(this.gameBoard);
      }
    }
  }

  setMenu() {
    this.menu = new Menu();
    this.menu.addItem({
      title: 'Options',
      type: 'click',
      icon: 'fa-cog',
      action: this.displayOptions.bind(this),
      float: 'right',
    });
    this.menu.addItem({
      title: 'Instructions',
      type: 'click',
      icon: 'fa-file-alt',
      action: this.displayInstructions.bind(this),
      float: 'right',
    });
    // this.menu.addItem({
    //   title: 'Reset Game',
    //   type: 'click',
    //   icon: 'fa-undo-alt',
    //   action: this.displayResetDialog.bind(this),
    //   float: 'right',
    // });
  }

  setOptions() {
    this.options = {
      dimX: 11,
      dimY: 11,
      size: function() {
        return this.dimX * this.dimY;
      },
      obstacles: 'none',
      munchies: 'average',
      buttons: [{
          text: 'Cancel',
          style: 'button-2',
          action: this.closePages.bind(this),
        },
        {
          text: 'Save',
          style: 'button-1',
          action: this.closePages.bind(this),
        },
      ],
      show: false,
    };
  }

  setInstructions() {
    this.instructions = {
      title: 'Munchie Gobbler: Instructions',
      paragraphs: [{
          heading: 'Game Board',
          text: ['The Map is laid out in a grid of squares. Each square can contain one of the following: the Blob, a Munchie, or a Blocker.'],
        },
        {
          heading: 'Gameplay',
          text: ['Each player takes turns choosing a move for the Blob. You may move one direction as many spaces as you want. You must move at least one space. You cannot move through Blockers or off the Map!',
            'Each Munchie you you encounter will be added to your jar, and you will earn points.',
            'Beware: some Munchies might have negative points!'
          ],
        },
        {
          heading: 'Keys',
          text: [
            'Space/Enter: Begin game or finalize turn',
            'Arrows/WASD: Select direction and distance to move',
            'O: Options',
            'I: Instructions (this page!)',
            'R: Reset',
            'Esc: Close or cancel open page'
          ],
        }
      ],
      buttons: [{
        text: 'Done',
        style: 'button-1',
        action: this.closePages.bind(this),
      }, ],
      show: false,
    };
  }

  setResetDialog() {
    this.resetDialog = {
      reset: false,
      title: 'Reset Game Confirmation',
      paragraphs: [{
        heading: 'Are you sure you want to reset this game?',
        text: ['Resetting the game will discard all gobbled munchies and generate a new board.']
      }, ],
      buttons: [{
          text: 'Play On',
          style: 'button-2',
          action: this.closePages.bind(this),
        },
        {
          text: 'Reset Game',
          style: 'button-1',
          action: function() {
            this.closePages();
            this.resetDialog.reset = true;
            setTimeout(this.startGame.bind(this), 500)
          }.bind(this),
        },
      ],
      show: false,
    }
  }

  setPrompt() {
    this.prompt = {
      welcome: 'Press Space or Enter to start Game!',
      pause: 'Press Esc to return to Game...',
      playerLine2: 'Tap the arrow keys to select where to move the Blob.',
      playerLine3: 'Press Space or Enter to finalize.',
      winner: '$Player has won the game! They ate Munchies to earn $Points points!',
    };
  }

  setEvents() {
    this.events = {
      keydown: {
        Space: this.finalizeTurn.bind(this),
        Enter: this.finalizeTurn.bind(this),
        ArrowUp: function() {
          this.addMove('up');
        }.bind(this),
        KeyW: function() {
          this.addMove('up');
        }.bind(this),
        ArrowRight: function() {
          this.addMove('right');
        }.bind(this),
        KeyD: function() {
          this.addMove('down');
        }.bind(this),
        ArrowDown: function() {
          this.addMove('down');
        }.bind(this),
        KeyS: function() {
          this.addMove('down');
        }.bind(this),
        ArrowLeft: function() {
          this.addMove('left');
        }.bind(this),
        KeyA: function() {
          this.addMove('left');
        }.bind(this),
        KeyI: this.displayInstructions.bind(this),
        KeyO: this.displayOptions.bind(this),
        KeyR: this.displayResetDialog.bind(this),
        Escape: this.closePages.bind(this),
      },
      click: {

      },
    };
  }

  setMoves() {
    // methods calculate the new index for each move type
    this.moveCalc = {
      up: function(index, width) {
        return index - width;
      },
      right: function(index) {
        return index + 1;
      },
      down: function(index, width) {
        return index + width;
      },
      left: function(index) {
        return index - 1;
      }
    }

    // methods check to make sure the move isn't going out of bounds for each move type
    this.moveValidate = {
      up: function(index) {
        return index >= 0;
      },
      right: function(index, origin, width) {
        return Math.floor(index / width) === Math.floor(origin / width);
      },
      down: function(index, origin, width, size) {
        return index <= size;
      },
      left: function(index, origin, width) {
        return Math.floor(index / width) === Math.floor(origin / width);
      }
    }
  }


  /*
   * displayOptions, displayInstructions, and closePages handle the overlay pages
   */
  displayOptions() {
    this.closePages();
    this.options.show = true;
    this.pause = true;
    updatePromptPause(this.prompt);
    showPage('options');
  }

  displayInstructions() {
    this.closePages();
    this.instructions.show = true;
    this.pause = true;
    updatePromptPause(this.prompt);
    showPage('instructions');
  }

  displayResetDialog() {
    this.closePages();
    this.resetDialog.show = true;
    this.pause = true;
    updatePromptPause(this.prompt);
    showPage('resetDialog');
  }

  closePages() {
    if (this.pause) {
      this.options.show = false;
      this.instructions.show = false;
      this.resetDialog.show = false;
      this.pause = false;
      if (this.currentGame) {
        updatePromptPlayer(this.prompt, this.player);
      } else {
        updatePromptStart(this.prompt);
      }
      showPage(null);
    }
  }

  /*
   * Handle the arrow moves
   */
  addMove(direction) {
    if (!this.pause && this.currentGame) {
      let move = this.currentMove;
      let lastMove, nextMove;
      if (move.direction !== direction) {
        move.direction = direction;
        move.spaces = [];
      }
      if (move.spaces.length > 0) {
        // Start at the last move
        lastMove = move.lastMove();
      } else {
        // Otherwise, start at the Blob's current index
        lastMove = this.blob.index;
      }
      nextMove = this.moveCalc[direction](lastMove, this.options.dimX);
      if (this.moveValidate[direction](
          nextMove,
          lastMove,
          this.options.dimX,
          this.options.size())) {
        // Only add move if we're not off the board!
        move.spaces.push(nextMove);
      }
      showMoves(move);
    }
  }
}

let thisGame = new MunchieGobblerGame();
// thisGame.startGame();