//below function generates random integer between 0 and max -1
function rand(max) {
  //Math.random() generates a decimal number between 0 and 1
  //Multiplying it by "max" and using Math.floor() ensures the number is integer in the range [0, max-1].
  return Math.floor(Math.random() * max);
}

//below function shuffles an array "a" using the Fisher-Yates shuffle algorithm
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    //iterates through array backward and swaps each element with randomly chosen earlier element
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a; //ensures a uniform random shuffle
}

//"sprite" refers to an image used to represent the player character,it is a 2d img or animation
function changeBrightness(factor, sprite) {
  //creates temporary canvas to manipulate image
  var virtCanvas = document.createElement("canvas");
  virtCanvas.width = 500;
  virtCanvas.height = 500;
  var context = virtCanvas.getContext("2d");
  context.drawImage(sprite, 0, 0, 500, 500); //draws given sprite on canvas

  var imgData = context.getImageData(0, 0, 500, 500); //extracts pixel data from image

  for (let i = 0; i < imgData.data.length; i += 4) {
    //adjusts brightness by multiplying each color channel (R, G, B) by factor.
    imgData.data[i] = imgData.data[i] * factor; //red
    imgData.data[i + 1] = imgData.data[i + 1] * factor; //green
    imgData.data[i + 2] = imgData.data[i + 2] * factor; //blue
  }
  context.putImageData(imgData, 0, 0); //updates image on canvas

  //converts edited image into a new Image object and returns it
  var spriteOutput = new Image(); //creates new img object that hold & display img
  spriteOutput.src = virtCanvas.toDataURL(); //URL represents img data,URL assigned to "spriteOutput.src", effectively sets new img source to modified version of sprite
  virtCanvas.remove(); //"virtCanvas" was used to modify the brightness of the sprite,but after extracting img data no longer needed
  return spriteOutput; //holds modified version of original sprite with adjusted brightness
}

function displayVictoryMess(moves) {
  //updates moves counter
  document.getElementById("moves").innerHTML = "You Moved " + moves + " Steps.";
  toggleVisablity("Message-Container"); //shows victory message
}

//below code toggles an element’s visibility by changing its visibility style
function toggleVisablity(id) {
  if (document.getElementById(id).style.visibility == "visible") {
    document.getElementById(id).style.visibility = "hidden";
  } else {
    document.getElementById(id).style.visibility = "visible";
  }
}

// Maze Generation

