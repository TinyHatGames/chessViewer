import testpgn from "./testpgn.pgn";
import { Pgn } from "./cm-pgn/src/Pgn.js";
import { importAssetsinManager } from "./assetImport.js";
import * as GameFunctions from "./gameFunctions.js";

var testPgn = new Pgn(testpgn);

class piecePosition {
  constructor(coordinate, x, y) {
    this.coordinate = coordinate;
    this.x = x;
    this.y = y;
  }
}

// Board Setup Function: Imports all assets, then places the meshes in the right positions according to the selected pgn
export async function setupBoard(pgn) {
  return new Promise((resolve, reject) => {
    // Loading fenboard
    var startingFen =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    var fenboard = GameFunctions.fenToBoard(startingFen);

    //Setting up shadows
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, scene.lights[0]);
    shadowGenerator.usePercentageCloserFiltering = true;

    //Creating container for pieces
    var piecesContainer = new BABYLON.AssetContainer(scene);

    //Creating array for coordinate positions
    var coordinatePositions = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];

    // Importing assets
    importAssetsinManager().then(function (result) {
      // We look for each piece / element in the imported assets and store them in variables
      for (var i = 0; i < result.meshes.length; i++) {
        if (result.meshes[i].name == "Sword") {
          var sword = result.meshes[i];
        } else if (result.meshes[i].name == "Scepter") {
          var scepter = result.meshes[i];
        } else if (result.meshes[i].name == "Shield") {
          var shield = result.meshes[i];
        } else if (result.meshes[i].name == "Staff") {
          var staff = result.meshes[i];
        } else if (result.meshes[i].name == "Spear") {
          var spear = result.meshes[i];
        } else if (result.meshes[i].name == "Board") {
          var chessboard = result.meshes[i].clone("Chessboard");
          chessboard.receiveShadows = true;
        } else if (result.meshes[i].name == "BoardDecoration") {
          var boarddecoration = result.meshes[i].clone("ChessboardDecoration");
          boarddecoration.receiveShadows = true;
        } else if (result.meshes[i].name == "PawnMesh") {
          var pawn = result.meshes[i];
          var skeleton = pawn.skeleton;
        } else if (result.meshes[i].name == "BishopMesh") {
          var bishop = result.meshes[i];
        } else if (result.meshes[i].name == "KnightMesh") {
          var knight = result.meshes[i];
        } else if (result.meshes[i].name == "RookMesh") {
          var rook = result.meshes[i];
        } else if (result.meshes[i].name == "QueenMesh") {
          var queen = result.meshes[i];
        } else if (result.meshes[i].name == "KingMesh") {
          var king = result.meshes[i];
        }
      }

      // Setting up grid based on the chessboard asset
      var chessboardBoundingInfo = chessboard.getBoundingInfo();
      var min = chessboardBoundingInfo.boundingBox.minimumWorld;
      var max = chessboardBoundingInfo.boundingBox.maximumWorld;
      var width = max.x - min.x;
      var depth = max.z - min.z;
      var gridCellWidth = width / 8;
      var gridCellDepth = depth / 8;

      // Placing pieces on the board and adding them to container
      for (var x = 0; x < 8; x++) {
        for (var z = 0; z < 8; z++) {
          // Defining coordinates
          var newX = min.x + gridCellWidth / 2 + x * gridCellWidth;
          var newZ = min.z + gridCellDepth / 2 + z * gridCellDepth;
          // Instancing empty mesh
          var newMesh = null;
          coordinatePositions[x][z] = [
            new BABYLON.Vector3(newX, 0, newZ),
            String.fromCharCode(97 + z) + (8 - x),
          ];
          // Cloning meshes if the current coordinates contain a piece
          if (fenboard[x][z].charAt(1) == "p") {
            newMesh = pawn.clone("Pawn");
            newMesh.skeleton = skeleton.clone("Skeleton");
            var newSpear = spear.clone("newSpear");
            var rightHandIndex = newMesh.skeleton.getBoneIndexByName(
              "mixamorig:RightHandMiddle1"
            );
            newSpear.position.addInPlace(new BABYLON.Vector3(0, 10, 10));
            newSpear.attachToBone(
              newMesh.skeleton.bones[rightHandIndex],
              newMesh
            );
            newSpear.scaling = new BABYLON.Vector3(80, 80, 80);
            newSpear.rotationQuaternion = null;
            newSpear.rotation.y = BABYLON.Tools.ToRadians(192);
            newMesh.weapon = newSpear;
          } else if (fenboard[x][z].charAt(1) == "n") {
            newMesh = knight.clone("Knight");
            newMesh.skeleton = knight.skeleton.clone("KnightSkeleton");
            var newSword = sword.clone("newSword");
            var rightHandIndex = newMesh.skeleton.getBoneIndexByName(
              "mixamorig:RightHandMiddle1"
            );
            newSword.position.addInPlace(new BABYLON.Vector3(0, 10, 10));
            newSword.attachToBone(
              newMesh.skeleton.bones[rightHandIndex],
              newMesh
            );
            newSword.scaling = new BABYLON.Vector3(80, 80, 80);
            newSword.rotationQuaternion = null;
            newSword.rotation.z = BABYLON.Tools.ToRadians(30);
            newSword.rotation.y = BABYLON.Tools.ToRadians(192);
            newMesh.weapon = newSword;
          } else if (fenboard[x][z].charAt(1) == "b") {
            newMesh = bishop.clone("Bishop");
            newMesh.skeleton = bishop.skeleton.clone("BishopSkeleton");
            var newStaff = staff.clone("newStaff");
            var rightHandIndex = newMesh.skeleton.getBoneIndexByName(
              "mixamorig:RightHandMiddle1"
            );
            newStaff.position.addInPlace(new BABYLON.Vector3(0, 10, 10));
            newStaff.attachToBone(
              newMesh.skeleton.bones[rightHandIndex],
              newMesh
            );
            newStaff.scaling = new BABYLON.Vector3(80, 80, 80);
            newStaff.rotationQuaternion = null;
            newStaff.rotation.y = BABYLON.Tools.ToRadians(192);
            newMesh.weapon = newStaff;
          } else if (fenboard[x][z].charAt(1) == "r") {
            newMesh = rook.clone("Rook");
            newMesh.skeleton = rook.skeleton.clone("RookSkeleton");
            var newShield = shield.clone("newShield");
            var rightHandIndex = newMesh.skeleton.getBoneIndexByName(
              "mixamorig:RightHandMiddle1"
            );
            newShield.position.addInPlace(new BABYLON.Vector3(10, 65, -20));
            newShield.attachToBone(
              newMesh.skeleton.bones[rightHandIndex],
              newMesh
            );
            newShield.scaling = new BABYLON.Vector3(80, 80, 80);
            newShield.rotationQuaternion = null;
            newShield.rotation.x = BABYLON.Tools.ToRadians(95);
            newShield.rotation.y = BABYLON.Tools.ToRadians(192);
            newMesh.weapon = newShield;
          } else if (fenboard[x][z].charAt(1) == "q") {
            newMesh = queen.clone("Queen");
            newMesh.skeleton = queen.skeleton.clone("QueenSkeleton");
          } else if (fenboard[x][z].charAt(1) == "k") {
            newMesh = king.clone("King");
            newMesh.skeleton = king.skeleton.clone("KingSkeleton");
            var newScepter = scepter.clone("newScepter");
            var rightHandIndex = newMesh.skeleton.getBoneIndexByName(
              "mixamorig:RightHandMiddle1"
            );
            newScepter.position.addInPlace(new BABYLON.Vector3(0, 10, 10));
            newScepter.attachToBone(
              newMesh.skeleton.bones[rightHandIndex],
              newMesh
            );
            newScepter.scaling = new BABYLON.Vector3(80, 80, 80);
            newScepter.rotationQuaternion = null;
            newScepter.rotation.z = BABYLON.Tools.ToRadians(30);
            newScepter.rotation.y = BABYLON.Tools.ToRadians(192);
            newMesh.weapon = newScepter;
          }

          // Setting up the new mesh if one was created on this coordinate
          if (newMesh) {
            // Giving mesh a piece parameter
            newMesh.piece = fenboard[x][z];

            // Adding shadow
            shadowGenerator.addShadowCaster(newMesh);

            // Defining animations
            newMesh.skeleton.animationPropertiesOverride =
              new BABYLON.AnimationPropertiesOverride();
            newMesh.skeleton.animationPropertiesOverride.enableBlending = true;
            newMesh.skeleton.animationPropertiesOverride.blendingSpeed = 0.075;
            newMesh.skeleton.animationPropertiesOverride.loopMode = 1;

            var Idle_Range = newMesh.skeleton.getAnimationRange("Idle");

            // Starting Idle Animation
            scene.beginAnimation(
              newMesh.skeleton,
              Idle_Range.from,
              Idle_Range.to,
              true,
              1.0
            );

            // Cloning material
            var blackMaterial = newMesh.material.clone("BlackMaterial");
            blackMaterial.disableLighting = true;
            var whiteMaterial = newMesh.material.clone("WhiteMaterial");

            if (fenboard[x][z].charAt(0) == "b") {
              newMesh.material = blackMaterial;

              if (newShield) {
                newShield.material = newShield.material.clone("BlackShield");
              }

              for (var i = 0; i < newMesh.material.subMaterials.length; i++) {
                if (
                  newMesh.material.subMaterials[i].name == "Metal" ||
                  newMesh.material.subMaterials[i].name == "WhiteCloth"
                ) {
                  // Making white black
                  blackMaterial.subMaterials[i] =
                    blackMaterial.subMaterials[i].clone("Black");
                  blackMaterial.subMaterials[i].albedoColor =
                    new BABYLON.Color3(0.1, 0.1, 0.1);
                  if (newShield) {
                    newShield.material.subMaterials[0] =
                      blackMaterial.subMaterials[i];
                  }
                } else if (newMesh.material.subMaterials[i].name == "Metal2") {
                  // Making gold silver
                  blackMaterial.subMaterials[i] =
                    blackMaterial.subMaterials[i].clone("Silver");
                  blackMaterial.subMaterials[i].albedoColor =
                    new BABYLON.Color3(0.8, 0.8, 0.9);
                  if (newShield) {
                    newShield.material.subMaterials[1] =
                      blackMaterial.subMaterials[i];
                  }
                  if (newStaff) {
                    newStaff.material = blackMaterial.subMaterials[i];
                  }
                  if (newScepter) {
                    newScepter.material = blackMaterial.subMaterials[i];
                  }
                }
              }

              newMesh.rotation.y -= BABYLON.Tools.ToRadians(90);
            } else if (fenboard[x][z].charAt(0) == "w") {
              newMesh.material = whiteMaterial;
              newMesh.rotation.y += BABYLON.Tools.ToRadians(90);
            }
            newMesh.name = fenboard[x][z];
            var currentPiecePosition = new piecePosition(
              String.fromCharCode(97 + z) + (8 - x),
              z,
              x
            );

            //Adding parent to facilitate transformations
            var parentNode = new BABYLON.TransformNode("parentNode", scene);
            newMesh.setParent(parentNode, true);

            //Placing mesh on the right coordinate
            parentNode.position = new BABYLON.Vector3(newX, 0, newZ);

            newMesh.piecePosition = currentPiecePosition;
            piecesContainer.meshes.push(newMesh);
          }
        }
      }

      // var piecesPositions = [];
      // for (var i = 0; i < 8; i++) {
      //   for (var j = 0; j < 8; j++) {
      //     var currentPiecePosition = new piecePosition(
      //       String.fromCharCode(97 + i) + (j + 1),
      //       i,
      //       j
      //     );
      //     piecesPositions.push(currentPiecePosition);
      //     console.log(i + ", " + j + ", " + currentPiecePosition.coordinate);
      //   }
      // }

      //console.log(piecesContainer);

      resolve([piecesContainer, coordinatePositions]);
    });
  });
}
