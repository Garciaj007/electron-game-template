import './index.css';

import * as THREE from 'three';
import anime from 'animejs';
import * as Matter from 'matter-js';
import * as Tone from 'tone/tone';

import { remote } from 'electron';
import { EffectComposer as THREE_EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass as THREE_RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass as THREE_BloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export class Utils {
    static random(x: number, y: number): number {
        return Math.random() * (y - x) + x;
    }
    static vectorConvert(arr: Array<THREE.Vector2> | Array<Matter.Vector>): Array<THREE.Vector2> | Array<Matter.Vector> {
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

export class Graphics {
    static instance: Graphics = new Graphics();

    resolution?: THREE.Vector2;
    renderer?: THREE.WebGLRenderer;
    composer?: THREE_EffectComposer;

    private constructor() {
        this.resolution = new THREE.Vector2(remote.getCurrentWindow().getSize()[0], remote.getCurrentWindow().getSize()[1]);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.resolution.x, this.resolution.y);
        this.renderer.domElement.setAttribute("id", "main");
        document.body.appendChild(this.renderer.domElement);

        this.composer = new THREE_EffectComposer(this.renderer);
    }

    resize(resize?: THREE.Vector2) {
        this.resolution = resize;
        this.renderer.setSize(resize.x, resize.y);
        this.composer.setSize(resize.x, resize.y);
    }
}

export class Physics {
    static instance?: Physics = new Physics();

    engine?: Matter.Engine;
    world?: Matter.World;

    private constructor() {
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        Matter.Engine.run(this.engine);
    }

    static setWorld(world: Matter.World) {
        Physics.instance.engine.world = world;
        Physics.instance.world = Physics.instance.engine.world;
    }
}

const _defaults = {
    geometry: new THREE.CircleGeometry(1, 20),
    wireframeMat: new THREE.MeshBasicMaterial({ color: 0x444444, wireframe: true }),
    basicMat: new THREE.MeshBasicMaterial({ color:0xffffff })
}

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
        private static decompEntities = (world: World): Entity[] => [...world.entities.values()];

        public static instance: World = new World();
        public static getEntities = (t: any, world: World = World.instance): Entity[] => World.decompEntities(world).filter(entity => entity.hasComponent(t));
        public static getComponents = <T>(t: any, world: World = World.instance): T[] => flatten(World.decompEntities(world).filter(entity => entity.hasComponent(t)).map(entity => entity.getComponents(t)), 1);

        private entities: Map<EntityId, Entity>;

        public physicsWorld: Matter.World;
        public rootScene: THREE.Scene;

        constructor(rootScene: THREE.Scene = new THREE.Scene(), entities: Map<EntityId, Entity> = new Map<EntityId, Entity>(), physicsWorld: Matter.World = Physics.instance.engine.world) {
            this.rootScene = rootScene;
            this.entities = entities;
            this.physicsWorld = physicsWorld;
        }

        makeInstance = () => { World.instance = this; Physics.setWorld(this.physicsWorld) };
        addEntity = (entity: Entity) => this.entities.set(entity.getId(), entity);
        getEntity = (id: EntityId) => this.entities.has(id) ? this.entities.get(id) : null;
        destroyEntity = (id: EntityId) => this.entities.delete(id);

        attachToScene(attacher: Components.Render | Components.Transform | Components.Rigidbody | Entity) {
            if (attacher instanceof Entity)
                attacher.getAllComponents().forEach(component => this.attachToScene(component))
            else if (attacher instanceof Components.Transform)
                this.rootScene.add(attacher.transform);
            else if (attacher instanceof Components.Render)
                this.rootScene.add(attacher.mesh);
            else if (attacher instanceof Components.Rigidbody)
                Matter.World.add(this.physicsWorld, attacher.body);
        }

        dettachFromScene(detacher: Components.Render | Components.Transform | Components.Rigidbody | Entity) {
            if (detacher instanceof Entity)
                detacher.getAllComponents().forEach(component => this.dettachFromScene(component));
            else if (detacher instanceof Components.Transform)
                this.rootScene.remove(detacher.transform);
            else if (detacher instanceof Components.Render)
                this.rootScene.remove(detacher.mesh);
            else if (detacher instanceof Components.Rigidbody)
                Matter.World.remove(this.physicsWorld, detacher.body);
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
        getAllComponents = (): Array<any> => this.components;

        createComponent<T>(t: any, ...args: any[]): T {
            let component = new t(...args);
            this.components.push(component);
            return component;
        }

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
        //#region Simple Components
        export class Position implements Component {
            constructor(public position = new THREE.Vector3()) {}
        }

        export class Velocity implements Component {
            constructor(public velocity = new THREE.Vector3()) {}
        }

        export class Rotation implements Component {
            constructor(public rotation = new THREE.Quaternion()){}
        }

        export class MeshFilter implements Component {
            constructor(public meshFilter?: number) {}
        }
        //#endregion

        //#region Complex Components
        export class Transform implements Component {
            constructor(public transform: THREE.Object3D = new THREE.Object3D()) {}
        }

        export class Render implements Component {
            constructor(public mesh?: THREE.Mesh) {}
        }

        export class Rigidbody implements Component {
            constructor(public body?: Matter.Body) {}
        }
        //#endregion
    }

    export namespace Systems {
        export function Render() {
            // Renders All
            Graphics.instance.composer.render();
        }

        export function Velocity()
        {
            let velocityBodies = World.getEntities(Components.Velocity);
            for(let entity of velocityBodies) {
                let vel = entity.getComponent<Components.Velocity>(Components.Velocity);
                let render = entity.getComponent<Components.Render>(Components.Render);
                if(render.mesh != null) render.mesh.position.add(vel.velocity);
            }
        }

        export function Rigidbody() {
            let rigidEntities = World.getEntities(Components.Rigidbody);
            for (let entity of rigidEntities) {
                
                let rigid = entity.getComponent<Components.Rigidbody>(Components.Rigidbody);
                
                if (rigid.body != null) {
                    let object3d = entity.getComponent<Components.Render>(Components.Render) || entity.getComponent<Components.Transform>(Components.Transform);

                    if (object3d instanceof Components.Render && object3d.mesh != null)
                        object3d.mesh.position.set(rigid.body.position.x, rigid.body.position.y, object3d.mesh.position.z);
                    else if (object3d instanceof Components.Transform && object3d.transform != null)
                        object3d.transform.position.set(rigid.body.position.x, rigid.body.position.y, object3d.transform.position.z);
                }
            }
        }
    }

    export namespace Archetypes {

        export interface IShapeDefinition {
            /**
             * @property shape
             * @type THREE.Shape
             */
            shape?: THREE.Shape;
            /**
             * @property material
             * @type THREE.Material
             * @default _defaults.basicMat
             */
            material?: THREE.Material;
        }

        export interface IRigidShapeDefinition extends IShapeDefinition {
            /**
             * @property physics
             * @type Matter.IBodyDefinition
             */
            physics?: Matter.IBodyDefinition;
        }

        export function CreateShape(args: IShapeDefinition): Entity {
            var entity = new Entity();
            var geometry = new THREE.ShapeBufferGeometry(args.shape);
            entity.createComponent(Components.Render, new THREE.Mesh(geometry, args.material));
            return entity;
        }

        export function CreateRigidShape(args: IRigidShapeDefinition): Entity {
            var entity = new Entity();
            var geometry = new THREE.ShapeGeometry(args.shape);
            console.log(geometry.vertices);
            entity.createComponent(Components.Render, new THREE.Mesh(geometry, args.material));
            var rigidComponent = entity.createComponent<Components.Rigidbody>(Components.Rigidbody, Matter.Body.create(args.physics));
            rigidComponent.body.vertices = Matter.Vertices.create(geometry.vertices, rigidComponent.body);
            return entity;
        }
    }
}

export namespace Shapes
{
    export function Triangle(a?: THREE.Vector2, b?: THREE.Vector2, c?: THREE.Vector2): THREE.Shape
    {
        return new THREE.Shape().moveTo(a.x, a.y).lineTo(b.x, b.y)
                                .lineTo(c.x, c.y).lineTo(a.x, a.y);
    } 

    export function EqualTriangle(size: number): THREE.Shape
    {
        return Triangle(new THREE.Vector2(-1, -1).normalize().multiplyScalar(size),
                        new THREE.Vector2( 1, -1).normalize().multiplyScalar(size),
                        new THREE.Vector2( 0,  0.5).multiplyScalar(size));
    }

    export function Rectangle(a?: THREE.Vector2 | number, b?: THREE.Vector2 | number, c?: THREE.Vector2, d?: THREE.Vector2): THREE.Shape
    {
        if (typeof a == 'number' && typeof b == 'number')
        {
            return Rectangle(new THREE.Vector2(-0.5, -0.5).multiply(new THREE.Vector2(a, b)),
                             new THREE.Vector2( 0.5, -0.5).multiply(new THREE.Vector2(a, b)),
                             new THREE.Vector2( 0.5,  0.5).multiply(new THREE.Vector2(a, b)),
                             new THREE.Vector2(-0.5,  0.5).multiply(new THREE.Vector2(a, b)));
        }
        else if (a instanceof THREE.Vector2 && b instanceof THREE.Vector2)
        {
            return new THREE.Shape().moveTo(a.x, a.y).lineTo(b.x, b.y)
                                    .lineTo(c.x, c.y).lineTo(d.x, d.y)
                                    .lineTo(d.x, d.y);
        }
    }

    export function Square(size: number): THREE.Shape { return Rectangle(size, size); }

    export function Capsule(w: number, h: number): THREE.Shape
    {
        return new THREE.Shape().moveTo(-w/2, -h/2).lineTo(-w/2, h/2)
                                .absarc(0, h/2, w/2, Math.PI, 0, true)
                                .lineTo(w/2, -h/2)
                                .absarc(0, -h/2, w/2, 2 * Math.PI, Math.PI, true)
    }
}

//#region Deprecated COM-Based Shapes

//  Shape Might Change to Component Object Model Architecture 
class Shape {
    mesh: THREE.Mesh;
    constructor() { }
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
    constructor(radius: number, position: THREE.Vector2, physics?: Matter.IBodyDefinition, material: THREE.Material = _defaults.basicMat) {
        super(physics);
        let geometry = new THREE.CircleGeometry(radius, 24);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, 0);
        this.physicsBody = Matter.Bodies.circle(position.x, position.y, radius);
    }
}

