import './index.css';

import * as THREE from 'three';
import anime from 'animejs';
import * as Matter from 'matter-js';
import * as Tone from 'tone/tone';

import { remote } from 'electron';
import { EffectComposer as THREE_EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass as THREE_RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass as THREE_BloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { Material } from 'three';

class Utils {
    static random = (x: number, y: number): number => {
        return Math.random() * (y - x) + x;
    }
    static vectorConvert = (arr: Array<THREE.Vector2> | Array<Matter.Vector>): Array<THREE.Vector2> | Array<Matter.Vector> => {
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
            
        private static decompEntities = (world: World) : Entity[] => [...world.entities.values()];
        
        private entities: Map<EntityId, Entity>;

        constructor(entities: Map<EntityId, Entity> = new Map<EntityId, Entity>()) {
            this.entities = entities;
        }

        default = () => World.instance = this;
        addEntity = (entity: Entity) => this.entities.set(entity.getId(), entity);
        getEntity = (id: EntityId) => this.entities.has(id) ? this.entities.get(id) : null;
        destroyEntity = (id: EntityId) => this.entities.delete(id);
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
        export class Render implements Component {
            mesh: THREE.Mesh;
        }
    
        export class Rigidbody implements Component {
            body: Matter.Body;
        }
    }
    
    export namespace Systems {
        export function Render() {
            let renderEntities = World.getEntities(Components.Render);
            for (var entity of renderEntities) {
    
            }
        }
    
        export function Physics(){
            let rigidEntities = World.getEntities(Components.Rigidbody);
            for (let entity of rigidEntities) {
                let rigid = entity.getComponent<Components.Rigidbody>(Components.Rigidbody);
                let render = entity.getComponent<Components.Render>(Components.Render);
                if(render != null) {
                    render.mesh.position.set(rigid.body.position.x, rigid.body.position.y, 0);
                }
            }
        }
    }

    export namespace Archetypes {
        export class RenderShapeParameter {
            geometry: THREE.Geometry;
            material: THREE.Material;
            position: THREE.Vector3;
            constructor(geometry: THREE.Geometry = _defaults.geometry, material: THREE.Material = _defaults.material, position?: THREE.Vector3){
                this.geometry = geometry;
                this.material = material;
                this.position = position;
            }
        }

        export function RenderShape(renderShapeParams?: RenderShapeParameter) : Entity{
            var entity = new Entity();
            var render = entity.addComponent<Components.Render>(Components.Render);
            render.mesh = new THREE.Mesh(renderShapeParams.geometry, renderShapeParams.material);
            render.mesh.position.set(renderShapeParams.position.x, renderShapeParams.position.y, renderShapeParams.position.z);
            return entity;
        }

        //  Eliminate this function?
        // export function RigidShape(rigidbodyProperties?: Matter.IBodyDefinition, renderShapeParams?: RenderShapeParameter) : Entity {
        //     var entity = RenderShape(renderShapeParams);
        //     var rigid = entity.addComponent<Components.Rigidbody>(Components.Rigidbody);
        //     var render = entity.getComponent<Components.Render>(Components.Render);
        //     rigid.body = Matter.Body.create(rigidbodyProperties);
        //     render.mesh.position.set(rigidbodyProperties.position.x, rigidbodyProperties.position.y, 0);
        //     return entity;
        // }

        export function RigidCircle(radius: number, rigidbodyProperties?: Matter.IBodyDefinition, material?: THREE.Material, sortingLayer?: number) : Entity {
            var entity = RenderShape(new RenderShapeParameter(new THREE.CircleGeometry(radius, 24), material, new THREE.Vector3(rigidbodyProperties.position.x, rigidbodyProperties.position.y, sortingLayer)));
            var rigid = entity.addComponent<Components.Rigidbody>(Components.Rigidbody);
            rigid.body = Matter.Bodies.circle(rigidbodyProperties.position.x, rigidbodyProperties.position.y, radius, rigidbodyProperties);
            return entity;
        }

        export function RigidPolygon(radius: number, rigidbodyProperties?: Matter.IBodyDefinition, material?: THREE.Material, sortingLayer?: number) : Entity {
            var entity = RenderShape(new RenderShapeParameter(new THREE.CircleGeometry(radius, 24), material, new THREE.Vector3(rigidbodyProperties.position.x, rigidbodyProperties.position.y, sortingLayer)));
            var rigid = entity.addComponent<Components.Rigidbody>(Components.Rigidbody);
            rigid.body = Matter.Bodies.circle(rigidbodyProperties.position.x, rigidbodyProperties.position.y, radius, rigidbodyProperties);
            return entity;
        }
    }
}


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

class Rectangle extends PhysicsShape {
    constructor(size: THREE.Vector2, position: THREE.Vector2, physics?: Matter.IBodyDefinition, material: THREE.Material = _defaults.material) {
        super(physics);
        let geometry = new THREE.BoxGeometry(size.x, size.y, 0.000001);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, 0);
        this.physicsBody = Matter.Bodies.rectangle(position.x, position.y, size.x, size.y);
    }
}

var camera: THREE.PerspectiveCamera;
var scene: THREE.Scene;
var renderer: THREE.WebGLRenderer;
var geometry: THREE.Geometry;
var material: THREE.Material;
var mesh: THREE.Mesh;
var composer: THREE_EffectComposer;
var appSize: THREE.Vector2;

var engine: Matter.Engine;

var shapes: Array<Shape> = [];

const params = {
    exposure: 1,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 0,
}

init();
draw();

function init() {
    appSize = new THREE.Vector2(remote.getCurrentWindow().getSize()[0], remote.getCurrentWindow().getSize()[1]);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(appSize.x, appSize.y);
    renderer.domElement.setAttribute("id", "main");
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, appSize.x / appSize.y, 0.01, 100);
    camera.position.z = 5;

    scene = new THREE.Scene();

    engine = Matter.Engine.create();
    Matter.Engine.run(engine);
    engine.world.gravity.scale = 1;

    scene.add(new Circle(1, new THREE.Vector2(-2, 0)).mesh);
    scene.add(new Polygon([
        new THREE.Vector2(-1, -1),
        new THREE.Vector2(1, -1),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(-1, 1)
    ],  new THREE.Vector2(2, 0)).mesh);
    //scene.add(new Rectangle(new THREE.Vector2(2, 2), new THREE.Vector2(3, 0)).mesh);

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

    var synth = new Tone.Synth();
    synth.toMaster();
    synth.triggerAttackRelease(new Tone.Frequency('C4'), new Tone.Time('8n'));

    var renderPass = new THREE_RenderPass(scene, camera);
    var bloomPass = new THREE_BloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.bloomStrength, params.bloomRadius, params.bloomThreshold);
    composer = new THREE_EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    //ECS Experiment
    var entity = new ECS.Entity();
    entity.addComponent(new ECS.Components.Render());
    entity.addComponent(new ECS.Components.Rigidbody());
}

function draw() {
    requestAnimationFrame(draw);
    for (var shape of shapes) shape.update();
    composer.render();

    // Trying ECS system
    ECS.Systems.Physics();
    ECS.Systems.Render();
}

remote.getCurrentWindow().on("resize", () => {
    appSize = new THREE.Vector2(remote.getCurrentWindow().getSize()[0], remote.getCurrentWindow().getSize()[1]);

    camera.aspect = appSize.x / appSize.y;
    camera.updateProjectionMatrix();

    renderer.setSize(appSize.x, appSize.y);
    composer.setSize(appSize.x, appSize.y);
});
