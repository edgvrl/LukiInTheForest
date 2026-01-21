import * as CANNON from "cannon-es";

export function createConvexPolyhedron(mesh) {
    let vertices = [];
    let faces = [];

    // Traverse all geometries inside mesh
    mesh.traverse((child) => {
        if (child.isMesh) {
            const geom = child.geometry.clone();
            geom.applyMatrix4(child.matrixWorld); // apply world transform

            const position = geom.attributes.position.array;
            const index = geom.index ? geom.index.array : null;

            const vertOffset = vertices.length;

            // Add vertices
            for (let i = 0; i < position.length; i += 3) {
                vertices.push(new CANNON.Vec3(position[i], position[i + 1], position[i + 2]));
            }

            // Add faces
            if (index) {
                for (let i = 0; i < index.length; i += 3) {
                    faces.push([index[i] + vertOffset, index[i + 1] + vertOffset, index[i + 2] + vertOffset]);
                }
            } else {
                for (let i = 0; i < position.length / 3; i += 3) {
                    faces.push([vertOffset + i, vertOffset + i + 1, vertOffset + i + 2]);
                }
            }
        }
    });

    // Create the Cannon ConvexPolyhedron
    return new CANNON.ConvexPolyhedron({ vertices, faces });
}