//below function defines maze with given dimensions
function Maze(Width, Height) {
  //stores the maze grid and movement directions
  var mazeMap;
  var width = Width;
  var height = Height;
  var startCoord, endCoord; //stores player starts and ends in maze grid
  var dirs = ["n", "s", "e", "w"]; //directions
  var modDir = {
    //defines how movement affects x and y coordinates
    n: {
      //north(up)
      y: -1,
      x: 0,
      o: "s",
    },
    s: {
      //south(down)
      y: 1,
      x: 0,
      o: "n",
    },
    e: {
      //east(right)
      y: 0,
      x: 1,
      o: "w",
    },
    w: {
      //west(left)
      y: 0,
      x: -1,
      o: "e",
    },
  };

  this.map = function () {
    return mazeMap; //returns mazeMap variable which is (2d array structure)
  };
  this.startCoord = function () {
    return startCoord; //returns starting position of player
  };
  this.endCoord = function () {
    return endCoord; //returns ending position of player
  };

  function genMap() {
    mazeMap = new Array(height); //creates an array with a length equal to height
    //below loop iterates through y from 0 to height - 1 (each row),y represents row index
    for (y = 0; y < height; y++) {
      mazeMap[y] = new Array(width); //creates an array of width elements at each row index y
      //below loop iterates through x from 0 to width - 1 (each column in the row), x represents column index
      for (x = 0; x < width; ++x) {
        mazeMap[y][x] = {
          //false means no opening
          n: false, //north wall exists
          s: false, //south wall exists
          e: false, //east wall exists
          w: false, //west wall exists
          visited: false, //tracks if this cell has been visited
          priorPos: null, //stores the previous position
        };
      }
    }
  }

  function defineMaze() {
    var isComp = false; //indicates maze generation is not fully complete
    var move = false; //movement is currently possible
    var cellsVisited = 1; //starts at 1 because first cell is considered visited
    var numLoops = 0; //tracks how many (loops) the algorithm has gone through
    var maxLoops = 0; //stores the maximum number of iterations needed
    var pos = {
      //pos is an object that keeps track of the current position in the maze
      x: 0,
      y: 0,
    };
    var numCells = width * height; //calculates total number of cells in maze

    while (!isComp) {
      //loops until all cells are visited
      move = false;
      mazeMap[pos.x][pos.y].visited = true;

      //below if code randomizes direction choice after certain number of moves
      if (numLoops >= maxLoops) {
        shuffle(dirs);
        maxLoops = Math.round(rand(height / 8));
        numLoops = 0;
      }
      numLoops++;

      //below for code attempt movement in all directions
      for (index = 0; index < dirs.length; index++) {
        var direction = dirs[index];
        var nx = pos.x + modDir[direction].x;
        var ny = pos.y + modDir[direction].y;

        //ensures movement stays inside the grid
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          //Check if the tile is already visited
          if (!mazeMap[nx][ny].visited) {
            //Carve through walls from this tile to next
            mazeMap[pos.x][pos.y][direction] = true;
            mazeMap[nx][ny][modDir[direction].o] = true;

            //Set Currentcell as next cells Prior visited
            mazeMap[nx][ny].priorPos = pos;

            pos = {
              //Update Cell position to newly visited location
              x: nx,
              y: ny,
            };
            cellsVisited++;
            //Recursively call this method on the next tile
            move = true;
            break;
          }
        }
      }

      if (!move) {
        //  If it failed to find a direction,
        //  move the current position back to the prior(previous) cell and Recall the method.
        pos = mazeMap[pos.x][pos.y].priorPos;
      }
      if (numCells == cellsVisited) {
        isComp = true;
      }
    }
  }

  function defineStartEnd() {
    //randomly chooses one of four corner start/end positions
    switch (rand(4)) {
      //sets start and end coordinates
      case 0:
        startCoord = {
          x: 0,
          y: 0,
        };
        endCoord = {
          x: height - 1,
          y: width - 1,
        };
        break;
      case 1:
        startCoord = {
          x: 0,
          y: width - 1,
        };
        endCoord = {
          x: height - 1,
          y: 0,
        };
        break;
      case 2:
        startCoord = {
          x: height - 1,
          y: 0,
        };
        endCoord = {
          x: 0,
          y: width - 1,
        };
        break;
      case 3:
        startCoord = {
          x: height - 1,
          y: width - 1,
        };
        endCoord = {
          x: 0,
          y: 0,
        };
        break;
    }
  }

  //calls functions to generate the maze
  genMap();
  defineStartEnd();
  defineMaze();
}