class Polygon extends PhysicsShape {
    constructor(points: Array<THREE.Vector2>, position: THREE.Vector2, physics?: Matter.IBodyDefinition, material: THREE.Material = _defaults.basicMat) {
        super(physics);
        let shape = new THREE.Shape(points);
        let geometry = new THREE.ShapeGeometry(shape);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, 0);
        this.physicsBody = Matter.Body.create({});
        this.physicsBody.vertices = Matter.Vertices.create(points, this.physicsBody);
    }
}
//#endregion

var camera: THREE.PerspectiveCamera;

const params = {
    exposure: 1,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 0,
}

function init() {

    camera = new THREE.PerspectiveCamera(70, Graphics.instance.resolution.x / Graphics.instance.resolution.y, 0.01, 100);
    camera.position.z = 40;

    Physics.instance.world.gravity.scale = -0.00001;

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

    // console.time();
    // for(let i = 0; i < 10000; i++)
    // {
    //     var entity = new ECS.Entity();
    //     entity.createComponent(ECS.Components.Render, new THREE.Mesh(new THREE.CircleBufferGeometry(1, 32), _defaults.basicMat));
    //     entity.createComponent(ECS.Components.Velocity, new THREE.Vector3(Utils.random(-2, 2), Utils.random(-1, 1)));
    //     //entity.createComponent(ECS.Components.Rigidbody, Matter.Bodies.circle(Utils.random(-40, 40), Utils.random(500, 0), 1));
    //     ECS.World.instance.attachToScene(entity);
    // }
    // console.timeEnd();

    var groundEntity = ECS.Archetypes.CreateRigidShape({shape: Shapes.Rectangle(50, 2)});
    var rc = groundEntity.getComponent<ECS.Components.Rigidbody>(ECS.Components.Rigidbody);
    rc.body.position.y = -20;
    Matter.Body.setStatic(rc.body, true);
    ECS.World.instance.attachToScene(groundEntity);

    ECS.World.instance.attachToScene(ECS.Archetypes.CreateRigidShape({shape: Shapes.Square(4)}));

    var synth = new Tone.Synth();
    synth.toMaster();
    synth.triggerAttackRelease(new Tone.Frequency('C4'), new Tone.Time('8n'));

    Graphics.instance.composer.addPass(
        new THREE_RenderPass(ECS.World.instance.rootScene, camera)
    );
    Graphics.instance.composer.addPass(
        new THREE_BloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.bloomStrength, params.bloomRadius, params.bloomThreshold)
    );
}

function draw() {
    requestAnimationFrame(draw);

    ECS.Systems.Rigidbody();
    ECS.Systems.Velocity();
    ECS.Systems.Render();
}

function resize() {
    var size = new THREE.Vector2(remote.getCurrentWindow().getSize()[0], remote.getCurrentWindow().getSize()[1]);

    camera.aspect = size.x / size.y;
    camera.updateProjectionMatrix();

    Graphics.instance.resize(size);
}

init();
draw();

remote.getCurrentWindow().on("resize", resize);
