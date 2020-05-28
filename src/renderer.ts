import './index.css';

import * as THREE from 'three';
import anime from 'animejs';
import * as Matter from 'matter-js';
import * as Tone from 'tone/tone';

import { remote, app } from 'electron';
import { EffectComposer as THREE_EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass as THREE_RenderPass, RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass as THREE_BloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { Pass as THREE_Pass } from 'three/examples/jsm/postprocessing/Pass';

export class Utils {
    static random(x: number, y: number): number {
        return Math.random() * (y - x) + x;
    }
    static vectorConvert (arr: Array<THREE.Vector2> | Array<Matter.Vector>): Array<THREE.Vector2> | Array<Matter.Vector> {
        if (arr[0] instanceof THREE.Vector2) {
            let temp: Array<Matter.Vector> = [];
            for (let elem of arr) temp.push(Matter.Vector.create(elem.x, elem.y));
            return temp;
        }
        else {
            let temp: Array<THREE.Vector2> = [];
            for (let elem of arr) temp.push(new THREE.Vector2(elem.x, elem.y));
            return temp;
        }
    }
};

export class GraphicsEngine {
    static instance: GraphicsEngine = new GraphicsEngine();
    
    resolution?: THREE.Vector2;
    renderer?: THREE.WebGLRenderer;
    composer?: THREE_EffectComposer;

    constructor()
    {
        this.resolution = new THREE.Vector2(remote.getCurrentWindow().getSize()[0], remote.getCurrentWindow().getSize()[1]);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.resolution.x, this.resolution.y);
        this.renderer.domElement.setAttribute("id", "main");
        document.body.appendChild(this.renderer.domElement);

        this.composer = new THREE_EffectComposer(this.renderer);
    }

    resize(resize?: THREE.Vector2)
    {
        this.resolution = resize;
        this.renderer.setSize(resize.x, resize.y);
        this.composer.setSize(resize.x, resize.y);
    }
}

const _defaults = {
    geometry: new THREE.CircleGeometry(1, 20),
    material: new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
}

// Component Model Architecure
// Component    -> Contains a Constuctor and an Update Method();
// Renderable   -> Renders Component to Threejs
// Rigidbody    -> Physics Component updates everyframe from Matterjs
namespace ECS {

    type EntityId = string;

    function* flatten(array: any, depth: number): any {
        if (depth === undefined) {
            depth = 1;
        }
        for (const item of array) {
            if (Array.isArray(item) && depth > 0) {
                yield* flatten(item, depth - 1);
            } else {
                yield item;
            }
        }
    }

    export class World {
        static instance: World = new World();

        static getEntities = (t: any, world: World = World.instance): Entity[] => World.decompEntities(world).filter(entity => entity.hasComponent(t));
        static getComponents = <T>(t: any, world: World = World.instance): T[] => flatten(World.decompEntities(world).filter(entity => entity.hasComponent(t)).map(entity => entity.getComponents(t)), 1);

        private static decompEntities = (world: World): Entity[] => [...world.entities.values()];

        private entities: Map<EntityId, Entity>;
        public  rootScene: THREE.Scene;

        constructor(rootScene: THREE.Scene = new THREE.Scene(), entities: Map<EntityId, Entity> = new Map<EntityId, Entity>()) {
            this.rootScene = rootScene;
            this.entities = entities;
        }

        makeInstance = () => World.instance = this;
        addEntity = (entity: Entity) => this.entities.set(entity.getId(), entity);
        getEntity = (id: EntityId) => this.entities.has(id) ? this.entities.get(id) : null;
        destroyEntity = (id: EntityId) => this.entities.delete(id);
        attachToScene(component: Components.Render | Components.Transform) {
            if(component instanceof Components.Transform)
                this.rootScene.add(component.transform);
            else if (component instanceof Components.Render)
                this.rootScene.add(component.mesh);
        }
        dettachFromScene(component: Components.Render | Components.Transform) {
            if(component instanceof Components.Transform)
                this.rootScene.remove(component.transform);
            else if (component instanceof Components.Render)
                this.rootScene.remove(component.mesh);
        }
    }

    export class Entity {
        private static _idCount: number = 0;

        private id: EntityId = "";
        private components: Array<any> = new Array<any>();

        constructor(world: World = World.instance) {
            this.id = (+new Date()).toString(16) + (Math.random() * 100000000 | 0).toString(16) + ++Entity._idCount;
            world.addEntity(this);
        }

        getId = () => this.id;

        addComponent<T>(c: any): T {
            this.components.push(c);
            return c;
        }

        getComponent<T>(t: any, index: number = 0): T {
            return this.getComponents<T>(t)[index];
        }

        getComponents<T>(t: any): Array<T> {
            return this.components.filter((component) => component instanceof t);
        }

        hasComponent(t: any): boolean {
            return this.components.some((component) => component instanceof t);
        }

        removeComponent(t: any, index: number = 0): boolean {
            var component = this.getComponent(t, index);
            if (component != null) {
                this.components.splice(this.components.indexOf(component));
                return true;
            }
            return false;
        }

