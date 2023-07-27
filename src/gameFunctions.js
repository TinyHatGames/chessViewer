// pgn.history.moves[i].flags
// 'n' - a non-capture
// 'b' - a pawn push of two squares
// 'e' - an en passant capture
// 'c' - a standard capture
// 'p' - a promotion
// 'k' - kingside castling
// 'q' - queenside castling

var currentMove = -1;
var requiredMove = -1;
var refreshRate = 1000;
var pgn = null;
var piecesContainer = null;
var coordinatePositions = null;
var moveInProgress = false;

function whiteFlash(duration) {
  // Create a new GUI rectangle that covers the entire screen
  const texture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("whiteFlashTexture");
  const rect = new BABYLON.GUI.Rectangle();
  rect.width = 1;
  rect.height = 1;
  rect.background = "white";
  rect.alpha = 0;
  rect.isPointerBlocker = true;
  texture.addControl(rect);

  // Create the animation keys
  const keys = [];
  keys.push({ frame: 0, value: 0 });
  keys.push({ frame: 10, value: 1 });
  keys.push({ frame: 20, value: 0 });

  // Create the animation
  const animation = new BABYLON.Animation(
    "whiteFlash",
    "alpha",
    60,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  animation.setKeys(keys);
  rect.animations = [];
  // Attach the animation to the rectangle
  rect.animations.push(animation);

  // Play the animation
  scene.beginAnimation(rect, 0, 20, false, 1, () => {
    // Remove the rectangle from the scene when the animation is done
    texture.dispose();
  });

  // Wait for the duration of the flash
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function positionFromCoordinate(coordinate) {
  for (var i = 0; i < coordinatePositions.length; i++) {
    for (var j = 0; j < coordinatePositions[i].length; j++) {
      if (coordinatePositions[i][j][1] == coordinate) {
        return coordinatePositions[i][j][0];
      }
    }
  }
}

async function attack(mesh, targetMesh) {
  console.log("Starting attack");
  var frameRate = engine.getFps();
  var Attack_Range = mesh.skeleton.getAnimationRange("Attack");
  var Death_Range = targetMesh.skeleton.getAnimationRange("Death");
  var animationTime = 1; // time for the animation in seconds
  var animationSpeed =
    (Attack_Range.to - Attack_Range.from) / (frameRate * animationTime);
  var fromPosition = mesh.parent.position; // the initial position
  var toPosition = targetMesh.parent.position; // the target position
  var moveAnim = null;

  rotateTowards(mesh.parent, targetMesh.parent.position);

  if (mesh.name.charAt(1) == "n" || mesh.name.charAt(1) == "r") {
    // Create a new animation object
    var moveAnimation = new BABYLON.Animation(
      "moveAnimation",
      "position",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Add keys to the animation
    var keys = [];

    //At the animation key 0, the value of scaling is "fromPosition"
    keys.push({
      frame: 0,
      value: fromPosition,
    });

    //At the animation key "animationTime * frameRate", the value of scaling is "toPosition"
    keys.push({
      frame: animationTime * frameRate,
      value: toPosition,
    });

    // Add these keys to the animation
    moveAnimation.setKeys(keys);

    // Push the animation on the parent
    mesh.parent.animations.push(moveAnimation);

    //Start the animation
    moveAnim = scene.beginAnimation(
      mesh.parent,
      0,
      animationTime * frameRate,
      false,
      1.0
    );
  }

  const attackAnim = scene.beginAnimation(
    mesh.skeleton,
    Attack_Range.from,
    Attack_Range.to,
    false,
    animationSpeed
  );
  const deathAnim = scene.beginAnimation(
    targetMesh.skeleton,
    Death_Range.from,
    Death_Range.to,
    false,
    animationSpeed
  );

  whiteFlash(500);
  await attackAnim.waitAsync();

  if (mesh.name.charAt(1) == "n" || mesh.name.charAt(1) == "r") {
    scene.stopAnimation(mesh);
    scene.stopAnimation(mesh.skeleton);
    mesh.parent.rotation.y = 0;
    var Idle_Range = mesh.skeleton.getAnimationRange("Idle");
    // Starting Idle Animation
    scene.beginAnimation(
      mesh.skeleton,
      Idle_Range.from,
      Idle_Range.to,
      true,
      1.0
    );
    updateMove(currentMove + 1);
  }

  for (var i = 0; i < piecesContainer.meshes.length; i++) {
    if (piecesContainer.meshes[i] == targetMesh) {
      piecesContainer.meshes.splice(i, 1);
    }
  }

  //Disposing of the mesh, weapon and skeletons
  if (targetMesh.weapon != null) {
    targetMesh.weapon.dispose();
  }
  targetMesh.skeleton.dispose();
  targetMesh.parent.dispose();

  if (mesh.name.charAt(1) == "n" || mesh.name.charAt(1) == "r") {
    moveInProgress = false;
  }

  console.log("Attack Anim over");
}

function updateCoordinates(mesh, newCoordinate) {
  mesh.piecePosition.coordinate = newCoordinate;
}

async function moveTo(mesh, startPosition, targetPosition, castling) {
  console.log("Starting move to");

  rotateTowards(mesh.parent, targetPosition);
  var parentNode = mesh.parent;
  var Move_Range;
  var loop = true;
  var animationSpeed = 1;
  var frameRate = engine.getFps(); // frames per second
  var animationTime = 1; // time for the animation in seconds
  var fromPosition = startPosition; // the initial position
  var toPosition = targetPosition; // the target position

  console.log("Current FPS: " + engine.getFps().toFixed());

  // If it's a knight, the animation is a one shot "jump"
  if (mesh.name.charAt(1) == "n") {
    Move_Range = mesh.skeleton.getAnimationRange("Jump");
    loop = false;
  }
  // Otherwise it's a loop
  else {
    Move_Range = mesh.skeleton.getAnimationRange("Walk");
  }

  console.log("from:" + Move_Range.from + ",to:" + Move_Range.to);

  // If it's a oneshot, the animation should take exactly the whole time of the move
  if (loop == false) {
    animationSpeed =
      (Move_Range.to - Move_Range.from) / (frameRate * animationTime);
  }
  // If it's not, it should be consistent depending on the move distance
  else {
    var distance = BABYLON.Vector3.Distance(startPosition, targetPosition);
    animationSpeed *= distance / 1.5 / animationTime;
  }

  // Create a new animation object
  var moveAnimation = new BABYLON.Animation(
    "moveAnimation",
    "position",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  // Add keys to the animation
  var keys = [];

  //At the animation key 0, the value of scaling is "fromPosition"
  keys.push({
    frame: 0,
    value: fromPosition,
  });

  //At the animation key "animationTime * frameRate", the value of scaling is "toPosition"
  keys.push({
    frame: animationTime * frameRate,
    value: toPosition,
  });

  // Add these keys to the animation
  moveAnimation.setKeys(keys);

  // Link the animation to the mesh
  //mesh.animations.push(moveAnimation);

  parentNode.animations.push(moveAnimation);

  //Start the animation
  const moveAnim = scene.beginAnimation(
    parentNode,
    0,
    animationTime * frameRate,
    false,
    1.0
  );
  scene.stopAnimation(mesh.skeleton);
  scene.beginAnimation(
    mesh.skeleton,
    Move_Range.from,
    Move_Range.to,
    loop,
    animationSpeed
  );

  await moveAnim.waitAsync();

  console.log("Move Anim over");

  moveInProgress = false;
  scene.stopAnimation(mesh);
  scene.stopAnimation(mesh.skeleton);
  mesh.parent.rotation.y = 0;
  var Idle_Range = mesh.skeleton.getAnimationRange("Idle");
  // Starting Idle Animation
  scene.beginAnimation(
    mesh.skeleton,
    Idle_Range.from,
    Idle_Range.to,
    true,
    1.0
  );
  if (!castling) {
    updateMove(currentMove + 1);
  }
}

function rotateTowards(mesh, position) {
  // Get direction vector from mesh to position
  var direction = position.subtract(mesh.position);

  // Use atan2 to compute the rotation around the Y-axis
  mesh.rotation.y = Math.atan2(direction.x, direction.z);

  if (mesh.getChildren()[0].name.charAt(0) == "b") {
    mesh.rotation.y -= BABYLON.Tools.ToRadians(90);
  } else {
    mesh.rotation.y += BABYLON.Tools.ToRadians(90);
  }
}

export async function movePiece(moveNumber) {
  var nextMove = pgn.history.moves[moveNumber];
  console.log("Moving piece:" + nextMove.from);
  if (nextMove != null) {
    var fromMesh = null;
    var toMesh = null;

    for (var i = 0; i < piecesContainer.meshes.length; i++) {
      // console.log(
      //   piecesContainer.meshes[i].piecePosition.coordinate + "," + nextMove.from
      // );
      if (piecesContainer.meshes[i].piecePosition.coordinate == nextMove.from) {
        fromMesh = piecesContainer.meshes[i];
      }

      if (piecesContainer.meshes[i].piecePosition.coordinate == nextMove.to) {
        toMesh = piecesContainer.meshes[i];
      }
    }

    console.log("flag: " + nextMove.flags);
    console.log("frommesh: " + fromMesh);

    // Standard Capture
    if (nextMove.flags == "c") {
      var targetPosition = positionFromCoordinate(nextMove.to);
      await attack(fromMesh, toMesh);
      if (fromMesh.name.charAt(1) != "n" && fromMesh.name.charAt(1) != "r") {
        await moveTo(fromMesh, fromMesh.parent.position, targetPosition, false);
      }
      updateCoordinates(fromMesh, nextMove.to);
    }

    // Non-Capture - standard move or pawn double move
    else if (nextMove.flags == "n" || nextMove.flags == "b") {
      var targetPosition = positionFromCoordinate(nextMove.to);
      await moveTo(fromMesh, fromMesh.parent.position, targetPosition, false);
      updateCoordinates(fromMesh, nextMove.to);
    }

    // Castling
    else if (nextMove.flags == "k" || nextMove.flags == "q") {
      var rook = null;
      var rookTargetCoordinate = null;
      var rookTarget = null;
      if (nextMove.flags == "k") {
        for (var i = 0; i < piecesContainer.meshes.length; i++) {
          if (
            piecesContainer.meshes[i].piecePosition.coordinate ==
            "h" + fromMesh.piecePosition.coordinate.charAt(1)
          ) {
            rook = piecesContainer.meshes[i];
            rookTargetCoordinate =
              "f" + rook.piecePosition.coordinate.charAt(1);
            rookTarget = positionFromCoordinate(rookTargetCoordinate);
          }
        }
      } else {
        for (var i = 0; i < piecesContainer.meshes.length; i++) {
          if (
            piecesContainer.meshes[i].piecePosition.coordinate ==
            "a" + fromMesh.piecePosition.coordinate.charAt(1)
          ) {
            rook = piecesContainer.meshes[i];
            rookTargetCoordinate =
              "d" + rook.piecePosition.coordinate.charAt(1);
            rookTarget = positionFromCoordinate(rookTargetCoordinate);
          }
        }
      }

      // Rook move
      moveTo(rook, rook.parent.position, rookTarget, true);

      // King move
      var targetPosition = positionFromCoordinate(nextMove.to);
      await moveTo(fromMesh, fromMesh.parent.position, targetPosition, false);
      updateCoordinates(fromMesh, nextMove.to);
      updateCoordinates(rook, rookTargetCoordinate);
    }
  }
}

export function fenToBoard(fen) {
  var board = [
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
  ];

  var rows = fen.split("/", 8);

  for (var i = 0; i < rows.length; i++) {
    var currentCol = 0;
    for (var j = 0; j < rows[i].length; j++) {
      //console.log("Row:" + i + ",Col:" + j + ", value:" + rows[i].charAt(j));
      if (rows[i].charAt(j) == " ") {
        break;
      }
      //console.log("Length:" + rows[i].length);
      // It's a number
      if (!isNaN(rows[i].charAt(j) + 1)) {
        for (var k = 0; k < rows[i].charAt(j); k++) {
          board[i][currentCol] = "em";
          //console.log(
          //"Row:" + i + ",Col:" + j + ",em, currentcol:" + currentCol
          //);
          currentCol += 1;
        }
      }
      // It's a letter
      else if (rows[i].charAt(j).toUpperCase() == rows[i].charAt(j)) {
        // Uppercase, white
        board[i][currentCol] = "w" + rows[i].charAt(j).toLowerCase();
        //console.log("Row:" + i + ",Col:" + j + ",w, currentcol:" + currentCol);
        currentCol += 1;
      } else {
        // Lowercase, black
        board[i][currentCol] = "b" + rows[i].charAt(j);
        //console.log("Row:" + i + ",Col:" + j + ",b, currentcol:" + currentCol);
        currentCol += 1;
      }
    }
  }

  return board;
}

export function updateMove(move) {
  currentMove = move;
}

export function startRefresh(inputPgn) {
  pgn = inputPgn;
  setInterval(checkMoveSync, refreshRate);
}

export function checkMoveSync() {
  console.log(
    "Refreshing. Current move: " +
      currentMove +
      ", Required move: " +
      requiredMove
  );
  if (currentMove < requiredMove && !moveInProgress) {
    movePiece(currentMove + 1);
    moveInProgress = true;
  }
}

export function initControls(container, coordinates) {
  console.log(container);
  piecesContainer = container;
  coordinatePositions = coordinates;
  console.log("Coord pos:" + coordinatePositions);
  scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
      case BABYLON.KeyboardEventTypes.KEYUP:
        switch (kbInfo.event.key) {
          case "[":
            requiredMove -= requiredMove > 0 ? 1 : 0;
            break;
          case "]":
            requiredMove += 1;
            break;
        }
        break;
    }
  });
}
