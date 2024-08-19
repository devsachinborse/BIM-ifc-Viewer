import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";

const container = document.getElementById("container")!;
const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);

const world = worlds.create<
  OBC.SimpleScene,
  OBC.SimpleCamera,
  OBC.SimpleRenderer
>();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBC.SimpleRenderer(components, container);
world.camera = new OBC.SimpleCamera(components);

components.init();

world.scene.three.background = null;

// const material = new THREE.MeshLambertMaterial({ color: "#6528D7" });
// const geometry = new THREE.BoxGeometry();
// const cube = new THREE.Mesh(geometry, material);
// world.scene.three.add(cube);

world.scene.setup();
world.camera.controls.setLookAt(12, 5, 10, 0, 0, 0);

//creating grid
const grid = components.get(OBC.Grids);
grid.create(world);

//loading beam model(fragnent converted model)
const fragment = components.get(OBC.FragmentsManager);
const file = await fetch(
  "https://thatopen.github.io/engine_components/resources/small.frag"
);
const data = await file.arrayBuffer();
const buffer = new Uint8Array(data);
const model = fragment.load(buffer);
world.scene.three.add(model);

//<<<<enc loading fragment model >>>>>>

//creation of bonding box
const fragmentBox = components.get(OBC.BoundingBoxer);
fragmentBox.add(model);

// Reading the Bounding Box data
const bbox = fragmentBox.getMesh();
fragmentBox.reset();

const stats = new Stats();
stats.showPanel(2);
document.body.append(stats.dom);
stats.dom.style.left = "0px";
stats.dom.style.zIndex = "unset";
world.renderer.onBeforeUpdate.add(() => stats.begin());
world.renderer.onAfterUpdate.add(() => stats.end());

BUI.Manager.init();

const panel = BUI.Component.create<BUI.PanelSection>(() => {
  return BUI.html`
    <bim-panel label="Worlds Tutorial"  class="options-menu">
      <bim-panel-section collapsed label="Controls">

        <bim-color-input
          label="Background Color" color="#202932"
          @input="${({ target }: { target: BUI.ColorInput }) => {
            world.scene.three.background = new THREE.Color(target.color);
          }}">
        </bim-color-input>

        <bim-number-input
          slider step="0.1" label="Directional lights intensity" value="1.5" min="0.1" max="10"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            for (const child of world.scene.three.children) {
              if (child instanceof THREE.DirectionalLight) {
                child.intensity = target.value;
              }
            }
          }}">
        </bim-number-input>

        <bim-number-input
          slider step="0.1" label="Ambient light intensity" value="1" min="0.1" max="5"
          @change="${({ target }: { target: BUI.NumberInput }) => {
            for (const child of world.scene.three.children) {
              if (child instanceof THREE.AmbientLight) {
                child.intensity = target.value;
              }
            }
          }}">
        </bim-number-input>
       

      </bim-panel-section>

      <hr>
        <bim-button 
          label="Fit BIM model" 
          @click="${() => {
            world.camera.controls.fitToSphere(bbox, true);
          }}">  
        </bim-button>  
    </bim-panel>
    `;
});

document.body.append(panel);

//boudnign box

const button = BUI.Component.create<BUI.PanelSection>(() => {
  return BUI.html`
      <bim-button class="phone-menu-toggler" icon="solar:settings-bold"
        @click="${() => {
          if (panel.classList.contains("options-menu-visible")) {
            panel.classList.remove("options-menu-visible");
          } else {
            panel.classList.add("options-menu-visible");
          }
        }}">
      </bim-button>
    `;
});

document.body.append(button);
