//import AssetsImport from "./assetImport.js";

export async function engineInit() {
  return new Promise((resolve, reject) => {
    var canvas = document.getElementById("renderCanvas");

    // Flash shader

    BABYLON.Effect.ShadersStore["flashFragmentShader"] = `
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform float flashIntensity;
    uniform vec3 color;

    void main(void) {
        vec4 baseColor = texture2D(textureSampler, vUV);
        gl_FragColor = mix(baseColor, vec4(color, 1.0), flashIntensity);
    }
`;

    var engine = new BABYLON.Engine(canvas, true, {
      //preserveDrawingBuffer: true,
      //stencil: true,
      disableWebGL2Support: false,
    });
    window.engine = engine;

    var createScene = function () {
      // This is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
      BABYLON.Animation.AllowMatricesInterpolation = true;

      // This creates a basic Babylon Scene object (non-mesh)
      var scene = new BABYLON.Scene(engine);
      let options = {
        //sizeAuto: true,
        skyboxSize: 100, // Size of the skybox
        groundSize: 100, // Size of the ground
        skyboxColor: new BABYLON.Color3(0.25, 0.5, 1), // Color of the skybox
        groundColor: new BABYLON.Color3(0.05, 0.05, 0.15), // Color of the ground
        cameraExposure: 1,
        enableGroundShadow: false, // Enable shadows from the ground
        rootPosition: new BABYLON.Vector3(0, -2, 0),
        toneMappingEnabled: true,
        //groundYBias: 1, // Ground bias
      };
      var env = scene.createDefaultEnvironment(options);
      scene.environmentIntensity = 2;

      var envBRDFTexture = new BABYLON.Texture(
        "./assets/correlatedMSBRDF_RGBD.png",
        scene,
        true,
        true,
        BABYLON.Texture.BILINEAR_SAMPLINGMODE
      );

      var skyboxTexture = new BABYLON.CubeTexture("./assets/skybox.dds", scene);
      skyboxTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      env.skybox.material.reflectionTexture = skyboxTexture;

      envBRDFTexture.isRGBD = true;
      envBRDFTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
      envBRDFTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
      scene.environmentBRDFTexture = envBRDFTexture;

      var camera = new BABYLON.ArcRotateCamera(
        "camera",
        BABYLON.Tools.ToRadians(90),
        BABYLON.Tools.ToRadians(65),
        10,
        BABYLON.Vector3.Zero(),
        scene
      );

      camera.lowerRadiusLimit = 10; // The minimum distance from the target (zoomed in)
      camera.upperRadiusLimit = 40; // The maximum distance from the target (zoomed out)
      //camera.lowerAlphaLimit = 0;
      //camera.upperAlphaLimit = 0;
      camera.lowerBetaLimit = 0.1; // To prevent the camera from being exactly above the target
      camera.upperBetaLimit = Math.PI / 2.2; // Half circle around the target in vertical direction
      camera.panningDistanceLimit = 0; // The maximum distance the target could be panned

      // This attaches the camera to the canvas
      camera.attachControl(canvas, true);

      // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
      var light = new BABYLON.DirectionalLight(
        "light",
        new BABYLON.Vector3(0, -15, -5),
        scene
      );

      // Default intensity is 1. Let's dim the light a small amount
      light.position = new BABYLON.Vector3(0, 6, 0);
      light.intensity = 5;

      return scene;
    };

    var scene = createScene();
    window.scene = scene;

    resolve([engine, scene]);
  });
}