//maze- object containg grid data,ctx- canvas drawing context,cellsize- size of each cell in maze,endSprite- img to mark maze's endpoint
function DrawMaze(Maze, ctx, cellsize, endSprite = null) {
  var map = Maze.map(); //Fetches the maze’s grid map (map)
  var cellSize = cellsize; //Stores cellSize for reference
  var drawEndMethod; //Initializes drawEndMethod, which will either draw a flag or a sprite
  ctx.lineWidth = cellSize / 40; //Sets stroke width for the maze lines

  //allow resizing the maze
  this.redrawMaze = function (size) {
    cellSize = size;
    ctx.lineWidth = cellSize / 50;
    drawMap(); //redrawing it
    drawEndMethod();
  };

  //converts grid coordinates into pixel coordinates
  function drawCell(xCord, yCord, cell) {
    var x = xCord * cellSize;
    var y = yCord * cellSize;

    //Draws a line for the north wall if "cell.n" is false (meaning no opening)
    if (cell.n == false) {
      ctx.beginPath(); //starts a new drawing path
      ctx.moveTo(x, y); // ctx.moveTo- defines the line's start
      ctx.lineTo(x + cellSize, y); //ctx.lineTo- defines the line's end points
      ctx.stroke(); //ctx.stroke()- to draw the outline of a shape
    }
    if (cell.s === false) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.e === false) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.w === false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
  }

  //loops through each cell and calls "drawCell()"" to draw the walls
  function drawMap() {
    for (x = 0; x < map.length; x++) {
      for (y = 0; y < map[x].length; y++) {
        drawCell(x, y, map[x][y]); //draw walls
      }
    }
  }

  //below function will occur at the end of maze
  function drawEndFlag() {
    //calls Maze.endCoord() that returns the x,y coordinates where maze ends
    var coord = Maze.endCoord(); //stores returned coordinates in variable coord
    var gridSize = 4; //Defines a variable gridSize with a value of 4
    var fraction = cellSize / gridSize - 2; //Determines size of each square in the checkered flag
    var colorSwap = true; //this will alternate between black and white squares to create checkered pattern.

    //Loops through y values (rows) from 0 to gridSize - 1 (4 iterations, one for each row)
    for (let y = 0; y < gridSize; y++) {
      //	If gridSize is even, colorSwap is toggled at the start of each row
      if (gridSize % 2 == 0) {
        colorSwap = !colorSwap;
      }

      //Loops through x values (columns) from 0 to gridSize - 1 (4 iterations, one for each column in the row)
      for (let x = 0; x < gridSize; x++) {
        ctx.beginPath(); //Starts a new drawing path for the current square

        //defines rectangle,which represents one square in checkered flag
        ctx.rect(
          coord.x * cellSize + x * fraction + 4.5, //X-coordinate
          coord.y * cellSize + y * fraction + 4.5, //Y-coordinate
          fraction, //width
          fraction //height
        );

        if (colorSwap) {
          //If colorSwap is true, fill it with black
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        } else {
          //if colorSwap is false, fill it with white
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        }
        ctx.fill(); //Fills the current rectangle with the selected color
        colorSwap = !colorSwap; //toggles colorSwap to alternate colors for the next square in row
      }
    }
  }

  //below function draws the end goal sprite at the maze’s end coordinates
  function drawEndSprite() {
    //helps in positioning the sprite slightly inward rather than touching the exact grid border
    var offsetLeft = cellSize / 50; //Calculates a small padding on left and top sides of the sprite
    var offsetRight = cellSize / 25; //Determines another offset used for the width and height
    var coord = Maze.endCoord(); //stores these coordinates in coord

    ctx.drawImage(
      //drawImage() function takes 9 parameters
      endSprite, //image object that represents the end goal sprite
      2, // Source X (cropping starts 2 pixels from the left)
      2, // Source Y (cropping starts 2 pixels from the top)
      endSprite.width, // Source width (entire width of the sprite)
      endSprite.height, //Source height (entire height of the sprite)
      coord.x * cellSize + offsetLeft, // Destination X on the canvas
      coord.y * cellSize + offsetLeft, // Destination Y on the canvas
      cellSize - offsetRight, // Destination width (scaled to fit within the maze cell)
      cellSize - offsetRight // Destination height(scaled to fit within the maze cell)
    );
  }

  //clearing the entire canvas before redrawing the maze
  function clear() {
    //cellSize- Represents size of a single cell in pixels, map.length- Represents the number of rows
    var canvasSize = cellSize * map.length; //gives the total size of the canvas in pixels
    ctx.clearRect(0, 0, canvasSize, canvasSize); //Calls clearRect(x, y, width, height), which erases a rectangular area on the canvas
  }

  if (endSprite != null) {
    //if not null
    drawEndMethod = drawEndSprite; //uses an image for the maze’s end
  } else {
    //if no sprite is available
    drawEndMethod = drawEndFlag; //uses a checkered flag instead
  }
  clear(); //clears canvas
  drawMap(); //redraws the entire maze
  drawEndMethod(); //recalls the function
}

