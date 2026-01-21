import * as CANNON from "cannon-es";
import * as THREE from "three";

export function createTrimeshFromMesh(mesh) {
    //return createCannonShapeFromMesh(mesh);

    const vertices = [];
    const indices = [];
    const tmpScale = new THREE.Vector3();

    mesh.updateWorldMatrix(true, true);

    mesh.traverse((child) => {
        if (!child.isMesh) return;

        const geom = child.geometry.index
            ? child.geometry
            : child.geometry.toNonIndexed();

        const pos = geom.attributes.position.array;
        const idx = geom.index?.array;

        const baseIndex = vertices.length / 3;

        // world scale
        child.getWorldScale(tmpScale);

        // vertices
        for (let i = 0; i < pos.length; i += 3) {
            vertices.push(pos[i] * tmpScale.x, pos[i + 1] * tmpScale.y, pos[i + 2] * tmpScale.z);
        }

        // indices
        if (idx) {
            for (let i = 0; i < idx.length; i += 3) {
                indices.push(idx[i] + baseIndex, idx[i + 1] + baseIndex, idx[i + 2] + baseIndex);
            }
        } else {
            for (let i = 0; i < pos.length / 3; i += 3) {
                indices.push(baseIndex + i, baseIndex + i + 1, baseIndex + i + 2);
            }
        }
    });

    var temp = new CANNON.Trimesh(vertices, indices);

    temp.collisionResponse = true;
    return temp;
}

export function createCannonShapeFromMesh(mesh, options = {}) {
    const { dynamic = true } = options;
    const vertices = [];
    const indices = [];
    const tmpScale = new THREE.Vector3();

    mesh.updateWorldMatrix(true, true);

    mesh.traverse((child) => {
        if (!child.isMesh) return;

        const geom = child.geometry.index
            ? child.geometry
            : child.geometry.toNonIndexed();

        const pos = geom.attributes.position.array;
        const idx = geom.index?.array;

        const baseIndex = vertices.length / 3;

        // world scale
        child.getWorldScale(tmpScale);

        // vertices
        for (let i = 0; i < pos.length; i += 3) {
            vertices.push(pos[i] * tmpScale.x, pos[i + 1] * tmpScale.y, pos[i + 2] * tmpScale.z);
        }

        // indices
        if (idx) {
            for (let i = 0; i < idx.length; i += 3) {
                indices.push(baseIndex + idx[i], baseIndex + idx[i + 1], baseIndex + idx[i + 2]);
            }
        } else {
            for (let i = 0; i < pos.length / 3; i += 3) {
                indices.push(baseIndex + i, baseIndex + i + 1, baseIndex + i + 2);
            }
        }
    });

    // ConvexPolyhedron for dynamic bodies → stable
    if (dynamic) {
        try {
            const points = [];
            for (let i = 0; i < vertices.length; i += 3) {
                points.push(new CANNON.Vec3(vertices[i], vertices[i + 1], vertices[i + 2]));
            }

            const faces = [];
            for (let i = 0; i < indices.length; i += 3) {
                faces.push([indices[i], indices[i + 1], indices[i + 2]]);
            }

            return new CANNON.ConvexPolyhedron({ vertices: points, faces });
        } catch (e) {
            console.warn("ConvexPolyhedron creation failed, falling back to Trimesh:", e);
        }
    }

    // Fallback: Trimesh (good for static meshes)
    return new CANNON.Trimesh(vertices, indices);
}
