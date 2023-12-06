import * as THREE from 'three'

export default class UserVisualization {
    pool: THREE.Mesh[] = [];
    idx: number = 0;
    geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>;
    material: THREE.Material;
    scene: THREE.Scene;
    offset: THREE.Vector3

    constructor(geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>, material: THREE.Material, scene: THREE.Scene, offset: THREE.Vector3 = new THREE.Vector3()) {
        this.geometry = geometry;
        this.material = material;
        this.scene = scene;
        this.offset = offset;
    }

    placeUser(x: number, y: number) {
        if (this.pool.length >= this.idx)
            this.pool.push(new THREE.Mesh(this.geometry, this.material));

        const mesh = this.pool[this.idx++];
        this.scene.add(mesh);
        mesh.position.set(x + this.offset.x, this.offset.y, y + this.offset.z);
    }

    resetPlacing() {
        this.idx = 0;

        this.pool.forEach(mesh => {
            this.scene.remove(mesh);
        });
    }
}