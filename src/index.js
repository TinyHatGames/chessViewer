import * as Engine from "./engineInit.js";
import * as GameInit from "./gameInit.js";
import * as GameFunctions from "./gameFunctions.js";
import testpgn from "./testpgn.pgn";
import { Pgn } from "./cm-pgn/src/Pgn.js";

var pgn = new Pgn(testpgn);
var engine = null;
var scene = null;

Engine.engineInit().then((engineOutput) => {
  GameInit.setupBoard(pgn).then((gameInitOutput) => {
    GameFunctions.startRefresh(pgn);
    GameFunctions.initControls(gameInitOutput[0], gameInitOutput[1]);
    engine = engineOutput[0];
    scene = engineOutput[1];
    window.addEventListener("resize", function () {
      engine.resize();
    });
    engine.runRenderLoop(function () {
      scene.render();
    });
    BABYLON.Inspector.Show(scene, {});
  });
});