//constructor function to create player object
//maze- maze object,c- canvas element, _cellsize- size of maze cell,onComplete- function called when player reach goal,sprite = null- An optional player sprite
function Player(maze, c, _cellsize, onComplete, sprite = null) {
  var ctx = c.getContext("2d"); //drawing context of canvas,ctx is used to draw graphics, such as the player
  var drawSprite; //determine how player is drawn
  var moves = 0; //initializes player movement counter
  drawSprite = drawSpriteCircle; //If no sprite is provided use drawSpriteCircle (draws the player as a circle)
  if (sprite != null) {
    //If sprite exists- Change drawSprite to drawSpriteImg (draws the player using an image)
    drawSprite = drawSpriteImg;
  }
  var player = this; //Stores the Player instance in player so that it can be accessed inside other functions
  var map = maze.map(); //retrieve the maze structure
  var cellCoords = {
    //Stores these coordinates in cellCoords
    x: maze.startCoord().x, //get the starting position {x, y} where the player begins.
    y: maze.startCoord().y,
  };
  var cellSize = _cellsize; //Stores the size of a single maze cell
  var halfCellSize = cellSize / 2; //Pre-calculates half the cell size for centering calculations

  //method to redraw the player when needed
  this.redrawPlayer = function (_cellsize) {
    cellSize = _cellsize; //Updates cellSize with the new value passed to redrawPlayer()
    drawSpriteImg(cellCoords); //redraws the player image at the current coordinates
  };

  //function that draws the player as a yellow circle on the canvas
  //coord- (x,y) player’s current position in the maze
  function drawSpriteCircle(coord) {
    ctx.beginPath();
    ctx.fillStyle = "yellow";

    //ctx.arc- draws circle
    ctx.arc(
      //(coord.x + 1) * cellSize: Positions it in the next cell, - halfCellSize: Centers it in the cell
      (coord.x + 1) * cellSize - halfCellSize, //X coordinate- Moves the circle inside the correct maze cell
      (coord.y + 1) * cellSize - halfCellSize, //Y coordinate
      halfCellSize - 2, //Slightly smaller than half the cell size to prevent overlap with walls
      0, //Starts drawing from 0 radians (right side of the circle)
      2 * Math.PI //Completes a full circle
    );
    ctx.fill(); //fills the circle with the set color (yellow)

    //if checks player’s current position matches the maze’s end coordinates
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves); //calls function and passes moves which is the number of moves the player took
      player.unbindKeyDown(); //removes event listeners that detect keyboard inputs
    }
  }

  //function that draws the player as an image (sprite) instead of a circle
  function drawSpriteImg(coord) {
    var offsetLeft = cellSize / 50; //to prevent the sprite from touching the edges of the cell
    var offsetRight = cellSize / 25; //Slightly shrinks the sprite to fit well inside the maze cell
    ctx.drawImage(
      sprite, //Image source (the sprite)
      0, //Crop start (x, y) - starts from top-left of sprite
      0, //Crop start (x, y) - starts from top-left of sprite
      sprite.width, //Crop width (entire sprite width)
      sprite.height, //Crop height (entire sprite height)
      coord.x * cellSize + offsetLeft, //X position on canvas (adjusted)
      coord.y * cellSize + offsetLeft, //Y position on canvas (adjusted)
      cellSize - offsetRight, //Width of the sprite in the maze
      cellSize - offsetRight //Height of the sprite in the maze
    );
    //If the player’s position matches the goal, the game is completed.
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves); //calls function and Passes moves which is number of moves the player took
      player.unbindKeyDown(); //removes event listeners that detect keyboard inputs
    }
  }

  //function that clears the area where the player’s sprite was drawn
  function removeSprite(coord) {
    var offsetLeft = cellSize / 50; //clears area with the sprite’s position
    var offsetRight = cellSize / 25; //Slightly shrinks the cleared area to match the exact size of sprite
    ctx.clearRect(
      coord.x * cellSize + offsetLeft, //X position where the sprite was drawn
      coord.y * cellSize + offsetLeft, //Y position where the sprite was drawn
      cellSize - offsetRight, //Width of the area to be cleared
      cellSize - offsetRight //Height of the area to be cleared
    );
  }

  //e- The event object that contains details about the key press
  //function which is triggered when a key is pressed
  function check(e) {
    var cell = map[cellCoords.x][cellCoords.y]; //Retrieves the current cell from the maze based on the player’s coordinates
    moves++; //Increments the move counter (moves)

    //switch statement to determine which key was pressed
    switch (e.keyCode) {
      case 65: //A key
      case 37: // west(Left Arrow key)
        if (cell.w == true) {
          //Checks if the player can move left (cell.w == true)
          removeSprite(cellCoords); //to erase the current player position
          cellCoords = {
            x: cellCoords.x - 1, //Updates cellCoords to move left (x - 1)
            y: cellCoords.y,
          };
          drawSprite(cellCoords); //to redraw the player at the new position
        }
        break;

      case 87: //W key
      case 38: // north(Up Arrow key)
        if (cell.n == true) {
          //Checks if the player can move up (cell.n == true)
          removeSprite(cellCoords); //Erase current position (removeSprite)
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y - 1, //Update cellCoords to move up (y - 1)
          };
          drawSprite(cellCoords); //Redraw the player (drawSprite)
        }
        break;

      case 68: //D key
      case 39: // east(Right Arrow key)
        if (cell.e == true) {
          //Checks if the player can move right (cell.e == true)
          removeSprite(cellCoords); //Erase current position (removeSprite)
          cellCoords = {
            x: cellCoords.x + 1, //Update cellCoords to move right (x + 1)
            y: cellCoords.y,
          };
          drawSprite(cellCoords); //Redraw the player (drawSprite)
        }
        break;

      case 83: //S key
      case 40: // south(Down Arrow key)
        if (cell.s == true) {
          //Checks if the player can move down (cell.s == true)
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y + 1, //Update cellCoords to move down (y + 1)
          };
          drawSprite(cellCoords); //Redraw the player
        }
        break;
    }
  }

  //Adds an event listener to the window object
  this.bindKeyDown = function () {
    //Listens for “keydown” events (when a key is pressed),Calls check() function whenever a key is pressed
    window.addEventListener("keydown", check, false); //false argument ensures proper event bubbling

    //Uses jQuery’s swipe() function
    $("#view").swipe({
      //Detects swipe gestures on an element with ID view
      swipe: function (
        event, //swipe event
        direction, //Swipe direction ("up", "down", "left", "right")
        distance,
        duration,
        fingerCount,
        fingerData
      ) {
        console.log(direction); //Logs the swipe direction for debugging

        //switch statement to map swipe gestures to arrow key keycodes
        switch (direction) {
          case "up":
            check({
              keyCode: 38, //Up arrow
            });
            break;
          case "down":
            check({
              keyCode: 40, //Down arrow
            });
            break;
          case "left":
            check({
              keyCode: 37, //Left arrow
            });
            break;
          case "right":
            check({
              keyCode: 39, //Right arrow
            });
            break;
        }
      },
      threshold: 0, //Sets the swipe detection threshold to 0,means any swipe, no matter how small, will be registered
    });
  };

  //below function removes event listeners, to stop player movement
  this.unbindKeyDown = function () {
    //Removes the “keydown” event listener that was added in bindKeyDown()
    window.removeEventListener("keydown", check, false); //prevents the player from moving once the game ends
    //Prevents players from moving using swipe gestures after the game is completed
    $("#view").swipe("destroy"); //Disables swipe detection on the #view element
  };

  drawSprite(maze.startCoord()); //Gets the maze’s starting position

  this.bindKeyDown(); //allows the player to start moving after the game begins
}

