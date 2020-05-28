"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
require("./index.css");
var THREE = __importStar(require("three"));
var Matter = __importStar(require("matter-js"));
var Tone = __importStar(require("tone/tone"));
var electron_1 = require("electron");
var EffectComposer_1 = require("three/examples/jsm/postprocessing/EffectComposer");
var RenderPass_1 = require("three/examples/jsm/postprocessing/RenderPass");
var UnrealBloomPass_1 = require("three/examples/jsm/postprocessing/UnrealBloomPass");
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.random = function (x, y) {
        return Math.random() * (y - x) + x;
    };
    Utils.vectorConvert = function (arr) {
        var e_1, _a, e_2, _b;
        if (arr[0] instanceof THREE.Vector2) {
            var temp = [];
            try {
                for (var arr_1 = __values(arr), arr_1_1 = arr_1.next(); !arr_1_1.done; arr_1_1 = arr_1.next()) {
                    var elem = arr_1_1.value;
                    temp.push(Matter.Vector.create(elem.x, elem.y));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (arr_1_1 && !arr_1_1.done && (_a = arr_1["return"])) _a.call(arr_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return temp;
        }
        else {
            var temp = [];
            try {
                for (var arr_2 = __values(arr), arr_2_1 = arr_2.next(); !arr_2_1.done; arr_2_1 = arr_2.next()) {
                    var elem = arr_2_1.value;
                    temp.push(new THREE.Vector2(elem.x, elem.y));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (arr_2_1 && !arr_2_1.done && (_b = arr_2["return"])) _b.call(arr_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return temp;
        }
    };
    return Utils;
}());
;
var _defaults = {
    geometry: new THREE.CircleGeometry(1, 20),
    material: new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
};
// Component Model Architecure
// Component    -> Contains a Constuctor and an Update Method();
// Renderable   -> Renders Component to Threejs
// Rigidbody    -> Physics Component updates everyframe from Matterjs
var ECS;
(function (ECS) {
    function flatten(array, depth) {
        var array_1, array_1_1, item, e_3_1;
        var e_3, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (depth === undefined) {
                        depth = 1;
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, 9, 10]);
                    array_1 = __values(array), array_1_1 = array_1.next();
                    _b.label = 2;
                case 2:
                    if (!!array_1_1.done) return [3 /*break*/, 7];
                    item = array_1_1.value;
                    if (!(Array.isArray(item) && depth > 0)) return [3 /*break*/, 4];
                    return [5 /*yield**/, __values(flatten(item, depth - 1))];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, item];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    array_1_1 = array_1.next();
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_3_1 = _b.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (array_1_1 && !array_1_1.done && (_a = array_1["return"])) _a.call(array_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }
    var World = /** @class */ (function () {
        function World(entities) {
            var _this = this;
            if (entities === void 0) { entities = new Map(); }
            this["default"] = function () { return World.instance = _this; };
            this.addEntity = function (entity) { return _this.entities.set(entity.getId(), entity); };
            this.getEntity = function (id) { return _this.entities.has(id) ? _this.entities.get(id) : null; };
            this.destroyEntity = function (id) { return _this.entities["delete"](id); };
            this.entities = entities;
        }
        World.instance = new World();
        World.getEntities = function (t, world) {
            if (world === void 0) { world = World.instance; }
            return World.decompEntities(world).filter(function (entity) { return entity.hasComponent(t); });
        };
        World.getComponents = function (t, world) {
            if (world === void 0) { world = World.instance; }
            return flatten(World.decompEntities(world).filter(function (entity) { return entity.hasComponent(t); }).map(function (entity) { return entity.getComponents(t); }), 1);
        };
        World.decompEntities = function (world) { return __spread(world.entities.values()); };
        return World;
    }());
    ECS.World = World;
    var Entity = /** @class */ (function () {
        function Entity(world) {
            var _this = this;
            if (world === void 0) { world = World.instance; }
            this.id = "";
            this.components = new Array();
            this.getId = function () { return _this.id; };
            this.id = (+new Date()).toString(16) + (Math.random() * 100000000 | 0).toString(16) + ++Entity._idCount;
            world.addEntity(this);
        }
        Entity.prototype.addComponent = function (c) {
            this.components.push(c);
            return c;
        };
        Entity.prototype.getComponent = function (t, index) {
            if (index === void 0) { index = 0; }
            return this.getComponents(t)[index];
        };
        Entity.prototype.getComponents = function (t) {
            return this.components.filter(function (component) { return component instanceof t; });
        };
        Entity.prototype.hasComponent = function (t) {
            return this.components.some(function (component) { return component instanceof t; });
        };
        Entity.prototype.removeComponent = function (t, index) {
            if (index === void 0) { index = 0; }
            var component = this.getComponent(t, index);
            if (component != null) {
                this.components.splice(this.components.indexOf(component));
                return true;
            }
            return false;
        };
        Entity.prototype.serialize = function () {
            return JSON.stringify(this, null, 4);
        };
        Entity.prototype.print = function () {
            console.log(this.serialize());
        };
        Entity._idCount = 0;
        return Entity;
    }());
    ECS.Entity = Entity;
    var Components;
    (function (Components) {
        var Render = /** @class */ (function () {
            function Render() {
            }
            return Render;
        }());
        Components.Render = Render;
        var Rigidbody = /** @class */ (function () {
            function Rigidbody() {
            }
            return Rigidbody;
        }());
        Components.Rigidbody = Rigidbody;
    })(Components = ECS.Components || (ECS.Components = {}));
    var Systems;
    (function (Systems) {
        function Render() {
            var e_4, _a;
            var renderEntities = World.getEntities(Components.Render);
            try {
                for (var renderEntities_1 = __values(renderEntities), renderEntities_1_1 = renderEntities_1.next(); !renderEntities_1_1.done; renderEntities_1_1 = renderEntities_1.next()) {
                    var entity = renderEntities_1_1.value;
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (renderEntities_1_1 && !renderEntities_1_1.done && (_a = renderEntities_1["return"])) _a.call(renderEntities_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        Systems.Render = Render;
        function Physics() {
            var e_5, _a;
            var rigidEntities = World.getEntities(Components.Rigidbody);
            try {
                for (var rigidEntities_1 = __values(rigidEntities), rigidEntities_1_1 = rigidEntities_1.next(); !rigidEntities_1_1.done; rigidEntities_1_1 = rigidEntities_1.next()) {
                    var entity = rigidEntities_1_1.value;
                    var rigid = entity.getComponent(Components.Rigidbody);
                    var render = entity.getComponent(Components.Render);
                    if (render.mesh != null) {
                        render.mesh.position.set(rigid.body.position.x, rigid.body.position.y, 0);
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (rigidEntities_1_1 && !rigidEntities_1_1.done && (_a = rigidEntities_1["return"])) _a.call(rigidEntities_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
        Systems.Physics = Physics;
    })(Systems = ECS.Systems || (ECS.Systems = {}));
    var Archetypes;
    (function (Archetypes) {
        var RenderShapeParameter = /** @class */ (function () {
            function RenderShapeParameter(geometry, material, position) {
                if (geometry === void 0) { geometry = _defaults.geometry; }
                if (material === void 0) { material = _defaults.material; }
                this.geometry = geometry;
                this.material = material;
                this.position = position;
            }
            return RenderShapeParameter;
        }());
        Archetypes.RenderShapeParameter = RenderShapeParameter;
        function RenderShape(renderShapeParams) {
            var entity = new Entity();
            var render = entity.addComponent(Components.Render);
            render.mesh = new THREE.Mesh(renderShapeParams.geometry, renderShapeParams.material);
            render.mesh.position.set(renderShapeParams.position.x, renderShapeParams.position.y, renderShapeParams.position.z);
            return entity;
        }
        Archetypes.RenderShape = RenderShape;
        //  Eliminate this function?
        // export function RigidShape(rigidbodyProperties?: Matter.IBodyDefinition, renderShapeParams?: RenderShapeParameter) : Entity {
        //     var entity = RenderShape(renderShapeParams);
        //     var rigid = entity.addComponent<Components.Rigidbody>(Components.Rigidbody);
        //     var render = entity.getComponent<Components.Render>(Components.Render);
        //     rigid.body = Matter.Body.create(rigidbodyProperties);
        //     render.mesh.position.set(rigidbodyProperties.position.x, rigidbodyProperties.position.y, 0);
        //     return entity;
        // }
        function RigidCircle(radius, rigidbodyProperties, material, sortingLayer) {
            var entity = RenderShape(new RenderShapeParameter(new THREE.CircleGeometry(radius, 24), material, new THREE.Vector3(rigidbodyProperties.position.x, rigidbodyProperties.position.y, sortingLayer)));
            var rigid = entity.addComponent(Components.Rigidbody);
            rigid.body = Matter.Bodies.circle(rigidbodyProperties.position.x, rigidbodyProperties.position.y, radius, rigidbodyProperties);
            return entity;
        }
        Archetypes.RigidCircle = RigidCircle;
        function RigidPolygon(radius, rigidbodyProperties, material, sortingLayer) {
            var entity = RenderShape(new RenderShapeParameter(new THREE.CircleGeometry(radius, 24), material, new THREE.Vector3(rigidbodyProperties.position.x, rigidbodyProperties.position.y, sortingLayer)));
            var rigid = entity.addComponent(Components.Rigidbody);
            rigid.body = Matter.Bodies.circle(rigidbodyProperties.position.x, rigidbodyProperties.position.y, radius, rigidbodyProperties);
            return entity;
        }
        Archetypes.RigidPolygon = RigidPolygon;
    })(Archetypes = ECS.Archetypes || (ECS.Archetypes = {}));
})(ECS || (ECS = {}));
//  Shape Might Change to Component Object Model Architecture 
var Shape = /** @class */ (function () {
    function Shape() {
        var _this = this;
        this.update = function () { };
        this.setLayerIndex = function (layer) { return _this.mesh.position.z = layer; };
        shapes.push(this);
    }
    return Shape;
}());
//  Physics Shape Extends Shape
//  Allows For Matterjs Physics
var PhysicsShape = /** @class */ (function (_super) {
    __extends(PhysicsShape, _super);
    function PhysicsShape(physics) {
        var _this = _super.call(this) || this;
        _this.update = function () {
            _this.mesh.position.set(_this.physicsBody.position.x, _this.physicsBody.position.y, 0);
        };
        _this.physicsBody = Matter.Body.create(physics);
        return _this;
    }
    return PhysicsShape;
}(Shape));
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(radius, position, physics, material) {
        if (material === void 0) { material = _defaults.material; }
        var _this = _super.call(this, physics) || this;
        var geometry = new THREE.CircleGeometry(radius, 24);
        _this.mesh = new THREE.Mesh(geometry, material);
        _this.mesh.position.set(position.x, position.y, 0);
        _this.physicsBody = Matter.Bodies.circle(position.x, position.y, radius);
        return _this;
    }
    return Circle;
}(PhysicsShape));
var Polygon = /** @class */ (function (_super) {
    __extends(Polygon, _super);
    function Polygon(points, position, physics, material) {
        if (material === void 0) { material = _defaults.material; }
        var _this = _super.call(this, physics) || this;
        var shape = new THREE.Shape(points);
        var geometry = new THREE.ShapeGeometry(shape);
        _this.mesh = new THREE.Mesh(geometry, material);
        _this.mesh.position.set(position.x, position.y, 0);
        _this.physicsBody = Matter.Body.create({});
        Matter.Vertices.create(points, _this.physicsBody);
        return _this;
    }
    return Polygon;
}(PhysicsShape));
var Rectangle = /** @class */ (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(size, position, physics, material) {
        if (material === void 0) { material = _defaults.material; }
        var _this = _super.call(this, physics) || this;
        var geometry = new THREE.BoxGeometry(size.x, size.y, 0.000001);
        _this.mesh = new THREE.Mesh(geometry, material);
        _this.mesh.position.set(position.x, position.y, 0);
        _this.physicsBody = Matter.Bodies.rectangle(position.x, position.y, size.x, size.y);
        return _this;
    }
    return Rectangle;
}(PhysicsShape));
var camera;
var scene;
var renderer;
var geometry;
var material;
var mesh;
var composer;
var appSize;
var engine;
var shapes = [];
var params = {
    exposure: 1,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 0
};
init();
draw();
function init() {
    appSize = new THREE.Vector2(electron_1.remote.getCurrentWindow().getSize()[0], electron_1.remote.getCurrentWindow().getSize()[1]);
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
    ], new THREE.Vector2(2, 0)).mesh);
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
    var renderPass = new RenderPass_1.RenderPass(scene, camera);
    var bloomPass = new UnrealBloomPass_1.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.bloomStrength, params.bloomRadius, params.bloomThreshold);
    composer = new EffectComposer_1.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    //ECS Experiment
    var entity = new ECS.Entity();
    entity.addComponent(new ECS.Components.Render());
    entity.addComponent(new ECS.Components.Rigidbody());
}
function draw() {
    var e_6, _a;
    requestAnimationFrame(draw);
    try {
        for (var shapes_1 = __values(shapes), shapes_1_1 = shapes_1.next(); !shapes_1_1.done; shapes_1_1 = shapes_1.next()) {
            var shape = shapes_1_1.value;
            shape.update();
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (shapes_1_1 && !shapes_1_1.done && (_a = shapes_1["return"])) _a.call(shapes_1);
        }
        finally { if (e_6) throw e_6.error; }
    }
    composer.render();
    // Trying ECS system
    ECS.Systems.Physics();
    ECS.Systems.Render();
}
electron_1.remote.getCurrentWindow().on("resize", function (e) {
    console.log(e);
    appSize = new THREE.Vector2(electron_1.remote.getCurrentWindow().getSize()[0], electron_1.remote.getCurrentWindow().getSize()[1]);
    camera.aspect = appSize.x / appSize.y;
    camera.updateProjectionMatrix();
    renderer.setSize(appSize.x, appSize.y);
    composer.setSize(appSize.x, appSize.y);
});
//# sourceMappingURL=renderer.js.map