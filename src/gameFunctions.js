import { Pgn } from "./cm-pgn/src/Pgn.js";

var currentMove = -1;
var requiredMove = -1;
var refreshRate = 100;
var pgn = new Pgn("");
var piecesContainer = null;
var coordinatePositions = null;
var moveInProgress = false;
var moveSpeed = 1;
var movesLabel = null;

function createFireball(startPosition, endPosition, duration) {
  // Create a fireball mesh to represent the fireball
  var fireball = BABYLON.MeshBuilder.CreateSphere(
    "fireball",
    { diameter: 0.5 },
    scene
  );

  // Set the starting position of the fireball
  fireball.position = startPosition;
  fireball.isVisible = false;

  // Create a particle system for the fireball
  var particleSystem = new BABYLON.ParticleSystem("fireball", 2000, scene);

  // Set the emitter to the fireball mesh
  particleSystem.emitter = fireball;

  // Set the particle texture and color
  particleSystem.particleTexture = new BABYLON.Texture(
    "assets/fireparticle.png",
    scene
  );
  // Set the particle system to use the alpha channel of the particle texture for transparency
  particleSystem.useAlphaFromTexture = true;

  particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
  particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1);
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

  // Set the particle size and shape
  particleSystem.minSize = 0.25;
  particleSystem.maxSize = 1.5;
  particleSystem.minLifeTime = 0.1;
  particleSystem.maxLifeTime = 0.5;
  particleSystem.emitRate = 300;
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
  particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

  // Set the particle direction and speed
  particleSystem.direction1 = new BABYLON.Vector3(0, 0.1, 0);
  //particleSystem.direction2 = new BABYLON.Vector3(0, 1, 0);
  particleSystem.minEmitPower = 1;
  particleSystem.maxEmitPower = 10;

  // Set the minimum and maximum emit boxes to adjust the starting position of the particles
  particleSystem.minEmitBox = new BABYLON.Vector3(-0.1, 0, -0.1);
  particleSystem.maxEmitBox = new BABYLON.Vector3(0.1, 0, 0.1);

  // Define the update function to control the size of the particles over time
  particleSystem.updateFunction = function (particles) {
    for (var i = 0; i < particles.length; i++) {
      var particle = particles[i];
      particle.size *= 0.85;
    }
  };

  // Start the particle system
  particleSystem.start();

  // Animate the fireball mesh from the starting position to the ending position over the specified duration
  var animation = new BABYLON.Animation(
    "fireballAnimation",
    "position",
    60,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  var keys = [
    { frame: 0, value: startPosition },
    { frame: duration * 60, value: endPosition },
  ];
  animation.setKeys(keys);
  fireball.animations.push(animation);
  scene.beginAnimation(fireball, 0, duration * 60, false, 1);

  // Continuously update the particle system to emit particles from the fireball mesh
  scene.registerAfterRender(function () {
    particleSystem.emitter = fireball;
  });

  // Remove the fireball mesh and particle system after the animation is complete
  setTimeout(function () {
    fireball.dispose();
    particleSystem.stop();
    particleSystem.dispose();
  }, duration * 1000);
}

function setBoardToMove(moveNumber) {
  var piecesContainerMeshes = piecesContainer.meshes.slice();
  if (moveNumber == -1) {
    var fenboard = fenToBoard(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
  } else {
    var fenboard = fenToBoard(pgn.history.moves[moveNumber].fen);
  }

  for (var x = 0; x < 8; x++) {
    for (var z = 0; z < 8; z++) {
      //Move each piece in the pieces container to the right position based on the current move
      for (var i = 0; i < piecesContainerMeshes.length; i++) {
        if (piecesContainerMeshes[i].piece == fenboard[x][z]) {
          piecesContainerMeshes[i].parent.position = positionFromCoordinate(
            String.fromCharCode(97 + z) + (8 - x)
          );
          piecesContainerMeshes[i].piecePosition.coordinate =
            String.fromCharCode(97 + z) + (8 - x);
          piecesContainerMeshes[i].piecePosition.x = z;
          piecesContainerMeshes[i].piecePosition.y = x;
          piecesContainerMeshes[i].isVisible = true;
          if (piecesContainerMeshes[i].weapon != null) {
            piecesContainerMeshes[i].weapon.isVisible = true;
          }

          // Play the idle animation
          scene.stopAnimation(piecesContainerMeshes[i].skeleton);
          var Idle_Range =
            piecesContainerMeshes[i].skeleton.getAnimationRange("Idle");
          scene.beginAnimation(
            piecesContainerMeshes[i].skeleton,
            Idle_Range.from,
            Idle_Range.to,
            true,
            1.0
          );

          // Remove the piece from the container and decrement the counter
          piecesContainerMeshes.splice(i, 1);
          break;
        }
      }
    }
  }
  currentMove = requiredMove;
  moveInProgress = false;
}

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
  var animationTime = moveSpeed; // time for the animation in seconds
  var animationSpeed =
    frameRate / (Attack_Range.to - Attack_Range.from) / animationTime;
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

  if (mesh.name.charAt(1) == "b" || mesh.name.charAt(1) == "q") {
    var yOffset = new BABYLON.Vector3(0, 1.5, 0);
    createFireball(
      fromPosition.clone().addInPlace(yOffset),
      toPosition.clone().addInPlace(yOffset),
      animationTime / 1.5
    );
  }

  // Get the duration of the attack animation
  const attackAnimDuration =
    (1000 / frameRate) * (Attack_Range.to - Attack_Range.from) * animationTime;

  // Wait for half the duration of the attack animation
  await new Promise((resolve) => setTimeout(resolve, attackAnimDuration / 2));
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

  // for (var i = 0; i < piecesContainer.meshes.length; i++) {
  //   if (piecesContainer.meshes[i] == targetMesh) {
  //     piecesContainer.meshes.splice(i, 1);
  //   }
  // }

  //Hidding the mesh and weapon
  if (targetMesh.weapon != null) {
    targetMesh.weapon.isVisible = false;
  }
  //targetMesh.skeleton.dispose();
  targetMesh.isVisible = false;
  targetMesh.piecePosition.coordinate = null;

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
  var animationTime = moveSpeed; // time for the animation in seconds
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
      frameRate / (Move_Range.to - Move_Range.from) / animationTime;
    console.log("animationSpeed:" + animationSpeed);
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
    moveInProgress = false;
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

    console.log("Container:" + piecesContainer.meshes);
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
      await moveTo(rook, rook.parent.position, rookTarget, true);

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
  movesLabel.text =
    "Halfmove: " +
    (requiredMove + 1) +
    "/" +
    pgn.history.moves.length +
    " (" +
    (currentMove + 1) +
    ")";
}