var mazeCanvas = document.getElementById("mazeCanvas"); //the maze and player sprite will be drawn
var ctx = mazeCanvas.getContext("2d"); //Creates a 2D drawing context
var sprite; //Stores the player’s sprite image
var finishSprite; //Stores the goal (end point) sprite
var maze, draw, player; //Represents the maze structure,drawing the maze,player object
var cellSize; //Stores the size of each maze cell
var difficulty; //Stores the difficulty level of the maze
// sprite.src = 'media/sprite.png'; //set the player’s sprite image

//below code are event triggers when the webpage has fully loaded
window.onload = function () {
  //Uses jQuery ($) to get the dimensions of the #view element
  let viewWidth = $("#view").width(); //Stores the width of #view
  let viewHeight = $("#view").height(); //Stores the height of #view
  if (viewHeight < viewWidth) {
    //If the screen is wider than it is tall (landscape mode)
    ctx.canvas.width = viewHeight - viewHeight / 100; //Subtracting viewHeight / 100 ensures the game from overflowing the container
    ctx.canvas.height = viewHeight - viewHeight / 100;
  } else {
    //If the screen is taller (portrait mode)
    ctx.canvas.width = viewWidth - viewWidth / 100;
    ctx.canvas.height = viewWidth - viewWidth / 100;
  }

  //Load and edit sprites
  var completeOne = false; //Will track if the player sprite is loaded
  var completeTwo = false; //tracks if another asset (such as the finish sprite) is loaded
  var isComplete = () => {
    //Checks if both sprites are fully loaded
    if (completeOne === true && completeTwo === true) {
      console.log("Runs"); //if both are true, logs "Runs" to the console
      setTimeout(function () {
        makeMaze(); //initializes or redraws the maze
      }, 500); //Calls makeMaze() after a 500ms delay
    }
  };

  sprite = new Image(); //Creates a new Image object for the player sprite
  sprite.src = "./walk.png" + "?" + new Date().getTime(); //Forces the browser to reload the image
  sprite.setAttribute("crossOrigin", " "); //Ensures the image loads properly across different domains

  //Waits for the image to finish loading before executing the function inside
  sprite.onload = function () {
    //below line likely applies a filter to modify the image
    sprite = changeBrightness(1.2, sprite); //increases brightness by 20%
    completeOne = true; //indicates that the player sprite has loaded
    console.log(completeOne); //Logs true to the console
    isComplete(); //check if both assets (completeOne and completeTwo) are ready
  };

  finishSprite = new Image(); //creates img to represent maze finish point
  finishSprite.src = "./home.png" + "?" + new Date().getTime(); //ensures that the browser does not use a cached version of image
  finishSprite.setAttribute("crossOrigin", " "); //Ensures that the image can be loaded across different domains

  //Executes this function when finishSprite has fully loaded
  finishSprite.onload = function () {
    //Ensures the game doesn’t start before the finish sprite is ready
    finishSprite = changeBrightness(1.1, finishSprite); //increases brightness by 10%
    completeTwo = true; //means the finish sprite has been successfully loaded
    console.log(completeTwo); //logs true to console
    isComplete(); //both completeOne (player sprite) and completeTwo (finish sprite) are loaded
  };
};

