import { InputController } from './input'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as THREE from 'three'

export class FirstPersonCamera {
    camera;
    input;
    controls;
    blocker;
    instructions;
    speed;
    objects;
    raycaster;

    constructor(camera: THREE.PerspectiveCamera, blocker: HTMLElement, instructions: HTMLElement, scene: THREE.Scene, objects: THREE.Object3D<THREE.Object3DEventMap>[]) {
        this.camera = camera;
        camera.lookAt(-1, 0, 0);

        this.input = new InputController();
        const pointerLockControls = new PointerLockControls(camera, document.body);
        this.controls = pointerLockControls;
        this.controls.getObject().position.set(5, 0, -16);
        this.blocker = blocker;
        this.instructions = instructions;
        instructions.addEventListener('click', function() {
            pointerLockControls.lock();
        });
        this.controls.addEventListener('lock', function() {
            instructions.style.display = 'none';
            blocker.style.display = 'none';
        });
        this.controls.addEventListener('unlock', function() {
            blocker.style.display = 'block';
            instructions.style.display = '';
        });
        scene.add(this.controls.getObject());

        this.speed = 10;
        this.objects = objects;
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0, 0.5);
    }

    position(): THREE.Vector3 {
        return this.controls.getObject().position;
    }

    addCollisionObject(object: THREE.Object3D<THREE.Object3DEventMap>) {
        this.objects.push(object);
    }

    update(timeElapsedS: number) {
        if (this.controls.isLocked === true) {
            const forwardVelocity = (this.input.key('w') ? 1 : 0) + (this.input.key('s') ? -1 : 0)
            const strafeVelocity = (this.input.key('d') ? 1 : 0) + (this.input.key('a') ? -1 : 0)
            const velocity = new THREE.Vector3(forwardVelocity, 0, strafeVelocity);
            velocity.normalize();

            this.raycaster.ray.origin.copy(this.position());
            const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), velocity);
            this.controls.getObject().getWorldDirection(this.raycaster.ray.direction);
            this.raycaster.ray.direction.y = 0;
            this.raycaster.ray.direction.normalize();
            this.raycaster.ray.direction.applyQuaternion(rotation);

            const intersections = this.raycaster.intersectObjects(this.objects, false);
            if (intersections.length == 0) {
                this.controls.moveForward(velocity.x * timeElapsedS * this.speed);
                this.controls.moveRight(velocity.z * timeElapsedS * this.speed);
            }
        }
    }
}
