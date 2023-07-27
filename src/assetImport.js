//var chessboard = new BABYLON.Mesh("Chessboard");
//var sword = new BABYLON.Mesh("Sword");
//var pawn = new BABYLON.Mesh("Pawn");

// export async function importAll() {
//   var container = new BABYLON.AssetContainer(scene);

//   // Wrap each ImportMesh call in a Promise
//   var promises = [
//     new Promise((resolve, reject) => {
//       BABYLON.SceneLoader.ImportMesh(
//         "",
//         "./assets/",
//         "sword.glb",
//         scene,
//         function (meshNames) {
//           var sword = meshNames[0];
//           container.meshes.push(sword);
//           resolve();
//         }
//       );
//     }),

//     new Promise((resolve, reject) => {
//       BABYLON.SceneLoader.ImportMesh(
//         "",
//         "./assets/",
//         "chessboard.glb",
//         scene,
//         function (meshNames) {
//           var chessboard = meshNames[0];
//           container.meshes.push(chessboard);
//           resolve();
//         }
//       );
//     }),

//     new Promise((resolve, reject) => {
//       BABYLON.SceneLoader.ImportMesh(
//         "Pawn",
//         "./assets/",
//         "pawn_animations.babylon",
//         scene,
//         function (meshNames, particleSystems, skeletons) {
//           var pawn = meshNames[0];
//           var skeleton = skeletons[0];

//           pawn.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
//           skeleton.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);

//           pawn.position = new BABYLON.Vector3(0, 0, 0);
//           skeleton.position = new BABYLON.Vector3(0, 0, 0);

//           container.meshes.push(pawn);
//           resolve(); // Resolve the Promise when the operation is done
//         }
//       );
//     }),
//   ];

//   // Wait for all ImportMesh operations to complete
//   await Promise.all(promises);
//   container.removeAllFromScene();
//   return container;
// }

export async function importAssetsinManager() {
  return new Promise((resolve, reject) => {
    const assetsManager = new BABYLON.AssetsManager(scene);
    var container = new BABYLON.AssetContainer(scene);
    var unitScale = new BABYLON.Vector3(0.006, 0.006, 0.006);
    var importSword = assetsManager.addMeshTask(
      "Sword",
      "Sword",
      "./assets/",
      "weapons.babylon"
    );
    var importScepter = assetsManager.addMeshTask(
      "Scepter",
      "Scepter",
      "./assets/",
      "weapons.babylon"
    );
    var importShield = assetsManager.addMeshTask(
      "Shield",
      "Shield",
      "./assets/",
      "weapons.babylon"
    );
    var importStaff = assetsManager.addMeshTask(
      "Staff",
      "Staff",
      "./assets/",
      "weapons.babylon"
    );
    var importSpear = assetsManager.addMeshTask(
      "Spear",
      "Spear",
      "./assets/",
      "weapons.babylon"
    );
    var importChessboard = assetsManager.addMeshTask(
      "Board",
      "",
      "./assets/",
      "chessboard.babylon"
    );
    var importPawn = assetsManager.addMeshTask(
      "Pawn",
      "",
      "./assets/",
      "pawn.babylon"
    );
    var importBishop = assetsManager.addMeshTask(
      "Bishop",
      "",
      "./assets/",
      "bishop.babylon"
    );
    var importKnight = assetsManager.addMeshTask(
      "Knight",
      "",
      "./assets/",
      "knight.babylon"
    );
    var importRook = assetsManager.addMeshTask(
      "Rook",
      "",
      "./assets/",
      "rook.babylon"
    );
    var importQueen = assetsManager.addMeshTask(
      "Queen",
      "",
      "./assets/",
      "queen.babylon"
    );
    var importKing = assetsManager.addMeshTask(
      "King",
      "",
      "./assets/",
      "king.babylon"
    );

    importSword.onSuccess = (task) => {
      var sword = task.loadedMeshes[0];
      sword.parent = null;
      sword.name = "Sword";
      container.meshes.push(sword);
    };

    importScepter.onSuccess = (task) => {
      var scepter = task.loadedMeshes[0];
      scepter.parent = null;
      scepter.name = "Scepter";
      container.meshes.push(scepter);
    };

    importShield.onSuccess = (task) => {
      var shield = task.loadedMeshes[0];
      shield.parent = null;
      shield.name = "Shield";
      container.meshes.push(shield);
    };

    importStaff.onSuccess = (task) => {
      var staff = task.loadedMeshes[0];
      staff.parent = null;
      staff.name = "Staff";
      container.meshes.push(staff);
    };

    importSpear.onSuccess = (task) => {
      var spear = task.loadedMeshes[0];
      spear.parent = null;
      spear.name = "Spear";
      container.meshes.push(spear);
    };

    importChessboard.onSuccess = (task) => {
      var decoration = task.loadedMeshes[0];
      var board = task.loadedMeshes[1];
      decoration.parent = null;
      decoration.name = "BoardDecoration";
      board.parent = null;
      board.name = "Board";
      container.meshes.push(decoration);
      container.meshes.push(board);
    };

    importPawn.onSuccess = (task) => {
      var skeleton = task.loadedSkeletons[0];
      var pawn = task.loadedMeshes[0];
      pawn.scaling = unitScale;
      skeleton.scaling = unitScale;
      container.meshes.push(pawn, skeleton);
    };

    importKnight.onSuccess = (task) => {
      var skeleton = task.loadedSkeletons[0];
      var knight = task.loadedMeshes[0];
      knight.scaling = unitScale;
      skeleton.scaling = unitScale;
      container.meshes.push(knight);
    };

    importBishop.onSuccess = (task) => {
      var skeleton = task.loadedSkeletons[0];
      var bishop = task.loadedMeshes[0];
      bishop.scaling = unitScale;
      skeleton.scaling = unitScale;
      container.meshes.push(bishop);
    };

    importRook.onSuccess = (task) => {
      var skeleton = task.loadedSkeletons[0];
      var rook = task.loadedMeshes[0];
      rook.scaling = unitScale;
      skeleton.scaling = unitScale;
      container.meshes.push(rook);
    };

    importQueen.onSuccess = (task) => {
      var skeleton = task.loadedSkeletons[0];
      var queen = task.loadedMeshes[0];
      queen.scaling = unitScale;
      skeleton.scaling = unitScale;
      container.meshes.push(queen);
    };

    importKing.onSuccess = (task) => {
      var skeleton = task.loadedSkeletons[0];
      var king = task.loadedMeshes[0];
      king.scaling = unitScale;
      skeleton.scaling = unitScale;
      container.meshes.push(king);
    };

    assetsManager.onFinish = (tasks) => {
      container.removeAllFromScene();
      resolve(container);
    };

    assetsManager.load();
  });
}