//ensures that maze canvas and game elements resize properly when screen size changes
window.onresize = function () {
  let viewWidth = $("#view").width(); //Stores the width of #view
  let viewHeight = $("#view").height(); //Stores the height of #view

  //sets the canvas size dynamically based on screen dimensions
  if (viewHeight < viewWidth) {
    //if the screen is wider than tall (landscape mode)
    ctx.canvas.width = viewHeight - viewHeight / 100;
    ctx.canvas.height = viewHeight - viewHeight / 100;
  } else {
    //If the screen is taller (portrait mode)
    ctx.canvas.width = viewWidth - viewWidth / 100;
    ctx.canvas.height = viewWidth - viewWidth / 100; //viewHeight / 100 : Prevents the canvas from filling the entire container, leaving a small margin
  }
  cellSize = mazeCanvas.width / difficulty; //ensures that cells remain proportional even if window resizes
  if (player != null) {
    //if player exists
    draw.redrawMaze(cellSize); //Redraws the maze with the new cell size
    player.redrawPlayer(cellSize); //Redraws the player at the correct position
  }
};

//fresh maze is generated with the correct difficulty and player placement
function makeMaze() {
  if (player != undefined) {
    // if player already exists
    player.unbindKeyDown(); //to prevent duplicate event listeners
    player = null; //Removes the player by setting player = null
  }
  var e = document.getElementById("diffSelect"); //Gets the selected difficulty level from the dropdown
  difficulty = e.options[e.selectedIndex].value; //Stores the selected value in difficulty
  cellSize = mazeCanvas.width / difficulty; //Determines the size of each cell based on the maze difficulty
  maze = new Maze(difficulty, difficulty); //	Creates a new maze instance with the selected difficulty
  draw = new DrawMaze(maze, ctx, cellSize, finishSprite); //Creates an instance of DrawMaze to render the maze
  player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite); //Creates a new player instance inside the maze
  //Ensures that the maze container is fully visible
  if (document.getElementById("mazeContainer").style.opacity < "100") {
    //If its opacity is less than 100,it sets to fully visible
    document.getElementById("mazeContainer").style.opacity = "100";
  }
}