export function startRefresh(inputPgn) {
  console.log("Starting refresh");
  console.log(inputPgn);
  pgn = inputPgn;
  setInterval(checkMoveSync, refreshRate);
}

export function checkMoveSync() {
  console.log(
    "Refreshing. Current move: " +
      currentMove +
      ", Required move: " +
      requiredMove +
      ", Move in progress: " +
      moveInProgress
  );
  if (currentMove < requiredMove && !moveInProgress) {
    movePiece(currentMove + 1);
    moveInProgress = true;
  } else if (currentMove > requiredMove && !moveInProgress) {
    moveInProgress = true;
    setBoardToMove(requiredMove);
  }
}

export function initControls(container, coordinates) {
  console.log(container);
  piecesContainer = container;
  coordinatePositions = coordinates;
  console.log("Coord pos:" + coordinatePositions);

  // Create a new GUI texture that covers the entire screen
  const advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  // Create a new GUI stack panel to hold the buttons
  const buttonStackPanel = new BABYLON.GUI.StackPanel("buttonStackPanel");
  buttonStackPanel.width = "100%";
  buttonStackPanel.height = "50px";
  buttonStackPanel.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  buttonStackPanel.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  buttonStackPanel.isVertical = false;

  // Create a new GUI text block for the slider label and add it to the slider stack panel
  movesLabel = new BABYLON.GUI.TextBlock("movesLabel");
  movesLabel.width = "100%";
  movesLabel.height = "50px";
  movesLabel.color = "white";
  movesLabel.text = "Halfmove: 0/" + pgn.history.moves.length + " (0)";

  // Create a new GUI button for the "[" control and add it to the button stack panel
  const leftButton = BABYLON.GUI.Button.CreateSimpleButton("leftButton", "<");
  leftButton.width = "50%";
  leftButton.height = "50px";
  leftButton.color = "grey";
  leftButton.background = "white";
  leftButton.paddingRight = "10px";
  leftButton.onPointerDownObservable.add(() => {
    requiredMove -= requiredMove > -1 ? 1 : 0;
    movesLabel.text =
      "Halfmove: " +
      (requiredMove + 1) +
      "/" +
      pgn.history.moves.length +
      " (" +
      (currentMove + 1) +
      ")";
  });
  buttonStackPanel.addControl(leftButton);

  // Create a new GUI button for the "]" control and add it to the button stack panel
  const rightButton = BABYLON.GUI.Button.CreateSimpleButton("rightButton", ">");
  rightButton.width = "50%";
  rightButton.height = "50px";
  rightButton.color = "grey";
  rightButton.background = "white";
  rightButton.paddingLeft = "10px";
  rightButton.onPointerDownObservable.add(() => {
    requiredMove += requiredMove < pgn.history.moves.length - 1 ? 1 : 0;
    movesLabel.text =
      "Halfmove: " +
      (requiredMove + 1) +
      "/" +
      pgn.history.moves.length +
      " (" +
      (currentMove + 1) +
      ")";
  });
  buttonStackPanel.addControl(rightButton);

  // Create a new GUI stack panel to hold the text input and slider
  const inputStackPanel = new BABYLON.GUI.StackPanel("inputStackPanel");
  inputStackPanel.width = "100%";
  inputStackPanel.height = "100px";
  inputStackPanel.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  inputStackPanel.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  inputStackPanel.isVertical = true;

  // Create a new GUI text input for the required move and add it to the input stack panel
  const pgnInput = new BABYLON.GUI.InputTextArea("pgnInput");
  pgnInput.width = "100%";
  pgnInput.height = "50px";
  pgnInput.color = "grey";
  pgnInput.background = "white";
  pgnInput.autoStretchWidth = false;
  pgnInput.placeholderText = "Please paste a PGN here";
  pgnInput.placeholderColor = "grey";
  pgnInput.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  inputStackPanel.addControl(pgnInput);

  // Create a new GUI button for the "]" control and add it to the button stack panel
  const pgnSubmitButton = BABYLON.GUI.Button.CreateSimpleButton(
    "pgnSubmitButton",
    "SUBMIT PGN"
  );
  pgnSubmitButton.width = "50%";
  pgnSubmitButton.height = "50px";
  pgnSubmitButton.color = "grey";
  pgnSubmitButton.background = "white";
  pgnSubmitButton.paddingLeft = "10px";
  pgnSubmitButton.onPointerDownObservable.add(() => {
    if (pgnInput.text != null && pgnInput.text != "") {
      setPgn(pgnInput.text);
    }
  });
  inputStackPanel.addControl(pgnSubmitButton);

  // Create a new GUI stack panel to hold the slider
  const sliderStackPanel = new BABYLON.GUI.StackPanel("sliderStackPanel");
  sliderStackPanel.width = "100%";
  sliderStackPanel.height = "100px";
  sliderStackPanel.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  sliderStackPanel.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  //sliderStackPanel.isVertical = true;
  //advancedTexture.addControl(sliderStackPanel);

  // Create a new GUI text block for the slider label and add it to the slider stack panel
  const sliderLabel = new BABYLON.GUI.TextBlock("sliderLabel");
  sliderLabel.width = "100%";
  sliderLabel.height = "50px";
  sliderLabel.color = "white";
  sliderLabel.text = "Move Speed (1s)";
  sliderStackPanel.addControl(sliderLabel);

  // Create a new GUI slider for the move speed and add it to the slider stack panel
  const moveSpeedSlider = new BABYLON.GUI.Slider("moveSpeedSlider");
  moveSpeedSlider.width = "100%";
  moveSpeedSlider.height = "50px";
  moveSpeedSlider.minimum = 0.1;
  moveSpeedSlider.maximum = 2;
  moveSpeedSlider.color = "white";
  moveSpeedSlider.value = moveSpeed;
  moveSpeedSlider.onValueChangedObservable.add((value) => {
    moveSpeed = value;
    sliderLabel.text = "Move Speed (" + value.toFixed(1) + "s)";
  });
  sliderStackPanel.addControl(moveSpeedSlider);

  // Create a new GUI stack panel to hold all the other panels
  const mainStackPanel = new BABYLON.GUI.StackPanel("mainStackPanel");
  mainStackPanel.width = "20%";
  mainStackPanel.height = "300px";
  mainStackPanel.paddingTop = "10px";
  mainStackPanel.paddingRight = "10px";
  mainStackPanel.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  mainStackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  mainStackPanel.isVertical = true;
  advancedTexture.addControl(mainStackPanel);
  mainStackPanel.addControl(inputStackPanel);
  mainStackPanel.addControl(sliderStackPanel);
  mainStackPanel.addControl(movesLabel);
  mainStackPanel.addControl(buttonStackPanel);

  scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
      case BABYLON.KeyboardEventTypes.KEYUP:
        switch (kbInfo.event.key) {
          case "[":
            requiredMove -= requiredMove > -1 ? 1 : 0;
            movesLabel.text =
              "Moves:" + requiredMove + "/" + pgn.history.moves.length;
            break;
          case "]":
            requiredMove += requiredMove < pgn.history.moves.length - 1 ? 1 : 0;
            movesLabel.text =
              "Moves:" + requiredMove + "/" + pgn.history.moves.length;
            break;
          case "Enter":
          case "return":
            if (pgnInput.text != null && pgnInput.text != "") {
              setPgn(pgnInput.text);
            }
            break;
          case "p":
            var startPosition = new BABYLON.Vector3.Zero();
            var endPosition = new BABYLON.Vector3(4, 4, 4);
            createFireball(startPosition, endPosition, 0.5);
        }
        break;
    }
  });
}

function setPgn(inputPgn) {
  console.log("Setting PGN");
  console.log(inputPgn);
  try {
    // Reset the state of the application before parsing
    currentMove = -1;
    requiredMove = -1;
    moveInProgress = false;
    // Parse the PGN input string
    pgn = new Pgn(inputPgn.normalize());
    console.log(pgn);
  } catch (error) {
    console.error("Error parsing PGN:", error);
  }
  setBoardToMove(-1);
}