        serialize(): string {
            return JSON.stringify(this, null, 4);
        }

        print() {
            console.log(this.serialize());
        }
    }

    export interface Component { }

    export namespace Components {
        export class Transform implements Component {
            transform?: THREE.Object3D;
        }

        export class Render implements Component {
            mesh?: THREE.Mesh;
        }

        export class Rigidbody implements Component {
            body?: Matter.Body;
        }
    }

    export namespace Systems {
        export function Render() {
            let renderEntities = World.getEntities(Components.Render);
            for (var entity of renderEntities) {

            }
            GraphicsEngine.instance.composer.render();
        }

        export function Rigidbody() {
            let rigidEntities = World.getEntities(Components.Rigidbody);
            for (let entity of rigidEntities) {
                let rigid = entity.getComponent<Components.Rigidbody>(Components.Rigidbody);
                let object3d = entity.getComponent<Components.Render>(Components.Render) || 
                             entity.getComponent<Components.Transform>(Components.Transform);
                if (object3d instanceof Components.Render && object3d.mesh != null) 
                    object3d.mesh.position.set(rigid.body.position.x, rigid.body.position.y, object3d.mesh.position.z);
                else if(object3d instanceof Components.Transform && object3d.transform != null)
                    object3d.transform.position.set(rigid.body.position.x, rigid.body.position.y, object3d.transform.position.z);

            }
        }
    }

    export namespace Archetypes {
        export class RenderShapeParameter {
            geometry: THREE.Geometry;
            material: THREE.Material;
            position: THREE.Vector3;
            constructor(geometry: THREE.Geometry = _defaults.geometry, material: THREE.Material = _defaults.material, position: THREE.Vector3 = new THREE.Vector3()) {
                this.geometry = geometry;
                this.material = material;
                this.position = position;
            }
        }

        export function RenderShape(renderShapeParams?: RenderShapeParameter): Entity {
            var entity = new Entity();
            var render = entity.addComponent<Components.Render>(Components.Render);
            render.mesh = new THREE.Mesh(renderShapeParams.geometry, renderShapeParams.material);
            render.mesh.position.set(renderShapeParams.position.x, renderShapeParams.position.y, renderShapeParams.position.z);
            return entity;
        }

        export function RigidShape(rigidbodyProperties?: Matter.IBodyDefinition, renderShapeParams?: RenderShapeParameter): Entity {
            var entity = RenderShape(renderShapeParams);
            var rigid = entity.addComponent<Components.Rigidbody>(Components.Rigidbody);
            var render = entity.getComponent<Components.Render>(Components.Render);
            rigid.body = Matter.Body.create(rigidbodyProperties);
            render.mesh.position.set(rigidbodyProperties.position.x, rigidbodyProperties.position.y, 0);
            return entity;
        }

        // export function RigidCircle(radius: number, rigidbodyProperties?: Matter.IBodyDefinition, material?: THREE.Material, sortingLayer?: number): Entity {
        //     var entity = RenderShape(new RenderShapeParameter(new THREE.CircleGeometry(radius, 24), material, new THREE.Vector3(rigidbodyProperties.position.x, rigidbodyProperties.position.y, sortingLayer)));
        //     var rigid = entity.addComponent<Components.Rigidbody>(Components.Rigidbody);
        //     rigid.body = Matter.Bodies.circle(rigidbodyProperties.position.x, rigidbodyProperties.position.y, radius, rigidbodyProperties);
        //     return entity;
        // }

        // export function RigidPolygon(radius: number, rigidbodyProperties?: Matter.IBodyDefinition, material?: THREE.Material, sortingLayer?: number): Entity {
        //     var entity = RenderShape(new RenderShapeParameter(new THREE.CircleGeometry(radius, 24), material, new THREE.Vector3(rigidbodyProperties.position.x, rigidbodyProperties.position.y, sortingLayer)));
        //     var rigid = entity.addComponent<Components.Rigidbody>(Components.Rigidbody);
        //     rigid.body = Matter.Bodies.circle(rigidbodyProperties.position.x, rigidbodyProperties.position.y, radius, rigidbodyProperties);
        //     return entity;
        // }
    }
}

//#region Deprecated COM-Based Shapes

//  Shape Might Change to Component Object Model Architecture 
class Shape {
    mesh: THREE.Mesh;
    constructor() { shapes.push(this); }
    update = () => { }
    setLayerIndex = (layer: number) => this.mesh.position.z = layer;
}

//  Physics Shape Extends Shape
//  Allows For Matterjs Physics
class PhysicsShape extends Shape {
    physicsBody: Matter.Body;
    constructor(physics: Matter.IBodyDefinition) {
        super();
        this.physicsBody = Matter.Body.create(physics);
    }
    update = () => {
        this.mesh.position.set(this.physicsBody.position.x, this.physicsBody.position.y, 0);
    }
}

class Circle extends PhysicsShape {
    constructor(radius: number, position: THREE.Vector2, physics?: Matter.IBodyDefinition, material: THREE.Material = _defaults.material) {
        super(physics);
        let geometry = new THREE.CircleGeometry(radius, 24);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, 0);
        this.physicsBody = Matter.Bodies.circle(position.x, position.y, radius);
    }
}

class Polygon extends PhysicsShape {
    constructor(points: Array<THREE.Vector2>, position: THREE.Vector2, physics?: Matter.IBodyDefinition, material: THREE.Material = _defaults.material) {
        super(physics);
        let shape = new THREE.Shape(points);
        let geometry = new THREE.ShapeGeometry(shape);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, 0);
        this.physicsBody = Matter.Body.create({});
        Matter.Vertices.create(points, this.physicsBody);
    }
}
//#endregion

var camera: THREE.PerspectiveCamera;
//var scene: THREE.Scene;
//var renderer: THREE.WebGLRenderer;
//var composer: THREE_EffectComposer;
//var appSize: THREE.Vector2;

var engine: Matter.Engine;

var shapes: Array<Shape> = [];

const params = {
    exposure: 1,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 0,
}

function init() {
    //appSize = new THREE.Vector2(remote.getCurrentWindow().getSize()[0], remote.getCurrentWindow().getSize()[1]);

    // renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setSize(appSize.x, appSize.y);
    // renderer.domElement.setAttribute("id", "main");
    // document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, GraphicsEngine.instance.resolution.x / GraphicsEngine.instance.resolution.y, 0.01, 100);
    camera.position.z = 5;

    //scene = new THREE.Scene();

    engine = Matter.Engine.create();
    Matter.Engine.run(engine);
    engine.world.gravity.scale = 1;

    // scene.add(new Circle(1, new THREE.Vector2(-2, 0)).mesh);
    // scene.add(new Polygon([
    //     new THREE.Vector2(-1, -1),
    //     new THREE.Vector2(1, -1),
    //     new THREE.Vector2(1, 1),
    //     new THREE.Vector2(-1, 1)
    // ], new THREE.Vector2(2, 0)).mesh);

    //#region Anime Experimentation
    // anime({
    //     targets: mesh.scale,
    //     keyframes: [{
    //             x: Math.random() * 3 + 2,
    //             y: Math.random() * 3 + 2,
    //             z: Math.random() * 2
    //         },
    //         {
    //             x: Math.random() * 3 + 2,
    //             y: Math.random() * 3 + 2,
    //             z: Math.random() * 2
    //         },
    //         {
    //             x: Math.random() * 3 + 2,
    //             y: Math.random() * 3 + 2,
    //             z: Math.random() * 2
    //         },
    //         {
    //             x: Math.random() * 3 + 2,
    //             y: Math.random() * 3 + 2,
    //             z: Math.random() * 2
    //         },
    //         {
    //             x: Math.random() * 3 + 2,
    //             y: Math.random() * 3 + 2,
    //             z: Math.random() * 2
    //         },
    //         {
    //             x: Math.random() * 3 + 2,
    //             y: Math.random() * 3 + 2,
    //             z: Math.random() * 2
    //         },
    //         {
    //             x: Math.random() * 3 + 2,
    //             y: Math.random() * 3 + 2,
    //             z: Math.random() * 2
    //         },
    //         {
    //             x: Math.random() * 3 + 2,
    //             y: Math.random() * 3 + 2,
    //             z: Math.random() * 2
    //         },
    //         {
    //             x: Math.random() * 3 + 2,
    //             y: Math.random() * 3 + 2,
    //             z: Math.random() * 2
    //         },
    //     ],
    //     duration: 4500,
    //     easing: 'easeInOutCirc',
    //     loop: true,
    //     direction: 'alternate'
    // });
    //#endregion

    var entity = ECS.Archetypes.RigidShape(Matter.Bodies.circle(-2, 0, 1), new ECS.Archetypes.RenderShapeParameter(new THREE.CircleGeometry(1, 24)));

    var synth = new Tone.Synth();
    synth.toMaster();
    synth.triggerAttackRelease(new Tone.Frequency('C4'), new Tone.Time('8n'));

    GraphicsEngine.instance.composer.addPass(
        new THREE_RenderPass(ECS.World.instance.rootScene, camera)
    );
    GraphicsEngine.instance.composer.addPass(
        new THREE_BloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.bloomStrength, params.bloomRadius, params.bloomThreshold)
    );

    //var renderPass = new THREE_RenderPass(scene, camera);
    //var bloomPass = new THREE_BloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.bloomStrength, params.bloomRadius, params.bloomThreshold);
    //composer = new THREE_EffectComposer(renderer);
    //composer.addPass(renderPass);
    //composer.addPass(bloomPass);
}

function draw() {
    requestAnimationFrame(draw);

    // Trying ECS system
    ECS.Systems.Rigidbody();
    ECS.Systems.Render();
}

function resize() {
    var size = new THREE.Vector2(remote.getCurrentWindow().getSize()[0], remote.getCurrentWindow().getSize()[1]);
    
    camera.aspect = size.x / size.y;
    camera.updateProjectionMatrix();

    GraphicsEngine.instance.resize(size);
    // renderer.setSize(size.x, size.y);
    // composer.setSize(size.x, size.y);
}

init();
draw();

remote.getCurrentWindow().on("resize", resize);
